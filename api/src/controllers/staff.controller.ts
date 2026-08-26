import type { Request, Response } from 'express';
import { StaffService } from '../services/staff.service';
import { prisma } from '../prisma';
import { logger } from '../logger';
import type {
  CreateStaffInput,
  SetStaffActiveInput,
  ResetPasswordInput,
  ListStaffQuery,
} from '../schemas';

const staffService = new StaffService(prisma);

export async function listStaff(req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListStaffQuery;

  const staff = await staffService.findAll(query);
  res.json(staff);
}

export async function createStaff(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateStaffInput;

  const staff = await staffService.create(input);

  // Who did what to whose account. Never the password.
  logger.info('staff created', { staffId: staff.id, byStaffId: req.session.staffId });

  res.status(201).json(staff);
}

export async function setStaffActive(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as { id: number };
  const input = req.body as SetStaffActiveInput;

  // requireAdmin ran first, so the id is there. RG14 needs it.
  const currentStaffId = req.session.staffId!;

  const staff = await staffService.setActive(id, input.is_active, currentStaffId);

  logger.info('staff activity changed', {
    staffId: staff.id,
    isActive: staff.is_active,
    byStaffId: currentStaffId,
  });

  res.json(staff);
}

export async function resetStaffPassword(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as { id: number };
  const input = req.body as ResetPasswordInput;

  const staff = await staffService.resetPassword(id, input.password);

  logger.info('staff password reset', { staffId: staff.id, byStaffId: req.session.staffId });

  res.json(staff);
}
