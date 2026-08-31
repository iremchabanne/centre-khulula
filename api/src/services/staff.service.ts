// Staff accounts — screen 12, administrators only.
//
//   RG13  an account created from the interface is never an administrator.
//   RG14  nobody deactivates their own account, and the last active
//         administrator cannot be deactivated — otherwise nobody could ever
//         administer anything again.
//   RG15  a forgotten password is reset by an administrator, not by email.
//
// Nothing here deletes an account: deactivation is the only way out, so the
// stays and observations a person signed keep pointing at a real name.

import { Prisma, type PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { AppError } from '../errors';
import { pageQuery, pageResult } from '../pagination';
import type { CreateStaffInput, ListStaffQuery } from '../schemas';

// The columns that may leave this class. password_hash is not among them.
const publicFields = {
  id: true,
  full_name: true,
  email: true,
  role: true,
  is_admin: true,
  is_active: true,
  created_at: true,
};

export class StaffService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(query: ListStaffQuery) {
    const where: Prisma.StaffMemberWhereInput = {};

    if (query.search) {
      // OR: kept if the text matches the name or the email.
      // `contains` becomes a parameterised LIKE — the text is never executed.
      where.OR = [
        { full_name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const staff = await this.prisma.staffMember.findMany({
      where,
      orderBy: { full_name: 'asc' },
      select: publicFields,
      ...pageQuery(query.page),
    });

    // The same `where`, or the pager would count the whole table.
    const total = await this.prisma.staffMember.count({ where });

    return pageResult(staff, total, query.page);
  }

  // RG13 — is_admin is simply not in the data below, so the column keeps its
  // default of false. The two admins of the centre come from the seed.
  async create(input: CreateStaffInput) {
    const passwordHash = await argon2.hash(input.password);

    try {
      return await this.prisma.staffMember.create({
        data: {
          full_name: input.full_name,
          email: input.email,
          password_hash: passwordHash,
          role: input.role,
        },
        select: publicFields,
      });
    } catch (error) {
      // The email column is unique; Prisma reports the violation as P2002.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('An account already exists with this email address', 409);
      }

      throw error;
    }
  }

  // RG14. currentStaffId is the administrator making the request, read from
  // the session — never from the body, or the rule could be talked around.
  async setActive(id: number, isActive: boolean, currentStaffId: number) {
    const staff = await this.prisma.staffMember.findUnique({ where: { id } });

    if (!staff) {
      throw new AppError(`No staff member with id ${id}`, 404);
    }

    // Reactivating can never lock anybody out, so it is always allowed.
    if (!isActive) {
      if (id === currentStaffId) {
        throw new AppError('You cannot deactivate your own account', 409);
      }

      // Counted, not assumed: the centre has two administrators today, and
      // nothing in the code says it always will.
      //
      // `staff.is_active` matters here. Without it, switching off an
      // administrator who is already switched off answers "the last active
      // administrator cannot be deactivated" — which is false and confusing,
      // since that account is not active in the first place.
      if (staff.is_admin && staff.is_active) {
        const activeAdmins = await this.prisma.staffMember.count({
          where: { is_admin: true, is_active: true },
        });

        if (activeAdmins <= 1) {
          throw new AppError('The last active administrator cannot be deactivated', 409);
        }
      }
    }

    return this.prisma.staffMember.update({
      where: { id },
      data: { is_active: isActive },
      select: publicFields,
    });
  }

  // RG15. No current password is asked for: the administrator does not know it
  // and must not need it. Note this does not close the person's open sessions.
  async resetPassword(id: number, password: string) {
    const staff = await this.prisma.staffMember.findUnique({ where: { id } });

    if (!staff) {
      throw new AppError(`No staff member with id ${id}`, 404);
    }

    const passwordHash = await argon2.hash(password);

    return this.prisma.staffMember.update({
      where: { id },
      data: { password_hash: passwordHash },
      select: publicFields,
    });
  }
}
