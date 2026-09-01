// Checking who somebody is.
//
// This class knows nothing about HTTP, cookies or sessions — it answers one
// question: "do this email and this password belong to an account allowed to
// work?". Creating the session is the controller's job.

import type { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { AppError } from '../errors';

export class AuthService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // The account behind an open session, read from the database and not from
  // the session: the session is what was true at login. This is RG12 enforced
  // for the whole life of the session rather than only at login.
  async findActiveById(staffId: number) {
    const staff = await this.prisma.staffMember.findUnique({ where: { id: staffId } });

    if (!staff || !staff.is_active) {
      throw new AppError('You must be logged in', 401);
    }

    return {
      id: staff.id,
      full_name: staff.full_name,
      email: staff.email,
      role: staff.role,
      is_admin: staff.is_admin,
    };
  }

  // Returns the staff member if the credentials are right, throws otherwise.
  async verifyCredentials(email: string, password: string) {
    const staff = await this.prisma.staffMember.findUnique({ where: { email } });

    if (!staff) {
      // The same message as a wrong password, on purpose. "No such account"
      // would let anyone test a list of email addresses and learn which ones
      // are real. OWASP A07 — Identification and Authentication Failures.
      throw new AppError('Email or password is incorrect', 401);
    }

    // Re-hashes the submitted password with the salt stored inside
    // password_hash. The clear password is never stored and never logged.
    const passwordMatches = await argon2.verify(staff.password_hash, password);

    if (!passwordMatches) {
      throw new AppError('Email or password is incorrect', 401);
    }

    // RG12. Checked after the password: saying an account is deactivated
    // before the caller has proved who they are confirms the address exists.
    if (!staff.is_active) {
      throw new AppError('This account has been deactivated', 403);
    }

    // password_hash is left out: a value that never travels cannot leak.
    return {
      id: staff.id,
      full_name: staff.full_name,
      email: staff.email,
      role: staff.role,
      is_admin: staff.is_admin,
    };
  }
}
