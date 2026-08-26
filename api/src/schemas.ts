// Every validation rule of the API, in one file, grouped by resource.
//
// One file rather than one per resource: the rules are short, and having them
// together means "what does the API accept?" is answered by reading a single
// page. If the authentication rules arrive at step 13 and turn out to be long,
// they get their own file — nothing else does.
//
// Every rule below is enforced on the SERVER. The browser form will repeat some
// of them to be helpful, but a form is a convenience, not a defence: anyone can
// send a request straight to the API without ever loading the page.
//
// The types at the bottom are inferred from the schemas rather than written by
// hand, so the rules and the types can never disagree.

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Authentication
//
// There is no sign-up schema, and there never will be one: staff accounts are
// created by an administrator (RG13) and visitors have no account at all.
// ---------------------------------------------------------------------------

export const loginSchema = z.strictObject({
  email: z.email({ error: 'Email and password are both required' }).max(255),

  // Only "not empty" is checked here, deliberately. The rules on how strong a
  // password must be belong to the moment an account is created, not to the
  // moment someone logs in: refusing a login because the stored password is
  // too short would lock a real member of staff out for our own mistake.
  password: z
    .string({ error: 'Email and password are both required' })
    .min(1, { error: 'Email and password are both required' })
    .max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Species
// ---------------------------------------------------------------------------

export const speciesIdParamsSchema = z.strictObject({
  // A URL segment is always text. coerce = convert first, then check; without
  // it the value is the string "12" and z.number() would reject it.
  id: z.coerce
    .number({ error: 'The species id must be a whole number' })
    .int({ error: 'The species id must be a whole number' })
    .positive({ error: 'The species id must be greater than 0' }),
});

// ---------------------------------------------------------------------------
// Enclosures
// ---------------------------------------------------------------------------

export const enclosureIdParamsSchema = z.strictObject({
  id: z.coerce
    .number({ error: 'The enclosure id must be a whole number' })
    .int({ error: 'The enclosure id must be a whole number' })
    .positive({ error: 'The enclosure id must be greater than 0' }),
});

// The body of PATCH /enclosures/:id/maintenance. One field, and it is the only
// field an administrator may send: `status` is not accepted here, because it is
// the trigger's to write (RG3). strictObject is what refuses it.
export const setMaintenanceSchema = z.strictObject({
  is_under_maintenance: z.boolean({
    error: 'is_under_maintenance is required and must be true or false',
  }),
});

export type SetMaintenanceInput = z.infer<typeof setMaintenanceSchema>;

// ---------------------------------------------------------------------------
// Animals
// ---------------------------------------------------------------------------

// The admission form of screen 8.
//
// Three fields are deliberately NOT accepted here, and strictObject rejects
// them if sent:
//   - status       the lifecycle always starts at `admitted` (RG4)
//   - admitted_at  the server decides what "now" is, not the browser
//   - opened_by_id the stay is opened by whoever is logged in, from the session
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

  // The enum values are the ones the database enum accepts. Anything else is
  // refused here, before PostgreSQL ever sees it.
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

export const animalIdParamsSchema = z.strictObject({
  id: z.coerce
    .number({ error: 'The animal id must be a whole number' })
    .int({ error: 'The animal id must be a whole number' })
    .positive({ error: 'The animal id must be greater than 0' }),
});

// Adding an observation — screen 10, S5.
//
// One request, not two. `status_after` is optional, and the model says why:
// the column is "only filled when the observation makes the animal change
// status". Writing a note and moving the animal on in its care are the same
// act, so they are one call and one transaction.
//
// Only the two intermediate statuses are here. `released` and `deceased` are
// terminal and pronounced by a veterinarian on another route (RG5, RG6), and
// `admitted` is where an animal starts and never returns to (RG4).
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

// The public list of animals — screen 4, "Nos animaux".
//
// One list and one filter, not two routes: arborescence-ecrans.md §1, *« même
// liste, même requête, un seul filtre qui change »*.
//
// The two values a visitor may ask for are named here rather than taken from
// the AnimalStatus enum. `admitted`, `in_care` and `recovering` are grouped
// under `in_care` for the public — a visitor does not need the clinical detail
// — and `deceased` is deliberately absent: it is never shown publicly.
export const listAnimalsQuerySchema = z.strictObject({
  status: z.enum(['in_care', 'released'], {
    error: 'The filter must be in_care or released',
  }),

  // Comes from the URL, so it arrives as text: coerce turns "2" into 2.
  // Defaulting to 1 means a URL with no page is a valid request, not an error.
  page: z.coerce
    .number({ error: 'The page must be a whole number' })
    .int({ error: 'The page must be a whole number' })
    .positive({ error: 'The page must be greater than 0' })
    .default(1),
});

export type ListAnimalsQuery = z.infer<typeof listAnimalsQuerySchema>;

// The staff list of animals — screen 9. Unlike the public one, every status is
// a valid filter, `deceased` included, and the filter itself is optional: the
// screen opens on the whole centre.
export const listStaffAnimalsQuerySchema = z.strictObject({
  status: z
    .enum(['admitted', 'in_care', 'recovering', 'released', 'deceased'], {
      error: 'Unknown status filter',
    })
    .optional(),

  page: z.coerce
    .number({ error: 'The page must be a whole number' })
    .int({ error: 'The page must be a whole number' })
    .positive({ error: 'The page must be greater than 0' })
    .default(1),
});

export type ListStaffAnimalsQuery = z.infer<typeof listStaffAnimalsQuerySchema>;

// The donation list — screen 11.
export const listDonationsQuerySchema = z.strictObject({
  page: z.coerce
    .number({ error: 'The page must be a whole number' })
    .int({ error: 'The page must be a whole number' })
    .positive({ error: 'The page must be greater than 0' })
    .default(1),
});

export type ListDonationsQuery = z.infer<typeof listDonationsQuerySchema>;

// Moving an animal to another enclosure — RG8.
export const moveAnimalSchema = z.strictObject({
  enclosure_id: z.coerce
    .number({ error: 'A destination enclosure must be chosen' })
    .int()
    .positive({ error: 'A destination enclosure must be chosen' }),

  // Required. A move without a reason cannot be explained afterwards, and the
  // column is what distinguishes a stay opened by a move from one opened by an
  // admission.
  move_reason: z
    .string({ error: 'A reason is required to move an animal' })
    .trim()
    .min(1, { error: 'A reason is required to move an animal' })
    .max(2000),
});

export type MoveAnimalInput = z.infer<typeof moveAnimalSchema>;

// Pronouncing an outcome — RG5, RG6, RG7.
//
// Only the two terminal values are accepted. `in_care` and `recovering` are
// ordinary status changes and go through a different route, not this one.
//
// outcome_by_id and outcome_at are not accepted: the vet is whoever is logged
// in, and the date is the server's.
export const recordOutcomeSchema = z.strictObject({
  outcome: z.enum(['released', 'deceased'], {
    error: 'The outcome must be released or deceased',
  }),

  // Required, not optional. An outcome without a reason is not a medical
  // record, and the three outcome columns are filled together.
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

export const createDonationSchema = z
  .strictObject({
    // RG9 — a donation is between 0 and 10 000. The same rule also exists as a
    // CHECK constraint in the database, on purpose: Zod protects the API, the
    // constraint protects the data whatever writes it.
    amount: z
      .number({ error: 'The amount is required and must be a number' })
      .positive({ error: 'The amount must be greater than 0' })
      .max(10000, { error: 'The amount cannot exceed 10 000' }),

    // RG10, RG11 — the three donor fields are optional. A donation with all
    // three left out is anonymous, and that is a supported case, not an error.
    donor_name: z.string().trim().min(1).max(100).nullish(),
    donor_email: z.email({ error: 'This is not a valid email address' }).max(255).nullish(),
    message: z.string().trim().max(1000).nullish(),

    consent_given: z.boolean(),
  })
  // RGPD. Contact details may only be stored if the donor agreed to it, so the
  // two fields cannot contradict each other. A rule that spans two fields does
  // not fit on either one, which is what refine is for.
  .refine((data) => !data.donor_email || data.consent_given === true, {
    error: 'An email address can only be stored if consent is given',
    path: ['consent_given'],
  });

export type CreateDonationInput = z.infer<typeof createDonationSchema>;

// ---------------------------------------------------------------------------
// Staff accounts — screen 12, administrators only
//
// RG13 is enforced twice, and both are deliberate. The schemas below are
// strictObject, so a request carrying `is_admin` is refused as an unrecognised
// key rather than quietly ignored; and staff.service.ts never writes that
// column whatever it receives. The validation gives a clear error, the service
// makes the rule true even if the validation is ever changed.
// ---------------------------------------------------------------------------

// Written once and reused by account creation and password reset (RG15), so
// the two can never drift apart.
//
// Twelve characters, and nothing else. This follows the ANSSI recommendation:
// length is what makes a password hard to guess, while rules about capitals
// and symbols mostly push people towards "Password123!" and a sticky note.
const passwordRule = z
  .string({ error: 'A password is required' })
  .min(12, { error: 'The password must be at least 12 characters long' })
  .max(200, { error: 'The password cannot exceed 200 characters' });

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

export const staffIdParamsSchema = z.strictObject({
  id: z.coerce
    .number({ error: 'The staff id must be a whole number' })
    .int({ error: 'The staff id must be a whole number' })
    .positive({ error: 'The staff id must be greater than 0' }),
});

export const setStaffActiveSchema = z.strictObject({
  is_active: z.boolean({ error: 'is_active must be true or false' }),
});

export type SetStaffActiveInput = z.infer<typeof setStaffActiveSchema>;

// RG15 — a forgotten password is reset by an administrator. There is no
// current-password field: the administrator does not know it, and that is the
// whole point of the rule. There is no email procedure either.
export const resetPasswordSchema = z.strictObject({
  password: passwordRule,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// The staff list, paginated like every other list (§6.4).
export const listStaffQuerySchema = z.strictObject({
  page: z.coerce
    .number({ error: 'The page must be a whole number' })
    .int({ error: 'The page must be a whole number' })
    .positive({ error: 'The page must be greater than 0' })
    .default(1),
});

export type ListStaffQuery = z.infer<typeof listStaffQuerySchema>;
