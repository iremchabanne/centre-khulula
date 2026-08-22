// The service layer — where the business rules live.
//
// Written as a class, which is the CP 3 criterion: "les bonnes pratiques de la
// programmation orientée objet sont respectées". A constructor and methods,
// nothing more. No inheritance, no patterns.
//
// The class takes the Prisma client as a constructor argument rather than
// importing it. That is what lets a test create a SpeciesService with a test
// database without changing a line of this file.
//
// Note what this file does NOT know: that HTTP exists. No req, no res, no
// status codes. It could be called from a command-line script tomorrow.

import type { PrismaClient } from '@prisma/client';
import { AppError } from '../errors';

export class SpeciesService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Every species, for the public list.
  async findAll() {
    return this.prisma.species.findMany({ orderBy: { common_name: 'asc' } });
  }

  // One species, with the two counters the species page shows.
  async findById(id: number) {
    const species = await this.prisma.species.findUnique({ where: { id } });

    if (!species) {
      throw new AppError(`No species with id ${id}`, 404);
    }

    // The counters are counted, never stored — modele-donnees.md §4. A stored
    // counter and the animal table drift apart the first time something is
    // inserted without going through the code that updates it.
    const treated = await this.prisma.animal.count({
      where: { species_id: id },
    });
    const released = await this.prisma.animal.count({
      where: { species_id: id, status: 'released' },
    });

    return { ...species, treated, released };
  }
}
