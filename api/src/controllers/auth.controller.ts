import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { prisma } from '../prisma';
import { regenerateSession, destroySession } from '../session';
import { logger } from '../logger';
import type { LoginInput } from '../schemas';

const authService = new AuthService(prisma);

export async function login(req: Request, res: Response): Promise<void> {
  const input = req.body as LoginInput;

  // Throws an AppError if the credentials are wrong or the account is
  // deactivated. The central error handler turns it into the response, so
  // there is no try/catch and no error branch to read here.
  const staff = await authService.verifyCredentials(input.email, input.password);

  // A fresh session id, before writing anything into the session.
  //
  // This is the defence against session fixation: an attacker who managed to
  // put a session id of their choosing in the victim's browser would otherwise
  // hold a valid id the moment the victim logs in. Regenerating throws that id
  // away and issues a new one.
  await regenerateSession(req);

  req.session.staffId = staff.id;
  req.session.role = staff.role;
  req.session.isAdmin = staff.is_admin;

  // Who logged in and when. The password is not in this line and must never be.
  logger.info('login', { staffId: staff.id, role: staff.role });

  res.json(staff);
}

// Who am I? The frontend calls this when it loads, to know whether it still
// has a session and whose menu to draw.
export async function getCurrentStaff(req: Request, res: Response): Promise<void> {
  // requireAuth has already refused the request if there is no session, so the
  // id is there. TypeScript does not know that, which is what the ! says.
  const staffId = req.session.staffId!;

  const staff = await authService.findActiveById(staffId);

  res.json(staff);
}

export async function logout(req: Request, res: Response): Promise<void> {
  const staffId = req.session.staffId;

  // Deletes the key in Redis, so the session is gone server-side and not
  // merely forgotten by the browser.
  await destroySession(req);

  // And removes the cookie, so the browser stops sending a dead id.
  res.clearCookie('khulula.sid');

  logger.info('logout', { staffId });

  // 204 No Content: it worked, there is nothing to send back.
  res.status(204).send();
}
