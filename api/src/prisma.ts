// One single Prisma client for the whole application.
//
// One, not one per file: each client opens its own pool of database
// connections, and PostgreSQL accepts a limited number of them.
//
// It connects with config.databaseUrl, which is the khulula_app account — the
// restricted one. This line is where step 9 pays off.

import { PrismaClient } from '@prisma/client';
import { config } from './config';

export const prisma = new PrismaClient({ datasourceUrl: config.databaseUrl });
