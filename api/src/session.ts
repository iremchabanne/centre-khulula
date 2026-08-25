// Staff sessions, stored in Redis.
//
// HOW A SESSION WORKS HERE, in one paragraph. When a member of staff logs in,
// the server creates a random session id, stores the session DATA in Redis
// under that id, and sends the id back in a cookie. The browser returns that
// cookie on every following request, and express-session looks the id up in
// Redis and fills req.session. The browser therefore never holds the role or
// the id of the staff member — only an opaque random string. Everything that
// decides what someone is allowed to do is read from Redis, server-side.
//
// WHY REDIS rather than a token (JWT) the browser keeps. A token cannot be
// taken back: once handed out it stays valid until it expires. RG12 says a
// deactivated account must not be able to work, and the only way to enforce
// that immediately is for the server to hold the session and be able to
// delete it. Deleting a key in Redis logs someone out instantly.
//
// WHY NOT write the session code ourselves. Session handling is security code,
// and hand-written security code is how mistakes get in. express-session is
// the standard library for this and connect-redis is its Redis store.

import session from 'express-session';
import { RedisStore } from 'connect-redis';
import type { Request } from 'express';
import type { StaffRole } from '@prisma/client';
import { redis } from './redis';
import { config } from './config';

// Tells TypeScript what we put inside req.session. Without this block,
// req.session.staffId would be an error: the library cannot guess our fields.
//
// Only these three. A session is a cache of rights, so it stays small and
// holds nothing personal — no name, no email. RGPD, and one less thing to
// keep in step with the database.
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
  // accepted. It does not encrypt anything — the id is not a secret to hide,
  // it is a value to prove we issued.
  secret: config.sessionSecret,

  // The cookie name. The default is "connect.sid", which announces the library
  // being used; a neutral name tells an attacker one thing less.
  name: 'khulula.sid',

  // Do not rewrite the session in Redis on every single request, only when it
  // actually changed.
  resave: false,

  // Do not create a session for a visitor who never logged in. The public
  // pages are anonymous and must not cost a Redis key each.
  saveUninitialized: false,

  cookie: {
    // The cookie is invisible to JavaScript in the page. If an XSS flaw ever
    // gets through, the injected script still cannot read the session id.
    // OWASP A03 — Injection.
    httpOnly: true,

    // CSRF defence. "lax" means the browser does not attach this cookie to a
    // request started by another site, so a form on evil.com cannot make an
    // authenticated call to our API in the background. OWASP A01.
    sameSite: 'lax',

    // In production the cookie travels over HTTPS only. Left off in
    // development, where the server is plain http://localhost.
    secure: config.environment === 'production',

    maxAge: SESSION_DURATION_MS,
  },
});

// express-session is older than promises: regenerate() and destroy() take a
// callback. These two wrappers let the controllers use await, like the rest of
// the code, instead of nesting callbacks.

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
