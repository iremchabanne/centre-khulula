// Seed script — fills an empty database with development data.  npm run seed
//
// Wipes the tables first, so running it twice gives the same result. Connects
// as khulula_admin (DATABASE_URL).
//
// The size is chosen, not random: 14 animals and 12 donations make two pages of
// ten, so pagination is visibly needed. All five lifecycle states are present,
// enclosures are free, occupied and under maintenance, and finished stays have
// different lengths so the dashboard functions return real numbers.
//
// It never writes enclosure.status — the trigger does. The seed creates stays
// and the statuses follow, which is a small proof that the trigger works.

import { PrismaClient } from '@prisma/client';
import type { Sex, AgeClass, AnimalStatus, IucnStatus, EnclosureType } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

// The password of every seeded account. Development only, in clear on purpose
// so it can be looked up, and hashed before it reaches the database.
const DEV_PASSWORD = 'khulula-dev-password';

// Dates are written as "how many days ago", which stays readable and keeps the
// data fresh however long after today the seed is run.
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// ---------------------------------------------------------------------------
// The data
// ---------------------------------------------------------------------------

const staffData = [
  // The two administrators — RG13. They are created here and nowhere else:
  // is_admin can never be granted from the interface.
  { full_name: 'Thandiwe Mokoena', email: 'thandiwe.mokoena@khulula.org', role: 'veterinarian' as const, is_admin: true, is_active: true },
  { full_name: 'Sipho Ndlovu', email: 'sipho.ndlovu@khulula.org', role: 'keeper' as const, is_admin: true, is_active: true },

  // Ordinary accounts.
  { full_name: 'Aisha Patel', email: 'aisha.patel@khulula.org', role: 'veterinarian' as const, is_admin: false, is_active: true },
  { full_name: 'Lerato Dlamini', email: 'lerato.dlamini@khulula.org', role: 'keeper' as const, is_admin: false, is_active: true },

  // A deactivated account — RG12. Nothing is deleted: the account is switched
  // off and keeps everything it wrote.
  { full_name: 'Johan van Wyk', email: 'johan.vanwyk@khulula.org', role: 'keeper' as const, is_admin: false, is_active: false },
];

type SpeciesSeed = {
  common_name: string;
  scientific_name: string;
  iucn_status: IucnStatus;
  habitat: string;
  diet: string;
  activity: string;
  description: string;
  photo_url: string;
};

