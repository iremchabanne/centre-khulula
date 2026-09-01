// The routing layer — which URL calls which controller, and what has to pass
// before it does. No "if", no database, no rules: this file is the surface of
// the API and says nothing about how it works.

import { Router } from 'express';
import { listSpecies, getSpecies } from './controllers/species.controller';
import { createDonation, listDonations } from './controllers/donation.controller';
import { login, logout, getCurrentStaff } from './controllers/auth.controller';
import {
  listEnclosures,
  listFreeEnclosures,
  getDashboard,
  setEnclosureMaintenance,
} from './controllers/enclosure.controller';
import {
  listPublicAnimals,
  listStaffAnimals,
  getAnimal,
  addObservation,
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
  listSpeciesQuerySchema,
  createDonationSchema,
  loginSchema,
  listFreeEnclosuresQuerySchema,
  enclosureIdParamsSchema,
  setMaintenanceSchema,
  createAdmissionSchema,
  listAnimalsQuerySchema,
  listStaffAnimalsQuerySchema,
  listDonationsQuerySchema,
  createObservationSchema,
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

// The limits are ours — the cahier des charges asks for rate limiting without
// fixing a figure. 60 reads a minute is one page a second, which nobody does by
// hand; the donation form gets 5 an hour, being the easiest thing on the site
// to abuse with no account behind it.
const PUBLIC_PAGES = rateLimit(60, 60);
const DONATION_FORM = rateLimit(5, 60 * 60);

// Says the API is alive. Used by the Docker healthcheck.
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// --- Authentication --------------------------------------------------------
// There is no /auth/register: accounts are created by an administrator (RG13).
// The login is rate limited against brute force — argon2 is deliberately slow,
// but slow is not refused (OWASP A07). Ten attempts a quarter of an hour never
// inconveniences someone who mistypes, and the counter is per IP, so one person
// being locked out never locks out the centre.
apiRouter.post('/auth/login', rateLimit(10, 15 * 60), validate({ body: loginSchema }), login);
apiRouter.post('/auth/logout', logout);
apiRouter.get('/auth/me', requireAuth, getCurrentStaff);

// --- Public ----------------------------------------------------------------
apiRouter.get('/species', PUBLIC_PAGES, validate({ query: listSpeciesQuerySchema }), listSpecies);
apiRouter.get('/species/:id', PUBLIC_PAGES, validate({ params: speciesIdParamsSchema }), getSpecies);

apiRouter.post('/donations', DONATION_FORM, validate({ body: createDonationSchema }), createDonation);

// Screen 4 — one route and one filter for "in care" and "released".
apiRouter.get('/animals', PUBLIC_PAGES, validate({ query: listAnimalsQuerySchema }), listPublicAnimals);

// --- Enclosures, staff only ------------------------------------------------
// A visitor has no reason to know how full the centre is, and the occupant of
// an enclosure may be an animal not shown publicly yet.
apiRouter.get('/enclosures', requireAuth, listEnclosures);

apiRouter.get(
  '/enclosures/free',
  requireAuth,
  validate({ query: listFreeEnclosuresQuerySchema }),
  listFreeEnclosures,
);

// Maintenance is an administrator's decision, so this route asks for more than
// a session.
apiRouter.patch(
  '/enclosures/:id/maintenance',
  requireAdmin,
  validate({ params: enclosureIdParamsSchema, body: setMaintenanceSchema }),
  setEnclosureMaintenance,
);

// The five numbers of the dashboard. Two come from the stored functions, so
// this route is where the application uses them.
apiRouter.get('/dashboard', requireAuth, getDashboard);

// --- Animals, staff only ---------------------------------------------------
// Admission — the transaction of RG2. Any member of staff may admit an animal.
apiRouter.post('/animals', requireAuth, validate({ body: createAdmissionSchema }), admitAnimal);

// Declared BEFORE /animals/:id, and the order matters: Express tries routes in
// the order they are registered, so ":id" would otherwise match "all".
apiRouter.get(
  '/animals/all',
  requireAuth,
  validate({ query: listStaffAnimalsQuerySchema }),
  listStaffAnimals,
);

apiRouter.get('/animals/:id', requireAuth, validate({ params: animalIdParamsSchema }), getAnimal);

// An observation, and the status change when there is one — RG4, RG5.
apiRouter.post(
  '/animals/:id/observations',
  requireAuth,
  validate({ params: animalIdParamsSchema, body: createObservationSchema }),
  addObservation,
);

// The move — RG8.
apiRouter.patch(
  '/animals/:id/enclosure',
  requireAuth,
  validate({ params: animalIdParamsSchema, body: moveAnimalSchema }),
  moveAnimal,
);

// The outcome — RG6, and where requireRole earns its place: a keeper is refused
// here by the server, whatever the interface shows them.
apiRouter.patch(
  '/animals/:id/outcome',
  requireRole('veterinarian'),
  validate({ params: animalIdParamsSchema, body: recordOutcomeSchema }),
  recordAnimalOutcome,
);

// --- Administrators only ---------------------------------------------------
// Screen 11 — the donor's name and email appear here, the one place they were
// collected for.
apiRouter.get(
  '/donations',
  requireAdmin,
  validate({ query: listDonationsQuerySchema }),
  listDonations,
);

// Screen 12 — RG13, RG14 and RG15 live in StaffService; requireAdmin is what
// keeps a keeper out of all four routes.
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
