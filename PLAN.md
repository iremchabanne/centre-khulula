# Plan — Centre Khulula, from here to the filled DP

**This file says what is left to do.** `PROGRESS.md` says where we are today and what each
finished piece proves. A step that is finished collapses here to one line — the detail lives in
`PROGRESS.md`, never in both.

- Steps are **ordered by dependency**, not by date. No deadlines here on purpose — Irem sets
  the pace.
- **One step at a time**, then a checkpoint, then validation.
- Each unfinished step says **what**, **why it is graded**, and **done when**.
- This file is also the CP 4 artefact for *« le projet est planifié »*.

---

## The order to do the remaining steps in

**The application is finished.** Tracks A to F are done, and nothing is owed to the code. What
is left is track G — writing the DP — plus four small tasks of Irem's.

| Order | Steps | Why here |
|---|---|---|
| 1 | **30** — the five prep files, and the twelve screenshots chosen while writing them | Everything else is written from them. |
| 2 | **31** — the three comptes rendus, and field 3 | Short, but it has to be honest. |
| 3 | **32** — fill, sign and upload the PDF | The only real deadline: 07/10/2026, 23:59. |

**The rule from here on: produce only what goes in the file.** Twelve screenshots, not
thirty-seven; two difficulty rows per page, not every incident. Everything already written stays
as preparation for the jury's questions, and nothing new is written for `docs/` alone.

- **One veille entry a week**, throughout. Graded in six CPs, and it cannot be backdated.

---

## Finished tracks

### Track A — Conception  ·  CP 5, CP 7

- [x] **Step 1** — mockup decisions closed. 20 → 13 screens (6 public, 7 staff).
- [x] **Step 2** — MCD / MLD / MPD, `docs/conception/modele-donnees.md`.
- [x] **Step 3** — dossier de conception.
- [ ] **Step 4 — four screens in Figma. Irem's task.** CP 5 asks explicitly for an *outil de
      maquettage*; the HTML prototype may not count on its own. **Four screens, not thirteen** —
      decided 02/09/2026 after reading the three filled DPs in `references.md`: no maquette goes
      into the file, so the Figma work only has to survive an oral question. Home page, the
      enclosure screen with its admission dialog, the animal list, and the donation form. The
      other nine stay in `prototype.html`, and that is what the DP says.
- [x] **Step 5** — veille technologique set up, first three entries written.
      **Ongoing, and it cannot be backdated:** one entry a week in `docs/veille/journal.md`.

### Track B — Foundations

- [x] **Step 6** — repository, `.gitignore`, `README.md`, commit conventions.
- [x] **Step 7** — Docker Compose: `postgres`, `redis`, `adminer`.
- [x] **Step 8** — Prisma schema and first migration, 7 tables.
- [x] **Step 9** — the hand-written SQL: partial unique index, trigger, two stored functions,
      the two database accounts. **CP 8's graded part.**
- [x] **Step 10** — seed script, `npm run seed`.

**Still open inside this track:**

- [ ] **Irem:** switch on Dependabot alerts (Settings → Advanced Security). It is the third
      source of the veille system and it does not run until this is done.
- [ ] **Irem:** create the Feedly account and add the feeds (step 5).
- [ ] Decide the project-management tool for CP 4 and create the first tickets.
- [x] The `api` and `client` Docker services — done at step 18, 28/08/2026.

### Track C — Backend  ·  CP 2, CP 3, CP 8

- [x] **Step 11** — Express skeleton, four layers, central error handler, JSON request logging.
- [x] **Step 12** — Zod validation, all rules in `api/src/schemas.ts`.
- [x] **Step 13** — authentication and access control: argon2, Redis sessions, the three
      middleware. Proved with curl on all six protected routes.
- [x] **Step 14** — the service classes, CP 3's OOP criterion. Six of them: `AnimalService`,
      `AuthService`, `DonationService`, `EnclosureService`, `SpeciesService`, `StaffService`.
- [x] **Step 15** — transactions and concurrency, **CP 8's centrepiece**. Admission, move and
      outcome. The race is reproducible on demand, by hand and by test.
