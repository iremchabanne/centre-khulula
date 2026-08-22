// The controller layer — the translator between HTTP and the service.
//
// It reads the request, calls one service method, and writes the response.
// That is all it is allowed to do. Any "if" that expresses a rule about the
// centre belongs in the service, not here.
//
// Nothing catches errors here. Express 5 sends a rejected promise straight to
// the error handler in middleware.ts, so a try/catch in every controller would
// only repeat what is already written once.

import type { Request, Response } from 'express';
import { SpeciesService } from '../services/species.service';
import { prisma } from '../prisma';
import { AppError } from '../errors';

const speciesService = new SpeciesService(prisma);

export async function listSpecies(req: Request, res: Response): Promise<void> {
  const species = await speciesService.findAll();
  res.json(species);
}

export async function getSpecies(req: Request, res: Response): Promise<void> {
  // A URL segment is always text: "/api/species/abc" gives the string "abc",
  // and Number('abc') is NaN. Checking it here stops a meaningless value
  // reaching the database.
  //
  // Provisional. Step 12 replaces this with Zod, so that every input in the
  // API is validated the same way in one place per resource.
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError('The species id must be a positive whole number', 400);
  }

  const species = await speciesService.findById(id);
  res.json(species);
}