const speciesData: SpeciesSeed[] = [
  {
    common_name: 'Serval',
    scientific_name: 'Leptailurus serval',
    iucn_status: 'least_concern',
    habitat: 'Wetlands and tall grassland',
    diet: 'Rodents, birds, frogs',
    activity: 'Mostly nocturnal',
    description:
      'A slender wild cat with very long legs and oversized ears, which it uses to locate rodents in tall grass before leaping on them. Servals reaching the centre are usually young animals caught in snares.',
    photo_url: '/images/species/serval.jpg',
  },
  {
    common_name: 'Spotted Eagle-Owl',
    scientific_name: 'Bubo africanus',
    iucn_status: 'least_concern',
    habitat: 'Savanna, rocky hills and the edges of towns',
    diet: 'Insects, small mammals and birds',
    activity: 'Nocturnal',
    description:
      'The commonest owl of southern Africa, and the raptor most often brought in: it hunts along roadsides and near houses, so vehicle strikes and fence injuries are frequent.',
    photo_url: '/images/species/spotted-eagle-owl.jpg',
  },
  {
    common_name: 'Banded Mongoose',
    scientific_name: 'Mungos mungo',
    iucn_status: 'least_concern',
    habitat: 'Savanna and open woodland',
    diet: 'Insects, reptiles, eggs',
    activity: 'Daytime',
    description:
      'A small social carnivore living in troops of twenty or more. Admissions are usually orphaned pups and dog-bite injuries near villages.',
    photo_url: '/images/species/banded-mongoose.jpg',
  },
  {
    common_name: 'Leopard Tortoise',
    scientific_name: 'Stigmochelys pardalis',
    iucn_status: 'least_concern',
    habitat: 'Dry savanna and grassland',
    diet: 'Grasses and succulents',
    activity: 'Daytime',
    description:
      'The largest tortoise of the region, named after the pattern on its shell. Most arrive with a cracked shell after a road or fire injury, or confiscated from the pet trade.',
    photo_url: '/images/species/leopard-tortoise.jpg',
  },
  {
    common_name: 'Common Duiker',
    scientific_name: 'Sylvicapra grimmia',
    iucn_status: 'least_concern',
    habitat: 'Bush and wooded savanna',
    diet: 'Leaves, fruit and shoots',
    activity: 'Dawn, dusk and night',
    description:
      'A small antelope that hides rather than flees, which is why it is so often caught in snares. Duikers stress easily and are kept in the quietest enclosure available.',
    photo_url: '/images/species/common-duiker.jpg',
  },
  {
    common_name: 'Cape Vulture',
    scientific_name: 'Gyps coprotheres',
    iucn_status: 'vulnerable',
    habitat: 'Cliffs and open grassland',
    diet: 'Carrion',
    activity: 'Daytime',
    description:
      'A large colonial vulture endemic to southern Africa. Poisoning and collisions with power lines are the two reasons it arrives here, usually with wing injuries that take months to heal.',
    photo_url: '/images/species/cape-vulture.jpg',
  },
  {
    common_name: 'Temminck’s Pangolin',
    scientific_name: 'Smutsia temminckii',
    iucn_status: 'vulnerable',
    habitat: 'Savanna and dry woodland',
    diet: 'Ants and termites',
    activity: 'Nocturnal',
    description:
      'A scaled, ant-eating mammal and the most trafficked wild mammal in the world. Animals recovered from the illegal trade arrive severely dehydrated and need a long, quiet recovery.',
    photo_url: '/images/species/pangolin.jpg',
  },
  {
    common_name: 'Southern Ground Hornbill',
    scientific_name: 'Bucorvus leadbeateri',
    iucn_status: 'vulnerable',
    habitat: 'Savanna and open woodland',
    diet: 'Insects, reptiles, small mammals',
    activity: 'Daytime',
    description:
      'A large ground-dwelling bird that lives in family groups and breeds very slowly, which makes every lost adult hard to replace. Road collisions are the usual cause of admission.',
    photo_url: '/images/species/ground-hornbill.jpg',
  },
  {
    common_name: 'Black-backed Jackal',
    scientific_name: 'Lupulella mesomelas',
    iucn_status: 'least_concern',
    habitat: 'Open savanna and semi-desert',
    diet: 'Omnivorous scavenger',
    activity: 'Dawn, dusk and night',
    description:
      'A small, adaptable canid, easily recognised by the dark saddle on its back. Most admissions are snare injuries and orphaned pups.',
    photo_url: '/images/species/black-backed-jackal.jpg',
  },
];

type EnclosureSeed = {
  code: string;
  type: EnclosureType;
  notes: string | null;
  is_under_maintenance: boolean;
};

// Ten enclosures, one of each type at least, so the type filter has something
// to filter. Six end up occupied, three free, one under maintenance.
const enclosureData: EnclosureSeed[] = [
  { code: 'E-01', type: 'small_mammal', notes: 'Quiet corner, screened from the path.', is_under_maintenance: false },
  { code: 'E-02', type: 'small_mammal', notes: 'Heated floor, used for pangolins.', is_under_maintenance: false },
  { code: 'E-03', type: 'small_mammal', notes: null, is_under_maintenance: false },
  { code: 'E-04', type: 'small_mammal', notes: null, is_under_maintenance: false },
  { code: 'E-05', type: 'aviary', notes: 'Low-light cage, used for owls.', is_under_maintenance: false },
  { code: 'E-06', type: 'aviary', notes: 'Tall flight cage.', is_under_maintenance: false },
  { code: 'E-07', type: 'aviary', notes: null, is_under_maintenance: false },
  { code: 'E-08', type: 'large_mammal', notes: 'Double gate, mandatory two-keeper entry.', is_under_maintenance: false },
  { code: 'E-09', type: 'reptile', notes: 'Water tank and basking platform.', is_under_maintenance: false },
  // One enclosure closed for repair — RG16. The trigger reads this column and
  // sets the status to 'maintenance'.
  { code: 'E-10', type: 'reptile', notes: 'Fence panel being replaced.', is_under_maintenance: true },
];

