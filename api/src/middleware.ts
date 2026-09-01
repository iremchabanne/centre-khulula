// The middleware that wraps every request. "Middleware" is a function Express
// runs between receiving the request and sending the response; they run in the
// order app.ts registers them.

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
// Access control — OWASP A01
//
// The interface also hides the buttons a keeper must not see, but hiding a
// button is not a defence: anyone can call the API directly. The rights come
// from the account row, never from a value the browser sent.
// ---------------------------------------------------------------------------

// Two questions: is anybody logged in, and is that account still active? The
// cookie only proves a session was opened at some point, so the account is
// re-read on every protected request and a deactivated one is refused (RG12).
// Deliberately not cached — a cache would grant exactly the seconds this check
// exists to prevent.
async function requireSession(req: Request) {
  if (!req.session.staffId) {
    throw new AppError('You must be logged in', 401);
  }

  // Throws a 401 if the account was deleted or deactivated since login.
  return authService.findActiveById(req.session.staffId);
}

// Logged in, no more than that. Express 5 sends a rejected promise from an
// async middleware to the central error handler, so there is no try/catch.
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  await requireSession(req);
  next();
}

// One business role. A function that returns a middleware, so the role is named
// at the route: requireRole('veterinarian').
export function requireRole(role: StaffRole) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const staff = await requireSession(req);

    // From the row just read, not from the session: the session is what was
    // true at login.
    if (staff.role !== role) {
      // 403, not 401: we know who this is, they are simply not allowed.
      throw new AppError('Your role does not allow this action', 403);
    }

    next();
  };
}

// The second axis of rights — administering the tool, not the animals. A vet is
// not automatically an admin: `is_admin` and `role` are independent (RG13).
export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const staff = await requireSession(req);

  if (!staff.is_admin) {
    throw new AppError('This action is reserved for administrators', 403);
  }

  next();
}

// ---------------------------------------------------------------------------
// Rate limiting — Redis's third job. The public pages have no account, so there
// is nothing to suspend; counting requests per IP is what stands in the way.
// ---------------------------------------------------------------------------

export function rateLimit(maxRequests: number, windowSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // The path is part of the key, so browsing the site cannot use up the
    // budget of the donation form.
    const key = `khulula:ratelimit:${req.ip}:${req.path}`;

    // INCR adds one and returns the new value, creating the key at 1.
    const count = await redis.incr(key);

    // Only on the first request of a window: setting the expiry every time
    // would push it further away and the counter would never reset.
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (count > maxRequests) {
      logger.warn('rate limit reached', { ip: req.ip, path: req.path, count });

      // The message deliberately says neither the limit nor how long to wait:
      // a number is a hint about how to stay just under it.
      throw new AppError('Too many requests. Please wait a moment and try again.', 429);
    }

    next();
  };
}

// Checks a request against the schemas of schemas.ts, before the controller:
// validate({ body: createDonationSchema })
export function validate(schemas: { params?: ZodType; body?: ZodType; query?: ZodType }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        respondWithValidationErrors(res, result.error.issues);
        return;
      }

      // Express 5 made req.query read-only, so the clean value travels in
      // res.locals instead — Express's own place for that.
      res.locals.query = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        respondWithValidationErrors(res, result.error.issues);
        return;
      }
      // Put the parsed value back: the string "12" has become the number 12.
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

// One shape for every validation failure, so the frontend can put each message
// next to the right field.
function respondWithValidationErrors(
  res: Response,
  issues: { path: PropertyKey[]; message: string }[],
): void {
  res.status(400).json({
    error: 'Invalid request',
    details: issues.map((issue) => ({
      // An unknown key is about the request as a whole, so its path is empty.
      field: issue.path.join('.') || '(request)',
      message: issue.message,
    })),
  });
}

// One log line per request, written once the response has been sent — which is
// when the status code and the duration are known.
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

// The central error handler — Express recognises it by its four arguments. It
// is the only place that turns an error into a response.
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Raised on purpose: the message describes what the caller did wrong, so it
  // is safe to send back.
  if (error instanceof AppError) {
    logger.warn('rejected request', {
      path: req.originalUrl,
      status: error.statusCode,
      reason: error.message,
    });
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  // A body that is not JSON at all fails inside express.json(), before any Zod
  // schema, and used to fall through to the 500 below. Found by fuzzing on
  // 27/08/2026. `type` is tested too: a SyntaxError from a real bug stays a 500.
  if (error instanceof SyntaxError && (error as { type?: string }).type === 'entity.parse.failed') {
    logger.warn('rejected request', { path: req.originalUrl, status: 400, reason: 'invalid JSON' });
    res.status(400).json({ error: 'The request body is not valid JSON' });
    return;
  }

  // Anything else is a bug or a database failure. The detail goes to the server
  // log and the client gets a generic sentence: a stack trace or a raw SQL
  // error would tell an attacker the table names and the query shape (A05).
  logger.error('unhandled error', {
    path: req.originalUrl,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  res.status(500).json({ error: 'Internal server error' });
}
