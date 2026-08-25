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

  // The account behind an open session.
  //
  // Read from the database rather than from the session, on purpose. The
  // session was written at login and does not change afterwards; the database
  // is current. So an account deactivated while its owner was logged in stops
  // working on the next request instead of at the end of the eight hours.
  // That is RG12 enforced for the whole life of the session, not only at login.
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

    // argon2.verify re-hashes the submitted password with the salt stored
    // inside password_hash and compares the results. The clear password is
    // never stored and never logged, here or anywhere else.
    const passwordMatches = await argon2.verify(staff.password_hash, password);

    if (!passwordMatches) {
      throw new AppError('Email or password is incorrect', 401);
    }

    // RG12 — a deactivated account cannot log in.
    //
    // Checked AFTER the password on purpose: telling someone their account is
    // deactivated before they have proved who they are would confirm that the
    // address exists.
    if (!staff.is_active) {
      throw new AppError('This account has been deactivated', 403);
    }

    // password_hash is deliberately left out. It has no business leaving this
    // method, and a value that never travels cannot leak.
    return {
      id: staff.id,
      full_name: staff.full_name,
      email: staff.email,
      role: staff.role,
      is_admin: staff.is_admin,
    };
  }
}