// The six animals still at the centre. Each one has one open stay, in its own
// enclosure — RG1 means no two of them may share one.
type CurrentAnimalSeed = {
  name: string;
  species: string;
  sex: Sex;
  age_class: AgeClass;
  found_near: string;
  admission_reason: string;
  status: AnimalStatus;
  admitted_days_ago: number;
  enclosure: string;
};

const currentAnimals: CurrentAnimalSeed[] = [
  {
    name: 'Nala', species: 'Serval', sex: 'female', age_class: 'subadult',
    found_near: 'Hoedspruit', admission_reason: 'Snare wound on the left hind leg.',
    status: 'in_care', admitted_days_ago: 14, enclosure: 'E-01',
  },
  {
    name: 'Kito', species: 'Temminck’s Pangolin', sex: 'male', age_class: 'adult',
    found_near: 'Phalaborwa', admission_reason: 'Recovered from the illegal trade, severely dehydrated.',
    status: 'recovering', admitted_days_ago: 41, enclosure: 'E-02',
  },
  {
    name: 'Zola', species: 'Black-backed Jackal', sex: 'female', age_class: 'juvenile',
    found_near: 'Gravelotte', admission_reason: 'Orphaned pup, mother killed on the road.',
    status: 'in_care', admitted_days_ago: 23, enclosure: 'E-03',
  },
  {
    name: 'Amara', species: 'Serval', sex: 'female', age_class: 'adult',
    found_near: 'Tzaneen', admission_reason: 'Road collision, suspected pelvic fracture.',
    status: 'admitted', admitted_days_ago: 2, enclosure: 'E-04',
  },
  {
    name: 'Sindi', species: 'Spotted Eagle-Owl', sex: 'female', age_class: 'adult',
    found_near: 'Modjadjiskloof', admission_reason: 'Vehicle strike on the R36, damaged left wing.',
    status: 'recovering', admitted_days_ago: 33, enclosure: 'E-05',
  },
  {
    name: 'Bantu', species: 'Cape Vulture', sex: 'male', age_class: 'adult',
    found_near: 'Blouberg', admission_reason: 'Wing fracture, probable power line collision.',
    status: 'in_care', admitted_days_ago: 58, enclosure: 'E-06',
  },
];

// The eight animals whose care is over. Their stays are closed, which is what
// gives average_stay_length_days() something to average.
//
// moved_to is optional: when it is set, the animal had two successive stays
// rather than one — RG8. Both are kept.
type PastAnimalSeed = {
  name: string;
  species: string;
  sex: Sex;
  age_class: AgeClass;
  found_near: string;
  admission_reason: string;
  status: AnimalStatus;
  admitted_days_ago: number;
  stay_days: number;
  enclosure: string;
  moved_to?: string;
  move_after_days?: number;
  move_reason?: string;
  outcome_note: string;
};

