// The concurrency test of RG2 — the one the whole of CP 8 is built around.
//
// Two keepers admit an animal into the LAST free enclosure at the same instant.
// Exactly one must succeed. The other must be told the enclosure is taken, and
// the centre must end up with one single open stay on that enclosure.
//
// Until now this was proved by hand, with two curl commands launched together.
// That proof is real but it is not repeatable: nobody will remember to run it
// again after the next change. This file is the same proof, automated.
//
// WHY IT TALKS TO THE REAL DATABASE. The thing being tested is not our
// TypeScript — it is PostgreSQL's row lock. `SELECT … FOR UPDATE` only exists
// in a real database, in a real transaction. A fake database would answer
// whatever we programmed it to answer, and would prove nothing at all.
//
// It therefore needs the development stack running:
//     docker compose up -d
//     npm test
//
// WHAT THIS TEST DOES NOT PROVE, checked on 26/08/2026 by deleting the
// `FOR UPDATE` line and running it again: it still passed. That is not a
// weakness of the test, it is the layered defence working. Without the lock
// both transactions insert, and the partial unique index of the migration
// 20260822100651 refuses the second one — the caller still gets the same clean
// 409 and the database still holds one single open stay.
//
// So this file asserts the RESULT the centre needs, not the mechanism that
// delivers it. Which of the two defences fired was checked by hand, by giving
// the index branch a different message for one run: with the lock the refusal
// comes from the status check, without it from the index. The lock is what
// turns the race into a queue; the index is what makes being wrong impossible.

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { AnimalService } from '../src/services/animal.service';
import { AppError } from '../src/errors';

// Two clients, on purpose, and the difference is the point.
//
// The service under test connects as khulula_app — the restricted account the
// running API uses, so the test exercises exactly the rights production has.
// That account has no DELETE on any table (migration 20260822105239): nothing
// is ever deleted in this application. Which leaves the test unable to clear
// up after itself, so the cleanup at the end uses khulula_admin instead.
const appPrisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL_APP });
const adminPrisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

const animalService = new AnimalService(appPrisma);

// Filled in by beforeAll, read by the test.
let enclosureId: number;
let speciesId: number;
let staffId: number;

// Remembered so the cleanup knows what this run created.
const createdAnimalIds: number[] = [];

beforeAll(async () => {
  const enclosure = await appPrisma.enclosure.findFirst({ where: { status: 'free' } });

  // RG17 — the species has to suit the enclosure, otherwise both admissions are
  // refused for the wrong reason and the race is never played.
  const species = enclosure
    ? await appPrisma.species.findFirst({ where: { enclosure_type: enclosure.type } })
    : null;
  const staff = await appPrisma.staffMember.findFirst({ where: { is_active: true } });

  if (!enclosure || !species || !staff) {
    throw new Error('The database has no free enclosure, species or active staff. Run `npm run seed`.');
  }

  enclosureId = enclosure.id;
  speciesId = species.id;
  staffId = staff.id;
});

afterAll(async () => {
  // The stays first: a stay points at an animal, so deleting the animal while
  // its stay still exists would violate the foreign key.
  await adminPrisma.stay.deleteMany({ where: { animal_id: { in: createdAnimalIds } } });
  await adminPrisma.animal.deleteMany({ where: { id: { in: createdAnimalIds } } });

  await appPrisma.$disconnect();
  await adminPrisma.$disconnect();
});

// The same admission, twice, differing only by the name.
function admissionInput(name: string) {
  return {
    name,
    species_id: speciesId,
    enclosure_id: enclosureId,
    sex: 'unknown' as const,
    age_class: 'adult' as const,
    found_near: null,
    admission_reason: 'Concurrency test.',
  };
}

describe('two admissions into the last free enclosure', () => {
  test('one succeeds, the other is refused, and one stay is left open', async () => {
    // Promise.allSettled and not Promise.all: we WANT one of them to fail, and
    // Promise.all would throw at the first rejection and hide the other result.
    // allSettled waits for both and reports each one separately.
    //
    // No await between the two calls — they are started together, which is what
    // makes this a race rather than two admissions one after the other.
    const results = await Promise.allSettled([
      animalService.admit(admissionInput('Race A'), staffId),
      animalService.admit(admissionInput('Race B'), staffId),
    ]);

    const succeeded = results.filter((result) => result.status === 'fulfilled');
    const refused = results.filter((result) => result.status === 'rejected');

    expect(succeeded).toHaveLength(1);
    expect(refused).toHaveLength(1);

    // Remember what was written, so afterAll can remove it.
    for (const result of succeeded) {
      createdAnimalIds.push(result.value.id);
    }

    // The refusal must be OUR 409, not a raw database error leaking out. A
    // keeper arriving second sees a sentence they understand; PostgreSQL's
    // wording never reaches the screen.
    const error = (refused[0] as PromiseRejectedResult).reason;

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(409);
    expect((error as AppError).message).toContain('no longer free');

    // The real assertion. Two API answers could both be correct and the
    // database still be wrong, so we go and look at it: exactly one open stay
    // on that enclosure, and the enclosure marked occupied by the trigger.
    const openStays = await appPrisma.stay.count({
      where: { enclosure_id: enclosureId, ended_at: null },
    });

    expect(openStays).toBe(1);

    const enclosure = await appPrisma.enclosure.findUnique({ where: { id: enclosureId } });

    expect(enclosure?.status).toBe('occupied');
  });
});