- [x] **Step 16** — public API, Redis cache, Redis rate limiting, pagination.
- [x] **Step 17** — staff API. Every screen now has the routes it needs.

**The backend is complete.** Nothing is added to it until a frontend screen proves something
is missing.

---

## Track E — Quality  ·  do this next

### Step 23 — Tests  ·  CP 9

**Tool: Vitest.** Configured in `api/vitest.config.ts` — one setting, which hands the variables
of `api/.env` to the tests, because the tests use the real database.

**Four tests, and then this step is finished.** Decided 27/08/2026. CP 9 is graded on
*« les tests sont pertinents »* — relevant tests, not many tests. Four Irem can explain line by
line beat forty she cannot, and an open-ended scope like "unit tests on the service classes"
never ends.

- [x] **The admission race** — `api/tests/admission-race.test.ts`. CP 8's centrepiece: two
      keepers, the last free enclosure, one winner.
- [x] **The admission rollback** — `api/tests/admission-rollback.test.ts`. The other half of RG2:
      a half-done admission leaves no orphan animal behind.
- [x] **The deactivated account** — `api/tests/deactivated-account.test.ts`. RG12 and OWASP A01,
      the real defect found on 26/08. The HTTP half stays with the manual script,
      `api/scripts/check-deactivated-account.sh`.
- [x] **One unit test** — `api/tests/pagination.test.ts`. Pure functions, no database, no mocks,
      so the suite holds both kinds of test, which CP 9 distinguishes.

**Done on 27/08/2026** — `npm test` runs 4 files, 5 tests, green. Nothing else is owed to this
step.

> **Each of the three integration tests was proved by breaking the code it guards**, then
> restored with `git checkout`: the race by deleting `FOR UPDATE`, the rollback by removing
> `$transaction`, RG12 by removing the `is_active` check. A test that has never been seen failing
> proves nothing. Those three failing outputs are DP evidence.

### Step 24 — Test plan and results  ·  CP 9

- [x] *Plan de tests* **and** *compte rendu d'exécution* — `docs/tests/plan-de-tests.md` v1.0,
      one document, because the two share the same table. Covers the backend only; the frontend
      gets a v2.0.
- [x] **Acceptance tests — done 01/09/2026.** The 18 *besoins* walked one by one in the running
      application, results in `docs/tests/plan-de-tests.md` v2.0 §9: **18 conformes, no open
      anomaly.** Every write was checked in the database rather than on the screen. The DP says
      plainly that Irem played the client's role — the maîtrise d'ouvrage is fictional.
- [x] **The same pass doubled as the end-of-build review.** Three developers also went through
      the site; their remarks are recorded in §9.2 and were acted on the same day, including two
      real defects — forms emptying on a single field error, and RG4 forbidding a relapse.

### Step 25 — Load testing and fuzzing  ·  CP 9

Two separate deliverables, both small. **No new tool is installed for either.**

- [x] **Load test with `ab`** (Apache Bench), already on the machine. Two measurements: 583 req/s
      and a 6 ms median under the rate limit, and 60 accepted / 240 refused with a 429 above it.
- [x] **Fuzzing with a script of our own** — `api/scripts/fuzz-donation-form.sh`, fifteen
      hand-picked payloads, checking one thing: every answer is 201 or 400, never 500.
- [x] The results are in `docs/tests/plan-de-tests.md` **v1.1**, §5 and §6.

**Done on 27/08/2026.** The fuzzing found a real defect on its first run — a non-JSON body
answered 500 instead of 400 — fixed the same day in `errorHandler`, and the script now verifies
the fix. That is the whole point of the step, and it is a *Difficultés rencontrées* row.

### Step 26 — Code quality tool  ·  CP 11

- [x] **Decided 27/08/2026: ESLint.** SonarCloud was the other candidate and is dropped — it
      needs an account, an organisation, a token and a CI integration before it prints anything.
      ESLint is the Node standard, runs offline with `npm run lint`, and its report is readable
      without a dashboard. CP 11 asks for *un outil de qualité de code*, not for a specific one.
