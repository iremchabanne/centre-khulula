// Enclosures — the limited resource the whole centre revolves around.
//
// This class never writes `status`. That column is derived by the trigger of
// migration 20260822102539 (RG3); a method that set it would make the column
// disagree with the stays, and every screen would become a liar.

import type { PrismaClient } from '@prisma/client';
import { AppError } from '../errors';
import { readFreeEnclosures, writeFreeEnclosures, forgetFreeEnclosures } from '../cache';

export class EnclosureService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Every enclosure, and the animal inside it when there is one — screen 8.
  async findAll() {
    const enclosures = await this.prisma.enclosure.findMany({
      orderBy: { code: 'asc' },
      include: {
        // "ended_at is null" is what "stay in progress" means in this model.
        stays: {
          where: { ended_at: null },
          include: {
            animal: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Prisma hands back a list of open stays, but the partial unique index
    // guarantees at most one, so it becomes a single `occupant` field: a screen
    // showing one animal should not reason about an array.
    return enclosures.map((enclosure) => {
      const openStay = enclosure.stays[0];

      let occupant = null;
      if (openStay) {
        occupant = {
          animal_id: openStay.animal.id,
          name: openStay.animal.name,
          since: openStay.started_at,
        };
      }

      return {
        id: enclosure.id,
        code: enclosure.code,
        type: enclosure.type,
        notes: enclosure.notes,
        is_under_maintenance: enclosure.is_under_maintenance,
        status: enclosure.status,
        occupant,
      };
    });
  }

  // The enclosures an animal could be admitted into right now. The one cached
  // read of the application — cache.ts says why a stale answer is safe here.
  async findFree(speciesId?: number) {
    // One species: only the enclosures that suit it (RG17). Not cached — the
    // cache holds one list and this one changes with the species.
    if (speciesId) {
      const species = await this.prisma.species.findUnique({ where: { id: speciesId } });

      if (!species) {
        throw new AppError(`No species with id ${speciesId}`, 404);
      }

      return this.prisma.enclosure.findMany({
        where: { status: 'free', type: species.enclosure_type },
        orderBy: { code: 'asc' },
      });
    }

    const cached = await readFreeEnclosures();

    if (cached) {
      return cached;
    }

    const enclosures = await this.prisma.enclosure.findMany({
      where: { status: 'free' },
      orderBy: { code: 'asc' },
    });

    await writeFreeEnclosures(enclosures);

    return enclosures;
  }

  // RG16 — an enclosure goes under maintenance only while it is free.
  //
  // Here and not in the trigger: the trigger makes maintenance win over
  // everything, so an occupied enclosure would stop saying `occupied` and the
  // animal inside would vanish from the screens. The database computes the
  // consequence; the application decides whether the decision is allowed.
  async setMaintenance(id: number, isUnderMaintenance: boolean) {
    const enclosure = await this.prisma.enclosure.findUnique({ where: { id } });

    if (!enclosure) {
      throw new AppError(`No enclosure with id ${id}`, 404);
    }

    // Coming out of maintenance is always allowed: nothing could have been
    // admitted into it.
    if (isUnderMaintenance && enclosure.status === 'occupied') {
      // 409, not 400: the request is well formed, the state refuses it.
      throw new AppError('An occupied enclosure cannot be put under maintenance', 409);
    }

    // Note what is not in `data`: status. Writing is_under_maintenance fires
    // the trigger, and the trigger writes status.
    const updated = await this.prisma.enclosure.update({
      where: { id },
      data: { is_under_maintenance: isUnderMaintenance },
      select: { id: true, code: true, is_under_maintenance: true, status: true },
    });

    // Cleared after the write, never before: a reader arriving in between would
    // store the old list again.
    await forgetFreeEnclosures();

    return updated;
  }

  // The five numbers of the dashboard. The last two come from the stored
  // functions of migration 20260822103015, not from TypeScript: what counts as
  // a usable enclosure, and how a stay is measured, belong next to the data.
  async getDashboard() {
    const occupied = await this.prisma.enclosure.count({ where: { status: 'occupied' } });
    const free = await this.prisma.enclosure.count({ where: { status: 'free' } });
    const maintenance = await this.prisma.enclosure.count({ where: { status: 'maintenance' } });

    // ::float because both functions return NUMERIC, which Prisma hands back as
    // a string. The average stays null when no stay has ended: "no data" and
    // "zero days" are different facts.
    const rows = await this.prisma.$queryRaw<
      { occupancy_rate: number; average_stay_days: number | null }[]
    >`SELECT occupancy_rate()::float AS occupancy_rate,
             average_stay_length_days()::float AS average_stay_days`;

    return {
      occupied,
      free,
      maintenance,
      occupancy_rate: rows[0].occupancy_rate,
      average_stay_days: rows[0].average_stay_days,
    };
  }
}
