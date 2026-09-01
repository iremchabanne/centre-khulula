// Builds the Express application: the middleware, in order, and the routes.
//
// Why this is separate from server.ts — the file that opens the port. A test
// needs the application, not a listening server. Keeping them apart means the
// integration tests of step 23 can call createApp() and send requests to it
// without occupying port 3000.

import express from 'express';
import { apiRouter } from './routes';
import { requestLogger, notFoundHandler, errorHandler } from './middleware';
import { sessionMiddleware } from './session';

export function createApp() {
  const app = express();

  // One proxy stands in front (nginx in production, Vite in development), so
  // req.ip must read the address it forwards, not the proxy's own. Without
  // this the rate limiter counts every visitor as the same person.
  app.set('trust proxy', 1);

  // Reads a JSON request body into req.body.
  app.use(express.json());

  app.use(requestLogger);

  // Reads the session cookie and fills req.session from Redis. It has to run
  // before the routes, because a route may need to know who is calling.
  app.use(sessionMiddleware);

  // Everything the API offers lives under /api.
  app.use('/api', apiRouter);

  // These two go last, and in this order: notFoundHandler catches a URL no
  // route matched, errorHandler catches everything that was thrown.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