const pastAnimals: PastAnimalSeed[] = [
  {
    name: 'Ayanda', species: 'Banded Mongoose', sex: 'male', age_class: 'adult',
    found_near: 'Tzaneen', admission_reason: 'Dog bite, wound on the flank.',
    status: 'released', admitted_days_ago: 210, stay_days: 52, enclosure: 'E-01',
    outcome_note: 'Released with its troop at the capture site.',
  },
  {
    name: 'Bonga', species: 'Cape Vulture', sex: 'female', age_class: 'adult',
    found_near: 'Blouberg', admission_reason: 'Suspected poisoning at a carcass.',
    status: 'released', admitted_days_ago: 195, stay_days: 38, enclosure: 'E-06',
    outcome_note: 'Released at the Blouberg colony with a wing tag.',
  },
  {
    name: 'Chuma', species: 'Common Duiker', sex: 'male', age_class: 'adult',
    found_near: 'Mokopane', admission_reason: 'Snare wound on the right hind leg.',
    status: 'released', admitted_days_ago: 180, stay_days: 27, enclosure: 'E-08',
    outcome_note: 'Released on the neighbouring reserve, wound fully closed.',
  },
  {
    name: 'Dumi', species: 'Black-backed Jackal', sex: 'male', age_class: 'subadult',
    found_near: 'Gravelotte', admission_reason: 'Leg injury from a snare.',
    status: 'released', admitted_days_ago: 172, stay_days: 21, enclosure: 'E-03',
    outcome_note: 'Released on the neighbouring reserve.',
  },
  {
    name: 'Enzokuhle', species: 'Temminck’s Pangolin', sex: 'female', age_class: 'adult',
    found_near: 'Phalaborwa', admission_reason: 'Confiscated from traffickers.',
    status: 'released', admitted_days_ago: 165, stay_days: 74, enclosure: 'E-02',
    // Moved to a quieter enclosure halfway through — RG8.
    moved_to: 'E-04', move_after_days: 30,
    move_reason: 'Moved to a quieter enclosure to reduce stress before release.',
    outcome_note: 'Soft-released on a protected property.',
  },
  {
    name: 'Hlengiwe', species: 'Southern Ground Hornbill', sex: 'female', age_class: 'adult',
    found_near: 'Hoedspruit', admission_reason: 'Road collision, bruised wing.',
    status: 'released', admitted_days_ago: 128, stay_days: 33, enclosure: 'E-07',
    outcome_note: 'Released with its family group.',
  },
  {
    name: 'Kagiso', species: 'Cape Vulture', sex: 'male', age_class: 'subadult',
    found_near: 'Polokwane', admission_reason: 'Fractured wing, power line collision.',
    status: 'deceased', admitted_days_ago: 158, stay_days: 6, enclosure: 'E-07',
    outcome_note: 'Died of internal injuries despite surgery.',
  },
  {
    name: 'Lindiwe', species: 'Leopard Tortoise', sex: 'female', age_class: 'adult',
    found_near: 'Bela-Bela', admission_reason: 'Shell crushed by a vehicle.',
    status: 'deceased', admitted_days_ago: 150, stay_days: 3, enclosure: 'E-09',
    outcome_note: 'Internal injuries too severe; died on the third day.',
  },
];

// Follow-up notes on the animals currently at the centre — the history shown on
// screen 10.
const observationData = [
  { animal: 'Nala', days_ago: 13, body: 'Wound cleaned and dressed. Ate half a ration.', status_after: 'in_care' as AnimalStatus },
  { animal: 'Nala', days_ago: 6, body: 'Dressing changed. Weight stable, moving normally on the leg.', status_after: null },
  { animal: 'Kito', days_ago: 40, body: 'Rehydrated overnight. Refused the first feed.', status_after: 'in_care' as AnimalStatus },
  { animal: 'Kito', days_ago: 20, body: 'Feeding well on termites. Active at night.', status_after: 'recovering' as AnimalStatus },
  { animal: 'Zola', days_ago: 22, body: 'Bottle feeding started, four times a day.', status_after: 'in_care' as AnimalStatus },
  { animal: 'Amara', days_ago: 2, body: 'Admitted. Radiographs scheduled for tomorrow.', status_after: null },
  { animal: 'Sindi', days_ago: 32, body: 'Second wash completed. Plumage still not waterproof.', status_after: 'in_care' as AnimalStatus },
  { animal: 'Sindi', days_ago: 10, body: 'Swimming and diving normally. Weight up 400 g.', status_after: 'recovering' as AnimalStatus },
  { animal: 'Bantu', days_ago: 57, body: 'Wing pinned. Cage rest for six weeks.', status_after: 'in_care' as AnimalStatus },
  { animal: 'Bantu', days_ago: 12, body: 'Pin removed. Beginning short flights in the tall cage.', status_after: null },
];

