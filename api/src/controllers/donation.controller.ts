import type { Request, Response } from 'express';
import { DonationService } from '../services/donation.service';
import { prisma } from '../prisma';
import type { CreateDonationInput } from '../schemas';

const donationService = new DonationService(prisma);

export async function createDonation(req: Request, res: Response): Promise<void> {
  // The validate middleware has already parsed and replaced req.body, so this
  // value is known to match the schema. Express types req.body as any, which is
  // why the type is stated here.
  const input = req.body as CreateDonationInput;

  const donation = await donationService.record(input);

  // 201 Created, not 200: a new row now exists.
  res.status(201).json(donation);
}