- [x] Installed in `api/` — `eslint.config.js`, the two recommended rule sets and **one** adjusted
      rule: a parameter named `_something` is unused on purpose. Express recognises an error
      handler by its four parameters, so `errorHandler` must declare `_next` without calling it.
- [x] `npm run lint` runs clean. The first run reported that `_next`, which is the reason for the
      one adjusted rule.
- [x] **TypeScript 6.0.3 instead of 7.0.2** — typescript-eslint refuses to run on TS 7, released
      seven weeks ago. `npm run typecheck` and `npm test` pass unchanged after the move. Written
      up in `docs/veille/journal.md`, 27/08/2026.

**Done on 27/08/2026.**

### Step 27 — Continuous integration  ·  CP 11

One GitHub Actions file, about twenty lines, three steps.

- [x] `.github/workflows/ci.yml` — install, generate the Prisma types, lint, type check, unit
      test. Runs on every push and on every pull request against `main`.
- [x] **The three integration tests stay out of CI, on purpose.** They need a PostgreSQL with the
      migrations applied and the seed loaded; rebuilding that on every push is more machinery than
      the project needs. The limit is written down in the workflow file and in the plan de tests —
      an honest limit reads better than a pipeline nobody can explain.

**Done on 27/08/2026**, green on the first run. It immediately proved its own point: `api/.env`
is not in the repository, so `prisma generate` and `vitest` had nothing to read. Two placeholder
variables in the workflow fix it. On Irem's machine the file exists and the problem is invisible —
which is exactly what CI is for.

---

## Track F — Operations

### Step 28 — Backup and restore  ·  CP 7, easy to forget

Two short shell scripts, plain commands, no functions and no options to parse.

- [x] `api/scripts/backup.sh` — `docker exec` + `pg_dump --clean --if-exists` into a dated `.sql`
      file in `backups/`, which is git-ignored: the dump holds every row.
- [x] `api/scripts/restore.sh` — the same in reverse. The file is given as an argument, never
      guessed, and the script asks for a typed `yes` first.
- [x] **A restore that actually ran**, 27/08/2026: back up · delete Lindiwe (id 30) and her stay
      by hand, 14 animals → 13 · restore · **14 animals, Lindiwe back with her stay**.
      Verified afterwards that the two triggers, the two stored functions and the partial unique
      index came back too — a backup that restored the rows but not the hand-written SQL would
      look fine and be useless.

**Done on 27/08/2026.**

### Step 29 — Deployment  ·  CP 10, CP 11  ·  **done 01/09/2026**

CP 10 asks for a **written** procedure and documented scripts, not for a live server, so no
machine is rented and no cloud console is opened.

- [x] `docker-compose.prod.yml` — nothing mounted, port 80 the only one published, no adminer.
- [x] `api/Dockerfile.prod` and `client/Dockerfile.prod`. The client is built in two stages and
      served by nginx, which also forwards `/api` so there is still one origin and no CORS.
- [x] `docs/deploiement.md` — the two environments, deploy, update, and where each test runs.
- [x] **Both images were actually built**, not merely written.

---

## Track D — Frontend  ·  **the 13 screens are built**

> **The rule for the whole of this track, decided 27/08/2026: nothing advanced.**
> Plain React — `useState`, `useEffect` and `fetch`. **No** state-management library (Redux,
> Zustand), **no** data-fetching library (React Query, SWR), **no** component library, **no**
> custom hooks beyond one for calling the API if it turns out to be needed twice. Repeating a bit
> of `fetch` code on two screens is better than an abstraction Irem cannot read back.
>
> Libraries added, and there are **two: React Router and Tailwind.** Decided 28/08/2026: the
> eight forms are written by hand — a `FormData` `action`, three or four state variables, and a
> validation function of plain `if` checks. No React Hook Form, no resolver, **no Zod on the
> client**; the reasoning is in `docs/decisions.md`. One single form pattern, used identically
> on all eight.

### Step 18 — React foundations  ·  CP 2  ·  **done 28/08/2026**

- [x] Project setup (Vite), routing, the two layouts (public site / staff app).
- [x] The charte graphique palette declared once in the Tailwind theme —
      **never a hardcoded colour**.
