// Animals, and the operation the whole project is built around: admission.
//
// THE PROBLEM THIS FILE SOLVES, because it is the one the jury asks about.
//
// Two keepers are on screen 8 at the same time. One free enclosure is left.
// Both press "Admit". The naive code reads "is E-09 free?", both get yes,
// both insert, and the centre now believes two animals live in one enclosure.
// The check was correct and the result is still wrong: nothing stopped the
// second read from happening between the first read and the first write.
//
// Three things fix it, and they are deliberately different in nature:
//
//   1. The TRANSACTION. Creating the animal and creating the stay is one
//      indivisible operation. If the second fails, the first is undone and no
//      orphan animal is left behind (RG2).
//
//   2. SELECT ... FOR UPDATE. The first transaction locks the enclosure row.
//      The second one does not read stale data — it WAITS at that line until
//      the first commits, then reads the enclosure as `occupied` and gives up.
//      This is the line that turns a race into a queue.
//
//   3. The partial unique index of the migration 20260822100651. Even if the
//      lock were forgotten, PostgreSQL itself refuses a second open stay in
//      the same enclosure. A defence that does not depend on the application
//      being right.

import { Prisma, type PrismaClient, type EnclosureStatus } from '@prisma/client';
import { AppError } from '../errors';
import type { CreateAdmissionInput } from '../schemas';

// Prisma reports "a unique constraint was violated" as the code P2002.
function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export class AnimalService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
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

    return this.prisma.$transaction(async (tx) => {
      // Written as raw SQL because Prisma has no way to express FOR UPDATE.
      // The value is passed as a parameter by the tagged template, not glued
      // into the string, so this is not an SQL injection (OWASP A03).
      const rows = await tx.$queryRaw<{ id: number; code: string; status: EnclosureStatus }[]>`
        SELECT id, code, status
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
  }
}
