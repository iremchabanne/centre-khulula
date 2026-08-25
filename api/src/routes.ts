// The routing layer — which URL calls which controller function, and what has
// to pass before it does.
//
// Nothing else. No "if", no database, no rules. Reading this file should tell
// you the whole surface of the API and nothing about how it works.

import { Router } from 'express';
import { listSpecies, getSpecies } from './controllers/species.controller';
import { createDonation } from './controllers/donation.controller';
import { login, logout, getCurrentStaff } from './controllers/auth.controller';
import { validate, requireAuth } from './middleware';
import { speciesIdParamsSchema, createDonationSchema, loginSchema } from './schemas';

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