- [x] Shared components: status pill, pager, modal. Decided 28/08/2026, down from six.
      A generic `Table` was refused: its column configuration has to be learnt before a page can
      be read.

      **Revised 30/08/2026 — two more, and the rule that decides the next ones.** A component is
      written when it is used on two screens **and** has nothing to configure. `Button` and
      `FormField` qualify; a `Table` does not. `SearchBox` and `Tabs` come when their second
      screen exists.

      `FormField` is the one that matters: it holds the label, the error and the
      `aria-invalid` / `aria-describedby` wiring, so the RGAA rules are written once instead of
      eight times.
- [x] The `api` and `client` Docker services, completing step 7.

### Step 20 — Staff shell  ·  **done 30/08/2026**

- [x] Vite proxy: `/api` goes to the API. One origin, so no CORS and no `credentials` option.
- [x] Login and sign-out.
- [x] The session survives a reload — `StaffLayout` calls `GET /api/auth/me`.
- [x] Sidebar filtered by `is_admin`. `role` hides no link: it guards actions, not pages.
- [x] Error page: one screen, three states (404, 403, session expired).

> **Limit lifted at step 33, 01/09/2026.** Every page and every dialog now answers a 401 with
> `/staff/session-expired` and a 403 with `/staff/denied`.

### Step 21 — The staff screens

- [x] **Enclos — Overview, Manage, admission and its access-conflict state.** Done 30/08/2026.
      Added `GET /api/dashboard`, the route that finally calls the two stored functions.
      Dropped from the mockup: search, filters, pagination and "New enclosure" — the API has no
      route for them and no CP asks for them.
- [x] **Liste des animaux** — filters: status, species, name, admission period. Done 30/08/2026.
- [x] **Fiche animal** — observations, move (RG8), outcome (RG5, RG6). Done 30/08/2026.
- [x] **Liste des dons** — administrators only. Done 30/08/2026.
- [x] **Comptes du personnel** — create, activate/deactivate, reset a password, search.
      Done 31/08/2026. Added the `search` filter the staff list API was missing.

### Step 19 — The 6 public pages

- [x] **Les espèces · Fiche espèce** — done 30/08/2026, with nine Wikimedia Commons photographs
      (884 KB in total) credited in `docs/conception/credits-photos.md`.
- [x] **Accueil · Nos animaux · Faire un don · Mentions légales** — done 31/08/2026. The nine
      photographers are named on the legal notice page, as CC BY and CC BY-SA require.

### Step 33 — Tidy up  ·  **done 01/09/2026**

- [x] **Layout and colour pass, 01/09/2026.** The three staff screens now open the same way:
      title, then the action row with its one accent button, then the filters. The two content
      links of the public site are accent with an arrow. Screen 10 became two columns on a wide
      screen, its identity and stays in one box. `SelectField` draws its own chevron, because a
      browser puts its own hard against the border and ignores padding.
- [x] **Session handling completed, 01/09/2026.** The five dialogs answered a 401 with a red line
      under a field; they now send the user to `/staff/session-expired`, as the pages already did.
      This closes the limit left open at step 20. `LoginPage` is deliberately untouched: there a
      401 means a wrong password.
- [x] **Shortening pass, 01/09/2026.** The whole project reread and simplified: 45 files, 161
      lines fewer. The duplicated `FOR UPDATE` lock became one function, the four identical id
      schemas one, the species photo one component, and the long comments were cut to the lines
      that say *why*.

### Step 22 — Accessibility pass  ·  RGAA, CP 2 and CP 5  ·  **done 01/09/2026**

Deliberately a level that can be explained rather than an exhaustive audit.

- [x] Already in place before the pass, and checked: `lang="en"`, the `main` / `nav` / `header` /
      `footer` landmarks, one `h1` per page in order, an alt on all three images, the focus
      outline written once in `index.css`, Escape closing a dialog, contrasts measured in the
      charte graphique.
- [x] A real `<title>` — it still said "client".
- [x] `aria-required` on required fields, in `FormField` and `SelectField`. The asterisk is
      `aria-hidden`, so it said nothing to a screen reader.
