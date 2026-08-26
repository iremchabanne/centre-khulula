// The three pieces of middleware that wrap every request.
//
// "Middleware" is a function Express runs between receiving the request and
// sending the response. They run in the order they are registered in app.ts.

import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import type { StaffRole } from '@prisma/client';
import { AppError } from './errors';
import { logger } from './logger';
import { AuthService } from './services/auth.service';
import { prisma } from './prisma';
import { redis } from './redis';

const authService = new AuthService(prisma);

// ---------------------------------------------------------------------------
// Access control
//
// These three run BEFORE the controller and stop the request there if the
// caller is not allowed. That is the point: the interface will also hide the
// buttons a keeper must not see, but hiding a button is not a defence. Anyone
// can send the request straight to the API, so the refusal has to happen on
// the server. OWASP A01 — Broken Access Control.
//
// They read the session, which lives in Redis — never a value sent by the
// browser. A caller cannot claim to be an administrator; they can only present
// a session id we issued, and the rights attached to it are ours.
// ---------------------------------------------------------------------------

// The check the three of them share: is anybody logged in at all, and is that
// account still allowed to work?
//
// Two questions, not one. The cookie only proves a session was opened at some
// point; it says nothing about now. So we also read the account from the
// database on every protected request, and refuse a deactivated one (RG12).
// Without that second question an account switched off by an administrator
// would keep working until its session expired eight hours later.
//
// It costs one extra query per protected request, on the primary key — the
// cheapest read a database does. We deliberately do not cache the answer:
// a cache would give a deactivated account a few more seconds of access, and
// that is exactly the thing this check exists to prevent.
//
// Repeated inside each of the three rather than assumed to have run before. If
// a route is written one day with requireAdmin but without requireAuth, it must
// still refuse an anonymous call instead of silently letting it through.
async function requireSession(req: Request) {
  if (!req.session.staffId) {
    throw new AppError('You must be logged in', 401);
  }

  // Throws a 401 if the account was deleted or deactivated since login.
  return authService.findActiveById(req.session.staffId);
}

// Logged in — no more than that. Used on routes any member of staff may call.
//
// Express 5 sends a rejected promise from an async middleware to the central
// error handler on its own, which is why there is no try/catch here.
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  await requireSession(req);
  next();
}

// One business role: keeper or veterinarian. Written as a function that RETURNS
// a middleware, so the role can be named at the route:
//
//     router.post('/animals/:id/outcome', requireRole('veterinarian'), setOutcome)
export function requireRole(role: StaffRole) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const staff = await requireSession(req);

    // The role comes from the database row we have just read, not from the
    // session. Same reason as above: the session is what was true at login.
    if (staff.role !== role) {
      // 403, not 401: we know who this is, they are simply not allowed.
      throw new AppError('Your role does not allow this action', 403);
    }

    next();
  };
}

// The second axis of rights — administering the tool, not the animals. A vet
// is not automatically an admin, and an admin is not automatically a vet:
// is_admin and role are two independent columns, on purpose (RG13).
export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const staff = await requireSession(req);

  if (!staff.is_admin) {
    throw new AppError('This action is reserved for administrators', 403);
  }

  next();
}

// ---------------------------------------------------------------------------
// Rate limiting — Redis's third and last job.
//
// The public pages have no account, so there is nothing to suspend when
// somebody misuses them. A visitor can send the donation form a thousand times
// a minute, or walk the whole animal list in a loop. Counting requests per IP
// address and refusing past a limit is what stands in the way.
//
// HOW IT WORKS, in three lines of Redis. INCR adds one to a counter and
// returns the new value, creating it at 1 if it did not exist. The first time
// we see an address we give that key an expiry, so the counter disappears on
// its own and the visitor starts again with a clean slate. No cleanup job, no
// stored table — this is exactly the kind of short-lived counting a key/value
// database is for, and it is why Redis is in this project.
// ---------------------------------------------------------------------------

export function rateLimit(maxRequests: number, windowSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // The path is part of the key, so the donation form and the animal list
    // have separate counters. Using the same key for both would let a visitor
    // browsing the site use up the budget of the form.
    const key = `khulula:ratelimit:${req.ip}:${req.path}`;

    const count = await redis.incr(key);

    // Only on the first request of a window: setting the expiry every time
    // would push it further away at each request, and the counter would never
    // reset for someone sending requests continuously.
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (count > maxRequests) {
      logger.warn('rate limit reached', { ip: req.ip, path: req.path, count });

      // 429 Too Many Requests. The message says to wait, and deliberately does
      // not say how long or how many are allowed: a number is a hint about how
      // to stay just under the limit.
      throw new AppError('Too many requests. Please wait a moment and try again.', 429);
    }

    next();
  };
}

// Checks the input of a request against the schemas in schemas.ts, before the
// controller runs. Written once here rather than repeated in each controller,
// so every rejected request in the API looks the same to the client, and so
// adding a route cannot accidentally skip validation in a new way.
//
//     router.post('/donations', validate({ body: createDonationSchema }), createDonation)
//                               ^^^^^^^^ runs first; the controller is only
//                                        reached if the input was valid.
export function validate(schemas: { params?: ZodType; body?: ZodType; query?: ZodType }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        respondWithValidationErrors(res, result.error.issues);
        return;
      }

      // Not written back onto req.query, unlike params and body: Express 5
      // made req.query read-only, and assigning to it throws. res.locals is
      // Express's own place for values passed from a middleware to the
      // controller of the same request, so the clean value travels there.
      res.locals.query = result.data;
    }

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
