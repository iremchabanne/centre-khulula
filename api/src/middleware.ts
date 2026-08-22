// The three pieces of middleware that wrap every request.
//
// "Middleware" is a function Express runs between receiving the request and
// sending the response. They run in the order they are registered in app.ts.

import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { AppError } from './errors';
import { logger } from './logger';

// Checks the input of a request against the schemas in schemas.ts, before the
// controller runs. Written once here rather than repeated in each controller,
// so every rejected request in the API looks the same to the client, and so
// adding a route cannot accidentally skip validation in a new way.
//
//     router.post('/donations', validate({ body: createDonationSchema }), createDonation)
//                               ^^^^^^^^ runs first; the controller is only
//                                        reached if the input was valid.
export function validate(schemas: { params?: ZodType; body?: ZodType }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        respondWithValidationErrors(res, result.error.issues);
        return;
      }
      // Put the parsed value back: "12" the string has become 12 the number,
      // and the controller receives the clean version.
      req.params = result.data as typeof req.params;
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        respondWithValidationErrors(res, result.error.issues);
        return;
      }
      req.body = result.data;
    }

    next();
  };
}

// One shape for every validation failure, so the frontend can show the errors
// next to the right fields without guessing.
function respondWithValidationErrors(
  res: Response,
  issues: { path: PropertyKey[]; message: string }[],
): void {
  res.status(400).json({
    error: 'Invalid request',
    details: issues.map((issue) => ({
      // Some problems are about the request as a whole rather than one field —
      // an unknown key, for instance — and their path is empty.
      field: issue.path.join('.') || '(request)',
      message: issue.message,
    })),
  });
}

// Logs one line per request, once the response has actually been sent — which
// is when we know its status code and how long it took.
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = Date.now();

  res.on('finish', () => {
    logger.info('request', {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      ms: Date.now() - startedAt,
    });
  });

  next();
}

// Reached when no route matched the URL.
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}

// The central error handler. Express recognises it by its four arguments and
// sends it every error thrown anywhere in a route, controller or service.
//
// This is the only place in the API that turns an error into a response, so
// the rule below is applied once instead of being repeated in every controller.
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // An error we raised on purpose. Its message describes what the caller did
  // wrong, so it is safe and useful to send back.
  if (error instanceof AppError) {
    logger.warn('rejected request', {
      path: req.originalUrl,
      status: error.statusCode,
      reason: error.message,
    });
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  // Anything else is a bug or a database failure. The detail is written to the
  // server log, where we can read it, and the client gets a generic sentence.
  //
  // This is a security decision, not tidiness. A stack trace or a raw SQL error
  // tells an attacker the framework, the table names and the query shape.
  // OWASP calls it Security Misconfiguration (A05).
  logger.error('unhandled error', {
    path: req.originalUrl,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  res.status(500).json({ error: 'Internal server error' });
}
