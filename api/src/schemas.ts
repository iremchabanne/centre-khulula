// Every validation rule of the API, in one file, grouped by resource.
// Every rule is enforced on the SERVER; the browser forms repeat a few of them
// to be helpful. The types are inferred, so rules and types cannot disagree.

import { z } from 'zod';

// The ?page=N every list accepts. A URL is text, so coerce converts before
// checking; no page at all means 1.
const pageNumber = z.coerce
  .number({ error: 'The page must be a whole number' })
  .int({ error: 'The page must be a whole number' })
  .positive({ error: 'The page must be greater than 0' })
  .default(1);

// The /:id of every route, written once. A URL segment is always text, so
// coerce converts it first: without it the value is the string "12".
function idParams(what: string) {
  return z.strictObject({
    id: z.coerce
      .number({ error: `The ${what} id must be a whole number` })
      .int({ error: `The ${what} id must be a whole number` })
      .positive({ error: `The ${what} id must be greater than 0` }),
  });
}

// ---------------------------------------------------------------------------
// Authentication
//
// There is no sign-up schema and never will be: accounts are created by an
// administrator (RG13) and visitors have no account at all.
// ---------------------------------------------------------------------------

export const loginSchema = z.strictObject({
  email: z.email({ error: 'Email and password are both required' }).max(255),

  // Only "not empty" here. Password strength belongs to the moment an account
  // is created: refusing a login because the stored password is too short
  // would lock a real member of staff out for our own mistake.
  password: z
    .string({ error: 'Email and password are both required' })
    .min(1, { error: 'Email and password are both required' })
    .max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Species
// ---------------------------------------------------------------------------

export const speciesIdParamsSchema = idParams('species');

export const listSpeciesQuerySchema = z.strictObject({
  page: pageNumber,
});

export type ListSpeciesQuery = z.infer<typeof listSpeciesQuerySchema>;

// ---------------------------------------------------------------------------
// Enclosures
// ---------------------------------------------------------------------------

export const enclosureIdParamsSchema = idParams('enclosure');

// One field, and it is the only one an administrator may send: `status` is the
// trigger's to write (RG3), and strictObject is what refuses it.
export const setMaintenanceSchema = z.strictObject({
  is_under_maintenance: z.boolean({
    error: 'is_under_maintenance is required and must be true or false',
  }),
});

export type SetMaintenanceInput = z.infer<typeof setMaintenanceSchema>;

// The free enclosures, optionally narrowed to those that suit one species.
export const listFreeEnclosuresQuerySchema = z.strictObject({
  species_id: z.coerce.number().int().positive().optional(),
});

export type ListFreeEnclosuresQuery = z.infer<typeof listFreeEnclosuresQuerySchema>;

// ---------------------------------------------------------------------------
// Animals
// ---------------------------------------------------------------------------

export const animalIdParamsSchema = idParams('animal');

// The admission form of screen 8. Three fields are deliberately not accepted,
// and strictObject rejects them if sent: `status` always starts at `admitted`
// (RG4), `admitted_at` is the server's, `opened_by_id` comes from the session.
export const createAdmissionSchema = z.strictObject({
  name: z
    .string({ error: 'The name is required' })
    .trim()
    .min(1, { error: 'The name is required' })
    .max(100),

  species_id: z.coerce
    .number({ error: 'A species must be chosen' })
    .int()
    .positive({ error: 'A species must be chosen' }),

  enclosure_id: z.coerce
    .number({ error: 'An enclosure must be chosen' })
    .int()
    .positive({ error: 'An enclosure must be chosen' }),

  // The values of the database enum, refused here before PostgreSQL sees them.
  sex: z.enum(['male', 'female', 'unknown'], { error: 'Sex must be male, female or unknown' }),

  age_class: z.enum(['juvenile', 'subadult', 'adult', 'unknown'], {
    error: 'Age class must be juvenile, subadult, adult or unknown',
  }),

  // A place name, never GPS coordinates, and never shown publicly — RG11.
  found_near: z.string().trim().max(255).nullish(),

  admission_reason: z
    .string({ error: 'The admission reason is required' })
    .trim()
    .min(1, { error: 'The admission reason is required' })
    .max(2000),
});

export type CreateAdmissionInput = z.infer<typeof createAdmissionSchema>;

// Adding an observation — screen 10. `status_after` is optional because writing
// a note and moving the animal on are one act. Only the two intermediate
// statuses: the terminal ones are a veterinarian's, on another route (RG5, RG6).
export const createObservationSchema = z.strictObject({
  body: z
    .string({ error: 'The observation cannot be empty' })
    .trim()
    .min(1, { error: 'The observation cannot be empty' })
    .max(2000, { error: 'The observation cannot exceed 2000 characters' }),

  status_after: z
    .enum(['in_care', 'recovering'], {
      error: 'The new status must be in_care or recovering',
    })
    .optional(),
});

export type CreateObservationInput = z.infer<typeof createObservationSchema>;

// The public list — screen 4. `admitted`, `in_care` and `recovering` are one
// value for a visitor, and `deceased` is deliberately absent: the centre
// communicates on its work, not on individual failures.
export const listAnimalsQuerySchema = z.strictObject({
  status: z
    .enum(['in_care', 'released'], {
      error: 'The filter must be in_care or released',
    })
    .optional(),

  // Screen 3 — the animals of one species.
  species_id: z.coerce.number().int().positive().optional(),

  page: pageNumber,
});

export type ListAnimalsQuery = z.infer<typeof listAnimalsQuerySchema>;

// The staff list — screen 9. Every status is a valid filter here, `deceased`
// included, and the filter itself is optional: the screen opens on the whole
// centre.
export const listStaffAnimalsQuerySchema = z.strictObject({
  status: z
    .enum(['admitted', 'in_care', 'recovering', 'released', 'deceased'], {
      error: 'Unknown status filter',
    })
    .optional(),

  species_id: z.coerce.number().int().positive().optional(),

  // Capped like the column itself. Prisma sends it as a parameter, never as
  // SQL text.
  search: z.string().trim().max(100).optional(),

  // Both ends optional: "since 1 June" and "before 1 July" are useful alone.
  admitted_from: z.coerce
    .date({ error: 'The start date must be written as YYYY-MM-DD' })
    .optional(),
  admitted_to: z.coerce.date({ error: 'The end date must be written as YYYY-MM-DD' }).optional(),

  page: pageNumber,
});

export type ListStaffAnimalsQuery = z.infer<typeof listStaffAnimalsQuerySchema>;

// Moving an animal — RG8. The reason is required: a move that cannot be
// explained afterwards is useless, and the column is what tells a stay opened
// by a move from one opened by an admission.
export const moveAnimalSchema = z.strictObject({
  enclosure_id: z.coerce
    .number({ error: 'A destination enclosure must be chosen' })
    .int()
    .positive({ error: 'A destination enclosure must be chosen' }),

  move_reason: z
    .string({ error: 'A reason is required to move an animal' })
    .trim()
    .min(1, { error: 'A reason is required to move an animal' })
    .max(2000),
});

export type MoveAnimalInput = z.infer<typeof moveAnimalSchema>;

// Pronouncing an outcome — RG5, RG6, RG7. Only the two terminal values, and
// neither the vet nor the date is accepted from the body.
export const recordOutcomeSchema = z.strictObject({
  outcome: z.enum(['released', 'deceased'], {
    error: 'The outcome must be released or deceased',
  }),

  // Required: an outcome without a reason is not a medical record.
  outcome_note: z
    .string({ error: 'A note is required to pronounce an outcome' })
    .trim()
    .min(1, { error: 'A note is required to pronounce an outcome' })
    .max(2000),
});

export type RecordOutcomeInput = z.infer<typeof recordOutcomeSchema>;

// ---------------------------------------------------------------------------
// Donations
// ---------------------------------------------------------------------------

export const listDonationsQuerySchema = z.strictObject({
  page: pageNumber,
});

export type ListDonationsQuery = z.infer<typeof listDonationsQuerySchema>;

export const createDonationSchema = z
  .strictObject({
    // RG9. The same rule is a CHECK constraint in the database: Zod protects
    // the API, the constraint protects the data whatever writes it.
    amount: z
      .number({ error: 'The amount is required and must be a number' })
      .positive({ error: 'The amount must be greater than 0' })
      .max(10000, { error: 'The amount cannot exceed 10 000' }),

    // RG10, RG11 — all three donor fields are optional. A donation with none of
    // them is anonymous, which is a supported case.
    donor_name: z.string().trim().min(1).max(100).nullish(),
    donor_email: z.email({ error: 'This is not a valid email address' }).max(255).nullish(),
    message: z.string().trim().max(1000).nullish(),

    consent_given: z.boolean(),
  })
  // RGPD — contact details may only be stored with consent. A rule that spans
  // two fields fits on neither, which is what refine is for.
  .refine((data) => !data.donor_email || data.consent_given === true, {
    error: 'An email address can only be stored if consent is given',
    path: ['consent_given'],
  });

export type CreateDonationInput = z.infer<typeof createDonationSchema>;

// ---------------------------------------------------------------------------
// Staff accounts — screen 12, administrators only
//
// RG13 is enforced twice: strictObject refuses a request carrying `is_admin`,
// and staff.service.ts never writes that column whatever it receives.
// ---------------------------------------------------------------------------

// Reused by account creation and password reset (RG15) so the two cannot drift.
// Twelve characters and nothing else, following the ANSSI recommendation:
// length is what makes a password hard to guess, while rules about capitals and
// symbols mostly produce "Password123!" on a sticky note.
const passwordRule = z
  .string({ error: 'A password is required' })
  .min(12, { error: 'The password must be at least 12 characters long' })
  .max(200, { error: 'The password cannot exceed 200 characters' });

export const staffIdParamsSchema = idParams('staff');

export const createStaffSchema = z.strictObject({
  full_name: z
    .string({ error: 'The full name is required' })
    .trim()
    .min(1, { error: 'The full name is required' })
    .max(100),

  email: z.email({ error: 'This is not a valid email address' }).max(255),

  // The two business roles. `is_admin` is not here — RG13.
  role: z.enum(['keeper', 'veterinarian'], {
    error: 'The role must be keeper or veterinarian',
  }),

  password: passwordRule,
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;

export const setStaffActiveSchema = z.strictObject({
  is_active: z.boolean({ error: 'is_active must be true or false' }),
});

export type SetStaffActiveInput = z.infer<typeof setStaffActiveSchema>;

// RG15 — an administrator resets a forgotten password. No current-password
// field: the administrator does not know it, and that is the point.
export const resetPasswordSchema = z.strictObject({
  password: passwordRule,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const listStaffQuerySchema = z.strictObject({
  // Searched in the name and the email.
  search: z.string().trim().max(100).optional(),

  page: pageNumber,
});

export type ListStaffQuery = z.infer<typeof listStaffQuerySchema>;
