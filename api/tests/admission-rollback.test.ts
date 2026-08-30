// The rollback test of RG2 — "admettre un animal = attribuer un enclos + créer
// le séjour, tout ou rien".
//
// The race test next door proves two admissions cannot take the same enclosure.
// It does not prove the other half of RG2: that a HALF-DONE admission leaves
// nothing behind. admit() writes two rows — the animal first, the stay second.
// If the second one fails and there is no transaction, the centre is left with
// an animal that lives nowhere, in no enclosure, visible on screen 9 forever.
//
// HOW THE FAILURE IS PROVOKED. We ask for the admission with a staff id that
// does not exist. stay.opened_by_id is a foreign key, so PostgreSQL refuses the
// stay — after the animal has already been created. That is precisely the
// moment we need: one write done, the next one impossible.
//
// It is an artificial failure, and deliberately so. A real one — the server
// losing power between the two writes — cannot be scheduled in a test. What
// matters is that the database sees the same thing in both cases: a transaction
// that never reached its COMMIT.
//
// Needs the development stack running:
//     docker compose up -d
//     npm test

import { test, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { AnimalService } from '../src/services/animal.service';

// Same two clients as the race test, for the same reason: the service runs as
// the restricted khulula_app account, which has no DELETE anywhere, so the
// cleanup needs khulula_admin.
const appPrisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL_APP });
const adminPrisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

const animalService = new AnimalService(appPrisma);

// A name no seeded animal has, so looking for it afterwards can only find what
// this test created — if the rollback failed.
const testAnimalName = 'Rollback test animal';

// No staff member has this id. That is the whole point.
const missingStaffId = 999999;

let enclosureId: number;
let speciesId: number;

beforeAll(async () => {
  const enclosure = await appPrisma.enclosure.findFirst({ where: { status: 'free' } });

  // RG17 — the species has to suit the enclosure, or the admission is refused
  // before it can be interrupted halfway.
  const species = enclosure
    ? await appPrisma.species.findFirst({ where: { enclosure_type: enclosure.type } })
    : null;

  if (!enclosure || !species) {
    throw new Error('The database has no free enclosure or species. Run `npm run seed`.');
  }

  enclosureId = enclosure.id;
  speciesId = species.id;
});

afterAll(async () => {
  // Should delete nothing at all: if the rollback worked, there is nothing to
  // delete. Kept so that a FAILING run does not leave the database dirty for
  // the next one.
  await adminPrisma.animal.deleteMany({ where: { name: testAnimalName } });

  await appPrisma.$disconnect();
  await adminPrisma.$disconnect();
});

test('an admission that fails halfway leaves no animal behind', async () => {
  const admission = {
    name: testAnimalName,
    species_id: speciesId,
    enclosure_id: enclosureId,
    sex: 'unknown' as const,
    age_class: 'adult' as const,
    found_near: null,
    admission_reason: 'Rollback test.',
  };

  // The call must fail. rejects.toThrow() and not a try/catch, because a test
  // that swallows the error would also pass if the call unexpectedly succeeded.
  await expect(animalService.admit(admission, missingStaffId)).rejects.toThrow();

  // The real assertion, and it is about the database, not about the error.
  // The animal was created before the stay failed; the transaction must have
  // undone it.
  const leftovers = await appPrisma.animal.count({ where: { name: testAnimalName } });

  expect(leftovers).toBe(0);

  // And the enclosure was never taken, so the next keeper can still use it.
  const enclosure = await appPrisma.enclosure.findUnique({ where: { id: enclosureId } });

  expect(enclosure?.status).toBe('free');
});
