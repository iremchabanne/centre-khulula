// Enclosures — the limited resource the whole centre revolves around.
//
// One thing this class deliberately never does: write `status`. That column is
// derived by the trigger in the migration 20260822102539_enclosure_status_trigger
// (RG3). The application reads it. If a method here ever sets it, the column
// starts disagreeing with the stays and every screen becomes a liar.

import type { PrismaClient } from '@prisma/client';
import { AppError } from '../errors';
import { readFreeEnclosures, writeFreeEnclosures, forgetFreeEnclosures } from '../cache';

export class EnclosureService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Every enclosure, and the animal inside it when there is one. This is what
  // the "Enclos — Overview" screen shows.
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

    // Prisma hands back a LIST of open stays. The partial unique index of the
    // migration 20260822100651 guarantees there is at most one, so the list is
    // flattened into a single `occupant` field here: a screen showing one
    // animal should not have to reason about an array that can only hold one.
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

  // The enclosures an animal could be admitted into right now. The admission
  // screen builds its list from this.
  //
  // No occupant to look up here: `free` already means nobody is inside.
  //
  // This is the one cached read of the application — see cache.ts for why this
  // list and no other, and why a stale answer cannot cause a wrong admission.
  async findFree(speciesId?: number) {
    // Asked for one species: only the enclosures that suit it (RG17). Not
    // cached, because the cache holds one list and this one changes with the
    // species. The query is small and runs when a dialog opens, not on a page.
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
  // The rule has to live here and not in the trigger, because the trigger makes
  // maintenance win over everything: put an occupied enclosure under
  // maintenance and its status stops saying `occupied`, so the animal inside
  // disappears from the screens. The database computes the consequence; the
  // application decides whether the decision is allowed in the first place.
  async setMaintenance(id: number, isUnderMaintenance: boolean) {
    const enclosure = await this.prisma.enclosure.findUnique({ where: { id } });

    if (!enclosure) {
      throw new AppError(`No enclosure with id ${id}`, 404);
    }

    // Taking an enclosure OUT of maintenance is always allowed — it is free by
    // definition, since nothing could have been admitted into it.
    if (isUnderMaintenance && enclosure.status === 'occupied') {
      // 409 Conflict, not 400: the request is well formed, it is the current
      // state of the enclosure that refuses it.
      throw new AppError('An occupied enclosure cannot be put under maintenance', 409);
    }

    // Note what is NOT in `data`: status. Writing is_under_maintenance fires
    // the trigger, and the trigger writes status.
    const updated = await this.prisma.enclosure.update({
      where: { id },
      data: { is_under_maintenance: isUnderMaintenance },
      select: { id: true, code: true, is_under_maintenance: true, status: true },
    });

    // The set of free enclosures has just changed, so the cached list is wrong.
    // Cleared after the write and not before: cleared first, a reader arriving
    // in between would store the old list again and the cache would be wrong
    // until it expired.
    await forgetFreeEnclosures();

    return updated;
  }

  // The five numbers of the Enclosures dashboard.
  //
  // The last two come from the stored functions of the migration
  // 20260822103015, not from TypeScript: what counts as a usable enclosure,
  // and how a stay is measured, belong next to the data.
  async getDashboard() {
    const occupied = await this.prisma.enclosure.count({ where: { status: 'occupied' } });
    const free = await this.prisma.enclosure.count({ where: { status: 'free' } });
    const maintenance = await this.prisma.enclosure.count({ where: { status: 'maintenance' } });

    // ::float because both functions return NUMERIC, which Prisma hands back as
    // a string. The average stays null when no stay has ended yet — "no data"
    // and "zero days" are different facts.
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
