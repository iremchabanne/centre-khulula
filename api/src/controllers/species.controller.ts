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
import type { ListSpeciesQuery } from '../schemas';

const speciesService = new SpeciesService(prisma);

export async function listSpecies(req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListSpeciesQuery;

  const species = await speciesService.findAll(query);
  res.json(species);
}

export async function getSpecies(req: Request, res: Response): Promise<void> {
  // The validate middleware has already checked and converted this: "abc" was
  // refused before reaching here, and "12" arrived as the number 12.
  const id = Number(req.params.id);

  const species = await speciesService.findById(id);
  res.json(species);
}
