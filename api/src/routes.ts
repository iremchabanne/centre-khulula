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
import { admitAnimal, recordAnimalOutcome } from './controllers/animal.controller';
import { validate, requireAuth, requireAdmin, requireRole } from './middleware';
import {
  speciesIdParamsSchema,
  createDonationSchema,
  loginSchema,
  enclosureIdParamsSchema,
  setMaintenanceSchema,
  createAdmissionSchema,
  animalIdParamsSchema,
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
apiRouter.post('/auth/login', validate({ body: loginSchema }), login);
apiRouter.post('/auth/logout', logout);
apiRouter.get('/auth/me', requireAuth, getCurrentStaff);

apiRouter.get('/species', listSpecies);
apiRouter.get('/species/:id', validate({ params: speciesIdParamsSchema }), getSpecies);

apiRouter.post('/donations', validate({ body: createDonationSchema }), createDonation);

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

// The outcome — RG6, reserved for a veterinarian. This is where requireRole
// earns its place: a keeper is refused here by the server, whatever the
// interface shows them.
apiRouter.patch(
  '/animals/:id/outcome',
  requireRole('veterinarian'),
  validate({ params: animalIdParamsSchema, body: recordOutcomeSchema }),
  recordAnimalOutcome,
);
