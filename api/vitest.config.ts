// Vitest configuration. One setting, and it exists for one reason.
//
// The tests talk to the real PostgreSQL of the development stack, so they need
// DATABASE_URL and DATABASE_URL_APP. `npm run dev` gets them from --env-file,
// but vitest has no such flag. loadEnv reads api/.env and hands every variable
// to the tests. The empty third argument means "no prefix filter": load them
// all, not only the ones starting with VITE_.

import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => ({
  test: {
    env: loadEnv(mode, process.cwd(), ''),

    // These tests open real database transactions that wait on each other.
    // Running files in parallel would have them fight over the same enclosures.
    fileParallelism: false,
  },
}));