const donationData = [
  { amount: 25.0, donor_name: 'Marie Lefèvre', donor_email: 'marie.lefevre@example.com', message: 'For the pangolins.', consent_given: true, days_ago: 3 },
  { amount: 100.0, donor_name: 'Peter Nkosi', donor_email: 'peter.nkosi@example.com', message: null, consent_given: true, days_ago: 5 },
  { amount: 10.0, donor_name: null, donor_email: null, message: null, consent_given: false, days_ago: 6 },
  { amount: 250.0, donor_name: 'Sarah Bergmann', donor_email: 'sarah.b@example.com', message: 'Keep up the work with the vultures.', consent_given: true, days_ago: 9 },
  { amount: 5.0, donor_name: null, donor_email: null, message: 'Every bit helps.', consent_given: false, days_ago: 11 },
  { amount: 50.0, donor_name: 'Thabo Mahlangu', donor_email: 'thabo.m@example.com', message: null, consent_given: true, days_ago: 14 },
  { amount: 500.0, donor_name: 'Coastal Trust', donor_email: 'contact@example.org', message: 'Earmarked for penguin rehabilitation.', consent_given: true, days_ago: 18 },
  { amount: 20.0, donor_name: null, donor_email: null, message: null, consent_given: false, days_ago: 21 },
  { amount: 75.0, donor_name: 'Anna Kowalski', donor_email: 'anna.k@example.com', message: 'Visited last month — thank you.', consent_given: true, days_ago: 26 },
  { amount: 15.0, donor_name: null, donor_email: null, message: null, consent_given: false, days_ago: 30 },
  { amount: 40.0, donor_name: 'Lisa Meyer', donor_email: 'lisa.meyer@example.com', message: 'For Nala.', consent_given: true, days_ago: 42 },
  { amount: 1000.0, donor_name: 'Bushveld Rotary Club', donor_email: 'rotary@example.org', message: 'Proceeds of the annual fundraiser.', consent_given: true, days_ago: 61 },
];

// ---------------------------------------------------------------------------
// The script
// ---------------------------------------------------------------------------

