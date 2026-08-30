import type { Request, Response } from 'express';
import { EnclosureService } from '../services/enclosure.service';
import { prisma } from '../prisma';
import type { SetMaintenanceInput } from '../schemas';

const enclosureService = new EnclosureService(prisma);

export async function listEnclosures(req: Request, res: Response): Promise<void> {
  const enclosures = await enclosureService.findAll();

  res.json(enclosures);
}

export async function listFreeEnclosures(req: Request, res: Response): Promise<void> {
  const enclosures = await enclosureService.findFree();

  res.json(enclosures);
}

export async function getDashboard(req: Request, res: Response): Promise<void> {
  const dashboard = await enclosureService.getDashboard();

  res.json(dashboard);
}

export async function setEnclosureMaintenance(req: Request, res: Response): Promise<void> {
  // Both have been parsed by the validate middleware before this line ran.
  const { id } = req.params as unknown as { id: number };
  const input = req.body as SetMaintenanceInput;

  const enclosure = await enclosureService.setMaintenance(id, input.is_under_maintenance);

  res.json(enclosure);
}
