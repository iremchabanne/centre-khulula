// ESLint — the code-quality tool of CP 11.
//
// WHAT IT IS. A linter reads the code without running it and points out what is
// wrong or suspicious: a variable declared and never used, a promise nobody
// waits for, a comparison that is always true. The compiler checks that the
// types fit; the linter checks the habits.
//
// WHY ESLINT AND NOT SONARCLOUD. Sonar needs an account, an organisation, a
// token and a CI integration before it prints anything. ESLint runs offline in
// one command, and its output is a list of files and line numbers. CP 11 asks
// for a code-quality tool, not for a particular one.
//
// NO CUSTOM RULES, with one exception explained at the bottom of the file. A
// rule set written by us would be a set of opinions to defend in front of a
// jury; the recommended sets are the ecosystem's defaults and need no defending.
//
// TYPESCRIPT 6 AND NOT 7. typescript-eslint refuses to run on TypeScript 7,
// which was released seven weeks ago and which the tooling has not caught up
// with. api/ was moved back to TypeScript 6.0.3 on 27/08/2026 — the previous
// major, four months old, supported everywhere. `npm run typecheck` and
// `npm test` were both re-run afterwards and pass unchanged.

import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Files the linter must not read: build output, dependencies, and the SQL
  // migrations, which are not TypeScript at all.
  {
    ignores: ['node_modules/', 'dist/', 'prisma/migrations/'],
  },

  // The rules everyone agrees on for JavaScript.
  js.configs.recommended,

  // The same idea for TypeScript. `recommended` and not `strict`: strict adds
  // rules about style rather than about correctness, and every one of them
  // would have to be explained.
  ...tseslint.configs.recommended,

  // The one rule we adjust, and only to teach ESLint a convention it does not
  // know: a parameter whose name starts with an underscore is unused on
  // purpose.
  //
  // Express recognises an error handler by its FOUR parameters. Remove the
  // fourth and it stops being an error handler — so errorHandler must declare
  // `_next` even though it never calls it. Without this line the linter reports
  // a real piece of code as a mistake, and a linter that cries wolf gets
  // ignored.
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
