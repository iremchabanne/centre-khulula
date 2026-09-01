// Animals, and the operation the whole project is built around: admission.
//
// Two keepers, one free enclosure, both press "Admit". Three defences stop the
// centre believing two animals live in one enclosure:
//   1. a transaction — animal and stay are created together or not at all (RG2);
//   2. SELECT ... FOR UPDATE — the second keeper waits, then reads "occupied";
//   3. the partial unique index of migration 20260822100651, as a last resort.

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

type LockedEnclosure = {
  id: number;
  code: string;
  status: EnclosureStatus;
  type: EnclosureType;
};

// Prisma reports "a unique constraint was violated" as the code P2002.
function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

// Raw SQL because Prisma cannot express FOR UPDATE. The id is passed as a
// parameter by the tagged template, never glued into the string (OWASP A03).
async function lockEnclosure(tx: Prisma.TransactionClient, enclosureId: number) {
  const rows = await tx.$queryRaw<LockedEnclosure[]>`
    SELECT id, code, status, type
    FROM enclosure
    WHERE id = ${enclosureId}
    FOR UPDATE
  `;

  return rows[0];
}

export class AnimalService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // The public list — screen 4, no account needed. The fields are listed one by
  // one so a column added later cannot leak to visitors (RG11).
  async findPublicList(query: ListAnimalsQuery) {
    // A visitor sees the three clinical states as one.
    const inCare: AnimalStatus[] = ['admitted', 'in_care', 'recovering'];

    let statuses: AnimalStatus[] = [...inCare, 'released'];

    if (query.status === 'released') {
      statuses = ['released'];
    }
    if (query.status === 'in_care') {
      statuses = inCare;
    }

    const where: Prisma.AnimalWhereInput = { status: { in: statuses } };

    if (query.species_id) {
      where.species_id = query.species_id;
    }

    const animals = await this.prisma.animal.findMany({
      where,
      orderBy: { admitted_at: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        admitted_at: true,
        outcome_at: true,
        admission_reason: true,
        // The photograph belongs to the species: the centre keeps none of each
        // individual animal.
        species: { select: { id: true, common_name: true, photo_url: true } },
      },
      ...pageQuery(query.page),
    });

    // Counted with the same `where`, so the two can never describe different lists.
    const total = await this.prisma.animal.count({ where });

    return pageResult(animals, total, query.page);
  }

  // The staff list — screen 9. A separate method rather than the public one with
  // a flag: that is how a hidden field ends up on a public page by accident.
  async findStaffList(query: ListStaffAnimalsQuery) {
    const where: Prisma.AnimalWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.species_id) {
      where.species_id = query.species_id;
    }

    if (query.search) {
      // `contains` becomes a parameterised LIKE, so a name full of quotes is
      // searched for, never executed.
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
        // The open stay is where the animal is now. There is at most one (RG1).
        stays: {
          where: { ended_at: null },
          include: { enclosure: { select: { id: true, code: true } } },
        },
      },
      ...pageQuery(query.page),
    });

    const total = await this.prisma.animal.count({ where });

    // The one-element list becomes a single field, so the screen does not have
    // to reason about an array. A released animal is in no enclosure at all.
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

  // One animal with everything screen 10 shows. Staff only, so this returns the
  // enclosure, the clinical status and the notes.
  async findById(animalId: number) {
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        species: { select: { id: true, common_name: true, scientific_name: true } },
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

  // Add an observation, and move the animal on in its care if it says so.
  // One transaction, because it is one act. The observation table is
  // append-only, enforced by the grants of migration 20260822105239.
  async addObservation(animalId: number, input: CreateObservationInput, staffId: number) {
    const observedAt = new Date();

    return this.prisma.$transaction(async (tx) => {
      const animal = await tx.animal.findUnique({ where: { id: animalId } });

      if (!animal) {
        throw new AppError(`No animal with id ${animalId}`, 404);
      }

      if (input.status_after) {
        // RG5 — a terminal state is final. A plain note is still allowed.
        if (animal.status === 'released' || animal.status === 'deceased') {
          throw new AppError(`This animal is already ${animal.status}`, 409);
        }

        // RG4 — an animal never returns to `admitted`, which is the moment it
        // arrived. Care itself goes both ways: one that is recovering can
        // relapse and be put back in care.
        if (input.status_after === animal.status) {
          throw new AppError(`This animal is already ${animal.status}`, 409);
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
  // staffId comes from the session, never from the body.
  async admit(input: CreateAdmissionInput, staffId: number) {
    // One timestamp for both rows: the stored function that computes length of
    // stay reads them.
    const admittedAt = new Date();

    const admission = await this.prisma.$transaction(async (tx) => {
      const enclosure = await lockEnclosure(tx, input.enclosure_id);

      if (!enclosure) {
        throw new AppError(`No enclosure with id ${input.enclosure_id}`, 404);
      }

      // Read after the lock, never before: the screen that offered this
      // enclosure may have been drawn a minute ago. 409 is what screen 8 shows
      // to the keeper who arrived second — a normal outcome, not a bug.
      if (enclosure.status !== 'free') {
        throw new AppError(`Enclosure ${enclosure.code} is no longer free`, 409);
      }

      const species = await tx.species.findUnique({ where: { id: input.species_id } });

      if (!species) {
        throw new AppError(`No species with id ${input.species_id}`, 404);
      }

      // RG17 — a jackal does not go in an aviary.
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
            // RG4 — the lifecycle always starts here, never a caller's choice.
            status: 'admitted',
            admitted_at: admittedAt,
          },
        });

        // Writing this row is what occupies the enclosure: the trigger on
        // `stay` recomputes enclosure.status (RG3). We never write it.
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
        // Reached only if the lock was somehow not enough: the index refused
        // the second stay, and the caller gets the same clean 409.
        if (isUniqueViolation(error)) {
          throw new AppError(`Enclosure ${enclosure.code} is no longer free`, 409);
        }

        throw error;
      }
    });

    // Cleared after the commit, never inside it: a reader arriving in between
    // would cache the enclosure as free.
    await forgetFreeEnclosures();

    return admission;
  }

  // Move an animal to another enclosure — RG8. The old stay is closed first,
  // or the animal would briefly have two open stays.
  async move(animalId: number, input: MoveAnimalInput, staffId: number) {
    const movedAt = new Date();

    const move = await this.prisma.$transaction(async (tx) => {
      // Only the destination is locked. Two moves swapping two enclosures at
      // the same instant can deadlock; PostgreSQL aborts one rather than
      // hanging, which is rare enough here to leave as is.
      const destination = await lockEnclosure(tx, input.enclosure_id);

      if (!destination) {
        throw new AppError(`No enclosure with id ${input.enclosure_id}`, 404);
      }

      const animal = await tx.animal.findUnique({ where: { id: animalId } });

      if (!animal) {
        throw new AppError(`No animal with id ${animalId}`, 404);
      }

      // RG5 — an animal that has left the centre is not moved around it.
      if (animal.status === 'released' || animal.status === 'deceased') {
        throw new AppError(`This animal is already ${animal.status}`, 409);
      }

      const currentStay = await tx.stay.findFirst({
        where: { animal_id: animalId, ended_at: null },
      });

      if (!currentStay) {
        throw new AppError('This animal is not currently in an enclosure', 409);
      }

      // Before the status check, and the order matters: an animal asked to move
      // where it already is occupies that enclosure itself, so "no longer free"
      // would be true and useless.
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

      // Closing one stay frees an enclosure and opening the next occupies the
      // other, both through the trigger. We write neither status.
      await tx.stay.update({
        where: { id: currentStay.id },
        data: { ended_at: movedAt },
      });

      await tx.stay.create({
        data: {
          animal_id: animalId,
          enclosure_id: input.enclosure_id,
          started_at: movedAt,
          // Only a stay opened by a move carries a reason; that is how a move
          // is told apart from an admission.
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

    // A move changes two enclosures at once.
    await forgetFreeEnclosures();

    return move;
  }

  // Pronounce the outcome: released, or deceased.
  //   RG6 — veterinarian only, enforced by requireRole on the route.
  //   RG5 — terminal states are final, enforced here.
  //   RG7 — the outcome frees the enclosure, done by the trigger.
  async recordOutcome(animalId: number, input: RecordOutcomeInput, staffId: number) {
    const outcomeAt = new Date();

    const outcome = await this.prisma.$transaction(async (tx) => {
      const animal = await tx.animal.findUnique({ where: { id: animalId } });

      if (!animal) {
        throw new AppError(`No animal with id ${animalId}`, 404);
      }

      if (animal.status === 'released' || animal.status === 'deceased') {
        throw new AppError(`This animal is already ${animal.status}`, 409);
      }

      // The three outcome columns are filled together — modele-donnees.md.
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

      // Closing the stay is what frees the enclosure (RG7). updateMany because
      // the search is "the open stay of this animal", not a primary key: an
      // animal whose stay was already closed simply updates nothing.
      await tx.stay.updateMany({
        where: { animal_id: animalId, ended_at: null },
        data: { ended_at: outcomeAt },
      });

      return updated;
    });

    await forgetFreeEnclosures();

    return outcome;
  }
}
