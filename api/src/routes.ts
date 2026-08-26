// The routing layer — which URL calls which controller function, and what has
// to pass before it does.
//
// Nothing else. No "if", no database, no rules. Reading this file should tell
// you the whole surface of the API and nothing about how it works.

import { Router } from 'express';
import { listSpecies, getSpecies } from './controllers/species.controller';
import { createDonation } from './controllers/donation.controller';
import { login, logout, getCurrentStaff } from './controllers/auth.controller';
import {
  listEnclosures,
  listFreeEnclosures,
  setEnclosureMaintenance,
} from './controllers/enclosure.controller';
import {
  listPublicAnimals,
  admitAnimal,
  moveAnimal,
  recordAnimalOutcome,
} from './controllers/animal.controller';
import {
  listStaff,
  createStaff,
  setStaffActive,
  resetStaffPassword,
} from './controllers/staff.controller';
import { validate, requireAuth, requireAdmin, requireRole, rateLimit } from './middleware';
import {
  speciesIdParamsSchema,
  createDonationSchema,
  loginSchema,
  enclosureIdParamsSchema,
  setMaintenanceSchema,
  createAdmissionSchema,
  listAnimalsQuerySchema,
  animalIdParamsSchema,
  createStaffSchema,
  staffIdParamsSchema,
  setStaffActiveSchema,
  resetPasswordSchema,
  listStaffQuerySchema,
  moveAnimalSchema,
  recordOutcomeSchema,
} from './schemas';

export const apiRouter = Router();

// Says the API is alive. Used by us to check the server started, and by the
// Docker healthcheck once the api service exists.
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Authentication. There is no /auth/register: staff accounts are created by an
// administrator (RG13), and visitors have no account.
// Rate limited against brute force: without it, an attacker can try passwords
// as fast as the network allows. argon2 is deliberately slow, which already
// makes that expensive, but slow is not the same as refused — OWASP A07.
//
// 10 attempts per quarter of an hour. A member of staff who mistypes their
// password three times in a row is not inconvenienced; a script is stopped.
// The counter is per IP address, so one person being locked out never locks
// out the whole centre.
apiRouter.post('/auth/login', rateLimit(10, 15 * 60), validate({ body: loginSchema }), login);
apiRouter.post('/auth/logout', logout);
apiRouter.get('/auth/me', requireAuth, getCurrentStaff);

// The public routes below are rate limited. The numbers are ours — the cahier
// des charges asks for rate limiting without fixing a figure — and they are
// chosen to be invisible to a real visitor and quickly reached by a script.
//
// 60 reads a minute is one page every second, sustained, which nobody does by
// hand. The donation form gets 5 an hour instead: a real donor sends one, and
// a form with no account behind it is the easiest thing on the site to abuse.
const PUBLIC_PAGES = rateLimit(60, 60);
const DONATION_FORM = rateLimit(5, 60 * 60);

apiRouter.get('/species', PUBLIC_PAGES, listSpecies);
apiRouter.get('/species/:id', PUBLIC_PAGES, validate({ params: speciesIdParamsSchema }), getSpecies);

apiRouter.post(
  '/donations',
  DONATION_FORM,
  validate({ body: createDonationSchema }),
  createDonation,
);

// The public list of animals — no session, screen 4. One route and one filter
// for "in care" and "released": same list, same query, one filter that changes.
apiRouter.get(
  '/animals',
  PUBLIC_PAGES,
  validate({ query: listAnimalsQuerySchema }),
  listPublicAnimals,
);

// Enclosures — staff only. A visitor has no reason to know how full the centre
// is, and the occupant of an enclosure is an animal we may not be showing
// publicly yet.
//
// Putting an enclosure under maintenance is an administrator's decision, so
// that one route asks for more than a session.
apiRouter.get('/enclosures', requireAuth, listEnclosures);
apiRouter.get('/enclosures/free', requireAuth, listFreeEnclosures);
apiRouter.patch(
  '/enclosures/:id/maintenance',
  requireAdmin,
  validate({ params: enclosureIdParamsSchema, body: setMaintenanceSchema }),
  setEnclosureMaintenance,
);

// Admission — the transaction of RG2. Any member of staff may admit an animal;
// only a veterinarian may later pronounce its outcome (RG6), which is a
// different route and comes next.
apiRouter.post('/animals', requireAuth, validate({ body: createAdmissionSchema }), admitAnimal);

// The move — RG8. Any member of staff may move an animal.
apiRouter.patch(
  '/animals/:id/enclosure',
  requireAuth,
  validate({ params: animalIdParamsSchema, body: moveAnimalSchema }),
  moveAnimal,
);

// Staff accounts — screen 12, administrators only. RG13, RG14 and RG15 are in
// StaffService; requireAdmin is what keeps a keeper out of all four routes.
apiRouter.get('/staff', requireAdmin, validate({ query: listStaffQuerySchema }), listStaff);

apiRouter.post('/staff', requireAdmin, validate({ body: createStaffSchema }), createStaff);

apiRouter.patch(
  '/staff/:id/active',
  requireAdmin,
  validate({ params: staffIdParamsSchema, body: setStaffActiveSchema }),
  setStaffActive,
);

apiRouter.patch(
  '/staff/:id/password',
  requireAdmin,
  validate({ params: staffIdParamsSchema, body: resetPasswordSchema }),
  resetStaffPassword,
);

// The outcome — RG6, reserved for a veterinarian. This is where requireRole
// earns its place: a keeper is refused here by the server, whatever the
// interface shows them.
apiRouter.patch(
  '/animals/:id/outcome',
  requireRole('veterinarian'),
  validate({ params: animalIdParamsSchema, body: recordOutcomeSchema }),
  recordAnimalOutcome,
);
