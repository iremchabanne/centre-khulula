// The service layer — where the business rules live, written as classes for
// CP 3. A constructor and methods, no inheritance and no patterns.
//
// Each class takes the Prisma client as an argument rather than importing it,
// which is what lets a test build one against a test database. None of them
// knows that HTTP exists: no req, no res, no status codes.

import type { PrismaClient } from '@prisma/client';
import { AppError } from '../errors';
import { pageQuery, pageResult } from '../pagination';
import type { ListSpeciesQuery } from '../schemas';

export class SpeciesService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // The species list — screen 2, paginated like the other lists.
  async findAll(query: ListSpeciesQuery) {
    const species = await this.prisma.species.findMany({
      orderBy: { common_name: 'asc' },
      ...pageQuery(query.page),
    });

    const total = await this.prisma.species.count();

    return pageResult(species, total, query.page);
  }

  // One species, with the two counters the species page shows.
  async findById(id: number) {
    const species = await this.prisma.species.findUnique({ where: { id } });

    if (!species) {
      throw new AppError(`No species with id ${id}`, 404);
    }

    // Counted, never stored — modele-donnees.md §4. A stored counter drifts
    // from the animal table the first time a row is inserted around it.
    const treated = await this.prisma.animal.count({
      where: { species_id: id },
    });
    const released = await this.prisma.animal.count({
      where: { species_id: id, status: 'released' },
    });

    return { ...species, treated, released };
  }
}
