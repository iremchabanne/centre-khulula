import type { Request, Response } from 'express';
import { AnimalService } from '../services/animal.service';
import { prisma } from '../prisma';
import { logger } from '../logger';
import type {
  CreateAdmissionInput,
  RecordOutcomeInput,
  MoveAnimalInput,
  ListAnimalsQuery,
  CreateObservationInput,
} from '../schemas';

const animalService = new AnimalService(prisma);

export async function listPublicAnimals(req: Request, res: Response): Promise<void> {
  // validate({ query: … }) ran first and left the checked value here. See the
  // comment in middleware.ts for why it travels through res.locals.
  const query = res.locals.query as ListAnimalsQuery;

  const animals = await animalService.findPublicList(query);
  res.json(animals);
}

export async function getAnimal(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as { id: number };

  const animal = await animalService.findById(id);
  res.json(animal);
}

export async function addObservation(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as { id: number };
  const input = req.body as CreateObservationInput;
  const staffId = req.session.staffId!;

  const observation = await animalService.addObservation(id, input, staffId);

  logger.info('observation', {
    animalId: id,
    statusAfter: observation.status_after,
    staffId,
  });

  res.status(201).json(observation);
}

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

export async function moveAnimal(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as { id: number };
  const input = req.body as MoveAnimalInput;
  const staffId = req.session.staffId!;

  const move = await animalService.move(id, input, staffId);

  logger.info('move', { animalId: move.id, to: move.enclosure.code, staffId });

  res.json(move);
}

export async function recordAnimalOutcome(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as { id: number };
  const input = req.body as RecordOutcomeInput;

  // requireRole('veterinarian') ran before this, so the caller is a vet.
  const staffId = req.session.staffId!;

  const animal = await animalService.recordOutcome(id, input, staffId);

  logger.info('outcome', { animalId: animal.id, outcome: animal.status, staffId });

  res.json(animal);
}