async function main() {
  console.log('Seeding the Khulula database...');

  // 1. Empty the tables.
  //    The order matters: a row cannot be removed while another row still points
  //    at it, so children go before parents.
  await prisma.observation.deleteMany();
  await prisma.stay.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.enclosure.deleteMany();
  await prisma.species.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.staffMember.deleteMany();

  // 2. Staff. The password is hashed once and reused — argon2 is deliberately
  //    slow, and hashing the same string five times would gain nothing.
  const passwordHash = await argon2.hash(DEV_PASSWORD);
  const staff = await prisma.staffMember.createManyAndReturn({
    data: staffData.map((person) => ({
      full_name: person.full_name,
      email: person.email,
      password_hash: passwordHash,
      role: person.role,
      is_admin: person.is_admin,
      is_active: person.is_active,
    })),
  });

  const referentVet = staff[0]!;    // Thandiwe — pronounces the outcomes (RG6)
  const referentKeeper = staff[1]!; // Sipho — opens the stays

  // 3. Species and enclosures.
  const species = await prisma.species.createManyAndReturn({ data: speciesData });
  const enclosures = await prisma.enclosure.createManyAndReturn({ data: enclosureData });

  // Two small look-ups, so the animal data above can name a species and an
  // enclosure instead of carrying database ids around.
  function speciesId(commonName: string): number {
    const found = species.find((s) => s.common_name === commonName);
    if (!found) throw new Error(`Seed error: unknown species "${commonName}"`);
    return found.id;
  }

  function enclosureId(code: string): number {
    const found = enclosures.find((e) => e.code === code);
    if (!found) throw new Error(`Seed error: unknown enclosure "${code}"`);
    return found.id;
  }

  // 4. The animals still at the centre, each with one open stay.
  for (const item of currentAnimals) {
    const animal = await prisma.animal.create({
      data: {
        name: item.name,
        species_id: speciesId(item.species),
        sex: item.sex,
        age_class: item.age_class,
        found_near: item.found_near,
        admission_reason: item.admission_reason,
        status: item.status,
        admitted_at: daysAgo(item.admitted_days_ago),
      },
    });

    // ended_at is left empty: the stay is in progress, and the trigger reads
    // exactly that to mark the enclosure occupied.
    await prisma.stay.create({
      data: {
        animal_id: animal.id,
        enclosure_id: enclosureId(item.enclosure),
        started_at: daysAgo(item.admitted_days_ago),
        opened_by_id: referentKeeper.id,
      },
    });
  }

  // 5. The animals whose care is over. Their stays are closed and the outcome
  //    is signed by the referent vet — RG6.
  for (const item of pastAnimals) {
    const animal = await prisma.animal.create({
      data: {
        name: item.name,
        species_id: speciesId(item.species),
        sex: item.sex,
        age_class: item.age_class,
        found_near: item.found_near,
        admission_reason: item.admission_reason,
        status: item.status,
        admitted_at: daysAgo(item.admitted_days_ago),
        // The three outcome columns are filled together — RG5.
        outcome_at: daysAgo(item.admitted_days_ago - item.stay_days),
        outcome_note: item.outcome_note,
        outcome_by_id: referentVet.id,
      },
    });

    if (item.moved_to && item.move_after_days) {
      // Two successive stays — RG8. The first closes on the day of the move,
      // the second runs from that day to the outcome.
      const moveDay = item.admitted_days_ago - item.move_after_days;

      await prisma.stay.create({
        data: {
          animal_id: animal.id,
          enclosure_id: enclosureId(item.enclosure),
          started_at: daysAgo(item.admitted_days_ago),
          ended_at: daysAgo(moveDay),
          opened_by_id: referentKeeper.id,
        },
      });

      await prisma.stay.create({
        data: {
          animal_id: animal.id,
          enclosure_id: enclosureId(item.moved_to),
          started_at: daysAgo(moveDay),
          ended_at: daysAgo(item.admitted_days_ago - item.stay_days),
          move_reason: item.move_reason,
          opened_by_id: referentKeeper.id,
        },
      });
    } else {
      await prisma.stay.create({
        data: {
          animal_id: animal.id,
          enclosure_id: enclosureId(item.enclosure),
          started_at: daysAgo(item.admitted_days_ago),
          ended_at: daysAgo(item.admitted_days_ago - item.stay_days),
          opened_by_id: referentKeeper.id,
        },
      });
    }
  }

  // 6. Follow-up notes on the animals currently at the centre.
  const allAnimals = await prisma.animal.findMany();

  for (const item of observationData) {
    const animal = allAnimals.find((a) => a.name === item.animal);
    if (!animal) throw new Error(`Seed error: unknown animal "${item.animal}"`);

    await prisma.observation.create({
      data: {
        animal_id: animal.id,
        author_id: referentKeeper.id,
        observed_at: daysAgo(item.days_ago),
        body: item.body,
        status_after: item.status_after,
      },
    });
  }

  // 7. Donations. No foreign key at all — a donation is attached to nobody (RG10).
  await prisma.donation.createMany({
    data: donationData.map((item) => ({
      amount: item.amount,
      donor_name: item.donor_name,
      donor_email: item.donor_email,
      message: item.message,
      consent_given: item.consent_given,
      created_at: daysAgo(item.days_ago),
    })),
  });

  // 8. Report what was created. enclosure.status is read back from the database
  //    rather than assumed: the trigger is what put those values there.
  const [staffCount, speciesCount, animalCount, stayCount, observationCount, donationCount] =
    await Promise.all([
      prisma.staffMember.count(),
      prisma.species.count(),
      prisma.animal.count(),
      prisma.stay.count(),
      prisma.observation.count(),
      prisma.donation.count(),
    ]);

  const enclosuresNow = await prisma.enclosure.findMany();
  const free = enclosuresNow.filter((e) => e.status === 'free').length;
  const occupied = enclosuresNow.filter((e) => e.status === 'occupied').length;
  const maintenance = enclosuresNow.filter((e) => e.status === 'maintenance').length;

  console.log('');
  console.log(`  staff members  ${staffCount}   (2 administrators, 1 deactivated)`);
  console.log(`  species        ${speciesCount}`);
  console.log(`  enclosures     ${enclosuresNow.length}   ${free} free / ${occupied} occupied / ${maintenance} maintenance`);
  console.log(`  animals        ${animalCount}`);
  console.log(`  stays          ${stayCount}`);
  console.log(`  observations   ${observationCount}`);
  console.log(`  donations      ${donationCount}`);
  console.log('');
  console.log(`  Every account logs in with: ${DEV_PASSWORD}`);
  console.log('');
  console.log('Done.');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    // A non-zero exit code tells the terminal, and later the CI pipeline, that
    // this did not work. Without it a failed seed looks like a success.
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