- [x] A *Skip to content* link in both layouts, visible only when focused.
- [x] A dialog takes the focus when it opens.
- [x] The *partially compliant* claim on the legal page now lists what is done and the three
      limits that are not: one title for every page, a dialog that can be left with Tab, and no
      audit run with a screen reader.

---

## Track G — The DP, the only thing the jury reads

**What the jury receives is `dossier_professionnel.pdf` and nothing else.** The application is
not run, the repository is not opened, the documents in `docs/` are not read. They are
preparation for the questions, not deliverables.

### What the file actually contains

Read from the blank on 01/09/2026. Seventeen pages, and only these matter:

- **Nine identical example pages** — three per activité-type. We fill six and leave the third of
  each blank, as `docs/decisions.md` decided.
- **Déclaration sur l'honneur**, page 15 — name, place, date, signature.
- *Titres et diplômes*, page 14, and *Documents illustrant la pratique*, page 16: both optional,
  and page 16 is a **list of titles**, not a place for images.
- *Annexes*, page 17, only *« si le RE le prévoit »* — do not count on it.

Every example page has the same five fields:

| Field | What it asks | Where it comes from |
|---|---|---|
| 1 | The tasks performed, and the conditions | the prep file's working notes |
| 2 | The means used — tools, languages, and why | the same |
| 3 | Who you worked with | **the same answer on all six pages**, see step 31 |
| 4 | Context: organisation, service, période d'exercice | Centre Khulula (fictif), with real dates |
| 5 | Optional | **the only place an image goes** |

### The eleven CPs, and where each one is proved

**This is the constraint everything else answers to.** The référentiel binds each CP to an
activité-type — AT1 holds CP 1 to 4, AT2 holds CP 5 to 8, AT3 holds CP 9 to 11 — so a CP cannot
be moved to a page where it would fit better. Six pages, eleven CPs, no gap:

| Page | CP | The evidence it rests on |
|---|---|---|
| AT1 — Ex. 1 | CP 1 | the containerised stack, the configuration kept out of the repository |
| | CP 4 | `PLAN.md` as the planning, the three review sessions, Git |
| AT1 — Ex. 2 | CP 2 | the 13 screens, the eight hand-written forms, the accessibility pass |
| | CP 3 | the six service classes, and a business rule refused server-side |
| AT2 — Ex. 1 | CP 5 | the 18 besoins, the prototype, the screen-flow diagram |
| | CP 6 | the four layers, and what was deliberately left out |
| AT2 — Ex. 2 | CP 7 | the seven tables, the two database accounts, backup and restore |
| | CP 8 | the trigger, the two stored functions, the transaction, Redis |
| AT3 — Ex. 1 | CP 9 | the four tests, the load test, the fuzzing, the 18 acceptance results |
| AT3 — Ex. 2 | CP 10 | the deployment procedure and the production images |
| | CP 11 | the CI workflow and ESLint |

**An example is chosen because it proves its CPs' critères de performance, never because it is
the nicest piece of work.** Before calling a page done, read those criteria in
`docs/dp/00-referentiel-CP.md` and check them off one by one.

### Step 30 — The five remaining prep files

Written from the validated `AT1-exemple-1.md`. Each one is preparation for fields 1 and 2 of its
page, and nothing more goes in it than the page can hold.

- [ ] `AT1-exemple-2.md` — **already exists as a partial.** Its *Difficultés rencontrées* section
      is written and must not be overwritten.
- [ ] `AT2-exemple-1.md`, `AT2-exemple-2.md`, `AT3-exemple-1.md`, `AT3-exemple-2.md`.
- [ ] While writing each one, **choose that page's two screenshots** and tick them in
      `docs/dp/captures.md`. The other rows of that file stay as oral-exam preparation.

### The screenshots — two to four per page, chosen by what the CP asks

`docs/dp/captures.md` holds 37 candidates; roughly a dozen go in the file. The rule for choosing:
an image earns its place when it shows **a result the text cannot state as convincingly** — a
refusal, a green run, a diagram. Not a screen that merely looks nice.

Two things taken from the filled DPs in `docs/dp/references.md`: an image can sit **inside field
1**, next to the sentence it proves, and does not have to wait for field 5; and each example page
**names in its heading the CP it proves**, so the jury is not left looking for it.

