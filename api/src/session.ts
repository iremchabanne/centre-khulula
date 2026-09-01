// Staff sessions, stored in Redis — Redis's first job.
//
// At login the server creates a random session id, stores the data in Redis
// under it, and sends the id back in a cookie. The browser holds nothing but
// that opaque string: everything deciding what someone may do is read
// server-side.
//
// Redis rather than a token the browser keeps (JWT): a token cannot be taken
// back once handed out, and RG12 says a deactivated account must stop working
// immediately. Deleting a key in Redis logs someone out instantly.
//
// express-session and connect-redis rather than our own code: session handling
// is security code, and hand-written security code is how mistakes get in.

import session from 'express-session';
import { RedisStore } from 'connect-redis';
import type { Request } from 'express';
import type { StaffRole } from '@prisma/client';
import { redis } from './redis';
import { config } from './config';

// Tells TypeScript what we put inside req.session; the library cannot guess.
// Only these three: a session holds nothing personal — no name, no email.
declare module 'express-session' {
  interface SessionData {
    staffId: number;
    role: StaffRole;
    isAdmin: boolean;
  }
}

// Eight hours: one working day at the centre. After that the session key
// expires in Redis on its own and the person logs in again.
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export const sessionMiddleware = session({
  store: new RedisStore({
    client: redis,
    // Every key we write starts with this, so `KEYS khulula:session:*` in
    // redis-cli shows the sessions and nothing else.
    prefix: 'khulula:session:',
  }),

  // Signs the cookie, so a browser cannot invent a session id and have it
  // accepted. It encrypts nothing: the id is a value to prove we issued it.
  secret: config.sessionSecret,

  // The default is "connect.sid", which announces the library being used.
  name: 'khulula.sid',

  // Rewrite the session in Redis only when it actually changed.
  resave: false,

  // No session for a visitor who never logged in: the public pages are
  // anonymous and must not cost a Redis key each.
  saveUninitialized: false,

  cookie: {
    // Invisible to JavaScript, so an injected script cannot read the session id
    // even if an XSS flaw got through.
    httpOnly: true,

    // CSRF defence: the browser does not attach this cookie to a request
    // started by another site, so a form on evil.com cannot call our API.
    sameSite: 'lax',

    // HTTPS only in production; off in development, which is plain localhost.
    secure: config.environment === 'production',

    maxAge: SESSION_DURATION_MS,
  },
});

// express-session is older than promises: regenerate() and destroy() take a
// callback. These wrappers let the controllers use await like everywhere else.

export function regenerateSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

export function destroySession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
