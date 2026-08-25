import type { Request, Response } from 'express';
import { AnimalService } from '../services/animal.service';
import { prisma } from '../prisma';
import { logger } from '../logger';
import type { CreateAdmissionInput } from '../schemas';

const animalService = new AnimalService(prisma);

export async function admitAnimal(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateAdmissionInput;

  // requireAuth ran before this, so the id is there.
  const staffId = req.session.staffId!;

  const admission = await animalService.admit(input, staffId);

  logger.info('admission', {
    animalId: admission.id,
    enclosure: admission.enclosure.code,
    staffId,
  });

  res.status(201).json(admission);
}