| Page | CP | Image 1 | Image 2 |
|---|---|---|---|
| AT1 — Ex. 1 | CP 1 + CP 4 | `docker compose ps`: the five services, healthy | a green GitHub Actions run |
| AT1 — Ex. 2 | CP 2 + CP 3 | the admission dialog, offering only the enclosure types the species needs (RG17) | a `403` returned to a keeper on an admin route, next to the `200` an admin gets |
| AT2 — Ex. 1 | CP 5 + CP 6 | the screen-flow diagram of `arborescence-ecrans.md` | the four layers, routes → controllers → services → Prisma |
| AT2 — Ex. 2 | CP 7 + CP 8 | the MPD — seven tables and their relations | the two concurrent admissions: one `201`, one `409` |
| AT3 — Ex. 1 | CP 9 | `npm test` green, four files, five tests | the recette table of `plan-de-tests.md` §9 |
| AT3 — Ex. 2 | CP 10 + CP 11 | `docker-compose.prod.yml`: no mount, port 80 only | the deployment procedure, one screen of it |

- [ ] Take the twelve. Nothing else is taken.

### Step 31 — Field 3 and the difficulties

- [x] **Field 3, written 02/09/2026 and identical on all six pages.** The project was built alone:
      no team, no client, no technical supervision. Irem played the client's role when writing the
      18 besoins and again when accepting them, and the field says so rather than leaving it to be
      guessed. Three developers did walk the running application and report defects, two of them
      real and fixed the same day; the field names that, and the remarks stay recorded in
      `docs/tests/plan-de-tests.md` §9.2.
- [x] **No `docs/reunions/` folder — decided 02/09/2026.** The DP has no section for meeting
      reports; it was our invention, not the form's request. On a project with no client and no
      team there were no meetings, and inventing three would be fabricated evidence in an exam
      dossier. Field 3 carries the account instead — who, when, what came out, what was fixed.
      The cost is stated plainly: the CP 4 criterion *« les comptes rendus de réunion sont
      structurés »* rests on that paragraph and on nothing else.

- [x] **Four *Difficultés rencontrées* rows in the whole file, not twelve** — decided 02/09/2026.
      RG12 on AT1 — Ex. 2, the lock that was not what made the test pass on AT2 — Ex. 2, the
      fuzzing `500` on AT3 — Ex. 1, and the first CI run on AT3 — Ex. 2. They were chosen against
      the transversal *démarche de résolution de problème*, which is graded in CP 2, 3, 8 and 11 —
      one row per CP that grades it, plus fuzzing for CP 9. The eight incidents dropped are kept
      in their prep files as short oral-preparation notes, not deleted.

### Step 32 — Fill, sign, upload

- [ ] Six pages, five fields each, written from the prep files.
- [ ] The twelve images pasted into field 5.
- [ ] Page 15 — *déclaration sur l'honneur*: name, place, date, **signature**.
- [ ] Full reread against `docs/dp/00-referentiel-CP.md`: every one of the 11 CPs is covered by
      at least one page.
- [ ] Exported as a PDF named exactly `dossier_professionnel.pdf`, on the drive before
      **07/10/2026 23:59**.

---

## Decisions still open

| # | Decision | Blocks |
|---|---|---|
| 1 | Project-management tool for CP 4 | Track B |
| 2 | *Comptes rendus de réunion* on a solo project | Step 31 |
| 3 | Confirm the English UI with the formateur | — |
| 4 | Irem's name for the *maître d'œuvre* line | — |

---

## Things not to forget

- **Check every feature against `docs/dp/00-referentiel-CP.md` before calling it done.**
- **Veille technologique is graded in six CPs** — one entry a week, it cannot be backdated.
- **Backup and restore must be demonstrated**, not merely scripted.
- Load testing and fuzzing are two separate CP 9 items, and acceptance tests a third.
- Éco-conception (CP 6), RGAA (CP 2, CP 5) and RGPD (CP 2, CP 5, CP 7) are all graded and all
  easy to skip under pressure.
- Commit at every validated checkpoint (CP 4).
