// RG12 — a deactivated account loses access immediately, not in eight hours.
//
// THE DEFECT THIS TEST GUARDS, found on 26/08/2026. requireSession trusted the
// session, and the session was written at login. So an account deactivated
// while its owner was working kept full access until the session expired. The
// fix was to read the account from the database on every protected request,
// which is what AuthService.findActiveById does.
//
// WHAT THIS TEST COVERS, and what it does not. It calls findActiveById
// directly — the function requireSession runs on every protected request, and
// the one that was wrong. It does NOT go through Express, so it does not prove
// the middleware is wired to the routes. That half stays with the manual
// script, api/scripts/check-deactivated-account.sh, which drives the real API
// over HTTP with a real cookie.
//
// Splitting it this way on purpose: starting a server inside a test would add
// more machinery than the rule is worth.
//
// Needs the development stack running:
//     docker compose up -d
//     npm test

import { test, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../src/services/auth.service';
import { AppError } from '../src/errors';

// The service runs as khulula_app, like the API does. Switching the account off
// and on again is test setup, so it uses khulula_admin.
const appPrisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL_APP });
const adminPrisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

const authService = new AuthService(appPrisma);

let staffId: number;

beforeAll(async () => {
  const staff = await appPrisma.staffMember.findFirst({ where: { is_active: true } });

  if (!staff) {
    throw new Error('The database has no active staff member. Run `npm run seed`.');
  }

  staffId = staff.id;
});

afterAll(async () => {
  // Always put the account back, including after a failed run — otherwise the
  // seed data is left broken for the next test and for the running app.
  await adminPrisma.staffMember.update({
    where: { id: staffId },
    data: { is_active: true },
  });

  await appPrisma.$disconnect();
  await adminPrisma.$disconnect();
});

test('an account deactivated mid-session is refused on the next request', async () => {
  // Before: the account works, which is what makes the "after" meaningful.
  const before = await authService.findActiveById(staffId);

  expect(before.id).toBe(staffId);

  // The administrator deactivates the account. The session is untouched — the
  // person is still logged in, holding a valid cookie.
  await adminPrisma.staffMember.update({
    where: { id: staffId },
    data: { is_active: false },
  });

  // The very next protected request must be refused. 401 and not 403: as far
  // as the application is concerned there is no longer anybody logged in.
  await expect(authService.findActiveById(staffId)).rejects.toThrow(AppError);
  await expect(authService.findActiveById(staffId)).rejects.toMatchObject({ statusCode: 401 });
});
