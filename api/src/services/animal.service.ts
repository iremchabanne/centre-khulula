// Animals, and the operation the whole project is built around: admission.
//
// THE PROBLEM. Two keepers, one free enclosure, both press "Admit". Each reads
// "E-09 is free", both get yes, both insert — and the centre believes two
// animals live in one enclosure. The check was right and the result is wrong.
//
// Three defences, deliberately different in nature:
//   1. TRANSACTION — animal and stay are created together or not at all (RG2).
//   2. SELECT ... FOR UPDATE — the second transaction waits for the first,
//      then reads the enclosure as occupied and gives up. Race becomes queue.
//   3. The partial unique index of migration 20260822100651 — PostgreSQL
//      refuses a second open stay even if the lock were forgotten.

import {
  Prisma,
  type PrismaClient,
  type EnclosureStatus,
  type EnclosureType,
  type AnimalStatus,
} from '@prisma/client';
import { AppError } from '../errors';
import { pageQuery, pageResult } from '../pagination';
import { forgetFreeEnclosures } from '../cache';
import type {
  CreateAdmissionInput,
  RecordOutcomeInput,
  MoveAnimalInput,
  ListAnimalsQuery,
  ListStaffAnimalsQuery,
  CreateObservationInput,
} from '../schemas';

// Prisma reports "a unique constraint was violated" as the code P2002.
function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export class AnimalService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // The public list of animals — screen 4, no account needed.
  //
  // A visitor never sees `deceased` animals, the enclosure, the admission
  // reason or the outcome note: those are staff information (RG11). The fields
  // are therefore named one by one in `select`, so a column added later cannot
  // leak by accident.
  async findPublicList(query: ListAnimalsQuery) {
    // The three clinical states a visitor sees as one. The centre needs the
    // distinction, someone reading the site does not.
    const inCare: AnimalStatus[] = ['admitted', 'in_care', 'recovering'];

    const statuses = query.status === 'released' ? (['released'] as AnimalStatus[]) : inCare;

    const where = { status: { in: statuses } };

    const animals = await this.prisma.animal.findMany({
      where,
      // Newest first: the animals arrived — or released — most recently are
      // the ones a visitor came to see.
      orderBy: { admitted_at: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        admitted_at: true,
        outcome_at: true,
        species: { select: { id: true, common_name: true } },
      },
      ...pageQuery(query.page),
    });

    // Counted with the same `where`, so the two can never describe different
    // lists. This is the number the interface needs to draw "page 2 of 5".
    const total = await this.prisma.animal.count({ where });

    return pageResult(animals, total, query.page);
  }

  // The staff list of animals — screen 9.
  //
  // Separate from the public list rather than the same method with a flag: the
  // two differ in what they show and in who may see it, and a single method
  // deciding that from an argument is how a field ends up on a public page by
  // accident.
  async findStaffList(query: ListStaffAnimalsQuery) {
    // No filter at all means the whole centre, which is how the screen opens.
    // Each criterion is added only when it was sent.
    const where: Prisma.AnimalWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.species_id) {
      where.species_id = query.species_id;
    }

    if (query.search) {
      // `contains` becomes a parameterised LIKE, so a name full of quotes is
      // searched for, never executed. insensitive: "nala" finds "Nala".
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    if (query.admitted_from || query.admitted_to) {
      // A date arrives at midnight, so "up to 1 July" would drop everything
      // admitted that day. Compare with the day after instead.
      let dayAfter: Date | undefined;
      if (query.admitted_to) {
        dayAfter = new Date(query.admitted_to);
        dayAfter.setDate(dayAfter.getDate() + 1);
      }

      where.admitted_at = { gte: query.admitted_from, lt: dayAfter };
    }

    const animals = await this.prisma.animal.findMany({
      where,
      orderBy: { admitted_at: 'desc' },
      include: {
        species: { select: { id: true, common_name: true } },
        // The open stay is where the animal is now. There is at most one.
        stays: {
          where: { ended_at: null },
          include: { enclosure: { select: { id: true, code: true } } },
        },
      },
      ...pageQuery(query.page),
    });

    const total = await this.prisma.animal.count({ where });

    // Same flattening as EnclosureService.findAll: a list that can only hold
    // one element becomes a single field, so the screen does not reason about
    // an array. An animal that has been released is in no enclosure at all.
    const items = animals.map((animal) => {
      const openStay = animal.stays[0];

      return {
        id: animal.id,
        name: animal.name,
        status: animal.status,
        admitted_at: animal.admitted_at,
        outcome_at: animal.outcome_at,
        species: animal.species,
        enclosure: openStay ? openStay.enclosure : null,
      };
    });

    return pageResult(items, total, query.page);
  }

  // One animal, with everything screen 10 shows: where it is, where it has
  // been, and what has been written about it.
  //
  // Staff only, so unlike the public list this returns the enclosure, the
  // clinical status and the notes.
  async findById(animalId: number) {
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        species: { select: { id: true, common_name: true, scientific_name: true } },

        // Every stay, newest first. The open one — ended_at is null — is where
        // the animal is now; the others are where it has been.
        stays: {
          orderBy: { started_at: 'desc' },
          include: { enclosure: { select: { id: true, code: true } } },
        },

        observations: {
          orderBy: { observed_at: 'desc' },
          include: { author: { select: { id: true, full_name: true } } },
        },
      },
    });

    if (!animal) {
      throw new AppError(`No animal with id ${animalId}`, 404);
    }

    return animal;
  }

  // Add an observation, and move the animal on in its care if it says so — S5.
  //
  // One transaction, because it is one act: a crash between the two would leave
  // a status change nobody can explain, or a note about a change that never
  // happened.
  //
  // The observation table is append-only, enforced by the grants of migration
  // 20260822105239: what is written here cannot be rewritten later.
  async addObservation(animalId: number, input: CreateObservationInput, staffId: number) {
    const observedAt = new Date();

    return this.prisma.$transaction(async (tx) => {
      const animal = await tx.animal.findUnique({ where: { id: animalId } });

      if (!animal) {
        throw new AppError(`No animal with id ${animalId}`, 404);
      }

      if (input.status_after) {
        // RG5 — a terminal state is final, so nothing moves an animal out of
        // it. A plain note is still allowed below; it is the status change
        // that is refused.
        if (animal.status === 'released' || animal.status === 'deceased') {
          throw new AppError(`This animal is already ${animal.status}`, 409);
        }

        // RG4 — the lifecycle runs forwards: admitted, in_care, recovering.
        // An animal that is recovering does not go back to being admitted.
        const order = ['admitted', 'in_care', 'recovering'];

        if (order.indexOf(input.status_after) <= order.indexOf(animal.status)) {
          throw new AppError(
            `An animal that is ${animal.status} cannot go back to ${input.status_after}`,
            409,
          );
        }

        await tx.animal.update({
          where: { id: animalId },
          data: { status: input.status_after },
        });
      }

      return tx.observation.create({
        data: {
          animal_id: animalId,
          // The author is whoever is logged in, never a value from the body.
          author_id: staffId,
          observed_at: observedAt,
          body: input.body,
          status_after: input.status_after ?? null,
        },
        include: { author: { select: { id: true, full_name: true } } },
      });
    });
  }

  // Admit an animal into a free enclosure. All of it, or none of it.
  //
  // staffId comes from the session, never from the request body: the person
  // who opened the stay is the person who is logged in, and a caller must not
  // be able to record the admission under somebody else's name.
  async admit(input: CreateAdmissionInput, staffId: number) {
    // One timestamp for both rows, so the animal's admission and the start of
    // its stay are the same instant rather than two instants milliseconds
    // apart. The stored function that computes length of stay reads these.
    const admittedAt = new Date();

    const admission = await this.prisma.$transaction(async (tx) => {
      // Written as raw SQL because Prisma has no way to express FOR UPDATE.
      // The value is passed as a parameter by the tagged template, not glued
      // into the string, so this is not an SQL injection (OWASP A03).
      const rows = await tx.$queryRaw<
        { id: number; code: string; status: EnclosureStatus; type: EnclosureType }[]
      >`
        SELECT id, code, status, type
        FROM enclosure
        WHERE id = ${input.enclosure_id}
        FOR UPDATE
      `;

      const enclosure = rows[0];

      if (!enclosure) {
        throw new AppError(`No enclosure with id ${input.enclosure_id}`, 404);
      }

      // Re-read AFTER taking the lock, never before. The screen that offered
      // this enclosure may have been drawn a minute ago.
      if (enclosure.status !== 'free') {
        // 409 Conflict — this is the error screen 8 shows to the keeper who
        // arrived second. It is a normal outcome, not a bug.
        throw new AppError(`Enclosure ${enclosure.code} is no longer free`, 409);
      }

      const species = await tx.species.findUnique({ where: { id: input.species_id } });

      if (!species) {
        throw new AppError(`No species with id ${input.species_id}`, 404);
      }

      // RG17 — a jackal does not go in an aviary. The screen only offers
      // suitable enclosures; this is what refuses a request that skips it.
      if (species.enclosure_type !== enclosure.type) {
        throw new AppError(
          `A ${species.common_name} cannot be housed in enclosure ${enclosure.code}`,
          409,
        );
      }

      try {
        const animal = await tx.animal.create({
          data: {
            name: input.name,
            species_id: input.species_id,
            sex: input.sex,
            age_class: input.age_class,
            found_near: input.found_near ?? null,
            admission_reason: input.admission_reason,
            // The lifecycle always starts here — RG4. Not a value the caller
            // may choose.
            status: 'admitted',
            admitted_at: admittedAt,
          },
        });

        // Writing this row is what occupies the enclosure: the trigger on
        // `stay` recomputes enclosure.status (RG3). We never write it here.
        await tx.stay.create({
          data: {
            animal_id: animal.id,
            enclosure_id: input.enclosure_id,
            started_at: admittedAt,
            opened_by_id: staffId,
          },
        });

        return {
          id: animal.id,
          name: animal.name,
          status: animal.status,
          admitted_at: animal.admitted_at,
          enclosure: { id: enclosure.id, code: enclosure.code },
        };
      } catch (error) {
        // Reached only if the lock above was somehow not enough. The index did
        // the job instead, and the caller gets the same clean 409 rather than
        // a raw database error.
        if (isUniqueViolation(error)) {
          throw new AppError(`Enclosure ${enclosure.code} is no longer free`, 409);
        }

        throw error;
      }
    });

    // One enclosure fewer is free. Cleared AFTER the commit, never inside the
    // transaction: a reader arriving between the clear and the commit would
    // still see the enclosure as free and cache that, and the cache would be
    // wrong until it expired. If the transaction rolls back we never get here,
    // which is correct — nothing changed.
    await forgetFreeEnclosures();

    return admission;
  }

  // Move an animal to another enclosure — RG8.
  //
  // One transaction: if only the second half ran, the animal would be recorded
  // as living nowhere and both enclosures would read `free`.
  //
  // The old stay is closed FIRST. The other way round, the animal would briefly
  // have two open stays.
  async move(animalId: number, input: MoveAnimalInput, staffId: number) {
    const movedAt = new Date();

    const move = await this.prisma.$transaction(async (tx) => {
      // Same lock as an admission, for the same reason: the destination must
      // still be free when we write, not merely when the screen was drawn.
      //
      // Only the destination is locked here. Two moves that swap two
      // enclosures at the same instant can therefore deadlock — PostgreSQL
      // detects it and aborts one of them with an error rather than hanging.
      // Rare enough in a centre with ten enclosures to be left as is.
      const rows = await tx.$queryRaw<
        { id: number; code: string; status: EnclosureStatus; type: EnclosureType }[]
      >`
        SELECT id, code, status, type
        FROM enclosure
        WHERE id = ${input.enclosure_id}
        FOR UPDATE
      `;

      const destination = rows[0];

      if (!destination) {
        throw new AppError(`No enclosure with id ${input.enclosure_id}`, 404);
      }

      const animal = await tx.animal.findUnique({ where: { id: animalId } });

      if (!animal) {
        throw new AppError(`No animal with id ${animalId}`, 404);
      }

      // RG5 again — an animal that has left the centre is not moved around it.
      if (animal.status === 'released' || animal.status === 'deceased') {
        throw new AppError(`This animal is already ${animal.status}`, 409);
      }

      const currentStay = await tx.stay.findFirst({
        where: { animal_id: animalId, ended_at: null },
      });

      if (!currentStay) {
        throw new AppError('This animal is not currently in an enclosure', 409);
      }

      // Checked BEFORE the status of the destination, and the order matters.
      // An animal asked to move where it already is makes that enclosure
      // `occupied` — by itself. Testing the status first would answer "no
      // longer free", which is true and useless: the occupant IS the animal
      // being moved. This check has to come first to say anything sensible.
      if (currentStay.enclosure_id === input.enclosure_id) {
        throw new AppError(`This animal is already in ${destination.code}`, 409);
      }

      if (destination.status !== 'free') {
        throw new AppError(`Enclosure ${destination.code} is no longer free`, 409);
      }

      // RG17 — the destination has to suit the species, exactly as at admission.
      const species = await tx.species.findUnique({ where: { id: animal.species_id } });

      if (species && species.enclosure_type !== destination.type) {
        throw new AppError(
          `A ${species.common_name} cannot be housed in enclosure ${destination.code}`,
          409,
        );
      }

      // Closing this stay frees the enclosure the animal is leaving, through
      // the trigger. Opening the next one occupies the destination, through
      // the same trigger. We write neither status.
      await tx.stay.update({
        where: { id: currentStay.id },
        data: { ended_at: movedAt },
      });

      await tx.stay.create({
        data: {
          animal_id: animalId,
          enclosure_id: input.enclosure_id,
          started_at: movedAt,
          // Only a stay opened by a move carries a reason. An admission
          // leaves this column empty, which is how the two are told apart.
          move_reason: input.move_reason,
          opened_by_id: staffId,
        },
      });

      return {
        id: animal.id,
        name: animal.name,
        moved_at: movedAt,
        enclosure: { id: destination.id, code: destination.code },
      };
    });

    // A move changes two enclosures at once: the one left behind became free,
    // the destination became occupied. Same reason as an admission.
    await forgetFreeEnclosures();

    return move;
  }

  // Pronounce the outcome of an animal: released, or deceased.
  //
  // Three rules meet here, each enforced in a different layer:
  //   RG6 — veterinarian only: requireRole, on the route (it is about WHO).
  //   RG5 — terminal states are final: below (only this layer knows the state).
  //   RG7 — the outcome frees the enclosure: the trigger. We close the stay.
  //
  // staffId is the vet who pronounced it, taken from the session, never the body.
  async recordOutcome(animalId: number, input: RecordOutcomeInput, staffId: number) {
    const outcomeAt = new Date();

    const outcome = await this.prisma.$transaction(async (tx) => {
      const animal = await tx.animal.findUnique({ where: { id: animalId } });

      if (!animal) {
        throw new AppError(`No animal with id ${animalId}`, 404);
      }

      // RG5 — a terminal state is final. An animal that has been released does
      // not come back to being in care, and one recorded as deceased certainly
      // does not.
      if (animal.status === 'released' || animal.status === 'deceased') {
        throw new AppError(`This animal is already ${animal.status}`, 409);
      }

      // The three outcome columns are filled together, never one without the
      // others — modele-donnees.md.
      const updated = await tx.animal.update({
        where: { id: animalId },
        data: {
          status: input.outcome,
          outcome_at: outcomeAt,
          outcome_note: input.outcome_note,
          outcome_by_id: staffId,
        },
        select: { id: true, name: true, status: true, outcome_at: true },
      });

      // Closing the stay is what frees the enclosure: the trigger on `stay`
      // recomputes enclosure.status (RG7). We never write that column.
      //
      // updateMany and not update, because the search is on "the open stay of
      // this animal" rather than on a primary key. RG1 guarantees there is at
      // most one, and an animal whose stay was already closed by hand simply
      // updates nothing here instead of raising an error.
      await tx.stay.updateMany({
        where: { animal_id: animalId, ended_at: null },
        data: { ended_at: outcomeAt },
      });

      return updated;
    });

    // The stay was closed, so the trigger has just freed the enclosure.
    await forgetFreeEnclosures();

    return outcome;
  }
}
