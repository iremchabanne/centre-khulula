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
