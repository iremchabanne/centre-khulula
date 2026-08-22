// The routing layer — which URL calls which controller function.
//
// Nothing else. No "if", no database, no rules. Reading this file should tell
// you the whole surface of the API and nothing about how it works.

import { Router } from 'express';
import { listSpecies, getSpecies } from './controllers/species.controller';

export const apiRouter = Router();

// Says the API is alive. Used by Docker's healthcheck at step 11 of the plan,
// and by us right now to check the server started.
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

apiRouter.get('/species', listSpecies);
apiRouter.get('/species/:id', getSpecies);
