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

| Order | Steps | Why here |
|---|---|---|
| 1 | **23**, **24**, **25**, **26**, **27**, **28** | Deliberately **before** the frontend. Each covers a criterion nothing else covers: tests (CP 9), load testing and fuzzing (CP 9, two separate items), code-quality tool (CP 11), CI (CP 11), backup and restore demonstrated (CP 7). None needs the frontend — they run against the API, which already exists. Left at the end, these are the ones that get dropped. |
| 2 | **18**, **20**, then **21**, **19**, **22** | The frontend. Inside it: the shell and the login first, then the **admission dialog and its access-conflict state** — the screen that shows CP 8's work to a reader — then the remaining staff screens, then the public pages (RGAA + mentions légales), then the accessibility pass. |
| 3 | **29** — deployment | CP 10 and CP 11. Blocked on an open decision. |
| 4 | **30**, **31**, **32** — the DP itself | Written throughout, finished last. |

Two rules that override the table:

- **Step 31 never waits.** The *Difficultés rencontrées* table and the meeting notes are filled
  the day the problem happens.
- **One veille entry a week**, throughout. Graded in six CPs, and it cannot be backdated.

> If something has to go, it comes out of order 2. Never out of order 4: the jury reads the DP
> and never runs Khulula, so a feature that exists but is not written up scores nothing.

---

## Finished tracks

### Track A — Conception  ·  CP 5, CP 7

- [x] **Step 1** — mockup decisions closed. 20 → 13 screens (6 public, 7 staff).
- [x] **Step 2** — MCD / MLD / MPD, `docs/conception/modele-donnees.md`.
- [x] **Step 3** — dossier de conception.
- [ ] **Step 4 — redraw the maquettes in Figma. Irem's task.** CP 5 asks explicitly for an
      *outil de maquettage*; the HTML prototype may not count on its own. Rebuild the 13 screens
      from `docs/conception/maquettes/prototype.html` and export them for the dossier.
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
- [ ] **Acceptance tests — after the frontend.** Decided 27/08/2026: Irem walks through the 18
      *besoins* of the cahier des charges in the finished application, one by one, and records
      the result in a dated table. The DP says plainly that she played the client's role herself —
      the maîtrise d'ouvrage is fictional, and a jury reads an honest limit better than a
      pretence. An acceptance test is done on screens, so it cannot happen before they exist.
      *If a formateur or a classmate can be sat down for twenty minutes, that observation is
      added on top. Better, but it depends on someone else's diary.*
- [ ] **The same pass doubles as the end-of-build review** — Irem's point, 27/08: while going
      through the 18 besoins, look for dead code, missing pieces, and anything that does not
      behave as expected. One walk through the application, two purposes.

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

### Step 29 — Deployment  ·  CP 10, CP 11

- [ ] **Decision open** — the deployment target. Keep it beginner-level: the stack is already
      `docker compose up`, so the simplest honest answer is one machine running the same Compose
      file with a production `.env`. Anything with a cloud console, a managed database or a
      Kubernetes manifest is out of scope for this project.
- [ ] A written deployment procedure someone else could follow, plus the production Compose file.

---

## Track D — Frontend  ·  after Track E

`client/` does not exist yet.

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
- [x] Shared components, and only **three**: status pill, pager, modal. Decided 28/08/2026,
      down from six. A generic `Table` needs a column configuration to be learnt before a page
      can be read, `Toolbar` is a `<div>`, and `Tabs` is two buttons and a `useState` used on two
      screens. Those three are written again on each page as plain HTML. The answer to give the
      jury: repeating ten readable lines was preferred to an abstraction that would have to be
      decoded before the page could be understood.
- [x] The `api` and `client` Docker services, completing step 7.

### Step 20 — Staff shell  ·  **done 30/08/2026**

- [x] The Vite proxy: `/api` is forwarded to the API, so the browser sees one origin and the
      session cookie needs no `credentials` option.
- [x] Login, sign-out, and the session kept across a reload — `StaffLayout` asks
      `GET /api/auth/me` and sends anyone without a session back to the login page.
- [x] Sidebar filtered by `is_admin`. `role` filters no link: it guards an action, not a page.
- [x] The error page, one screen and three states — 404, 403, session expired.

> **Written limit:** `/staff/denied` and `/staff/session-expired` exist but nothing navigates to
> them yet. The staff pages are still empty shells, so no `fetch` can receive a 403 or a 401.
> Step 21 wires them.

### Step 21 — The staff screens

- [ ] Enclos (Overview + Manage tabs) · Liste des animaux · Fiche animal · **Admission and its
      access-conflict state** · Fiches espèces · Liste des dons · Comptes du personnel.

### Step 19 — The 6 public pages

- [ ] Accueil · Les espèces · Fiche espèce · Nos animaux · Faire un don · Mentions légales.

### Step 22 — Accessibility pass  ·  RGAA, CP 2 and CP 5

- [ ] Semantic HTML, coherent heading order.
- [ ] Full keyboard navigation, visible focus, modals closing on Escape.
- [ ] Contrast at AA — already measured in the charte graphique.
- [ ] Alt text everywhere; labels and error messages tied to their fields.

---

## Track G — The DP itself (runs alongside everything above)

**This track does not wait for the others.**

### Step 30 — The six prep files

The DP allows **up to** three examples per activité-type, so the third page of each is left
blank. What has to be covered is the CPs, not the slots — the mapping is in `docs/decisions.md`.

- [ ] Generate the five remaining prep files from the validated `AT1-exemple-1.md` template.
- [ ] After **each validated feature**: note what to screenshot and which CP it proves, in
      `docs/dp/captures.md` (git-ignored, local only).

### Step 31 — Difficulties and meeting notes — **the same day, never later**

- [ ] *Difficultés rencontrées* — filled the day the problem happens.
- [ ] *Comptes rendus de réunion* — **decide the honest approach for a solo project.**

These are the only parts of the DP that genuinely cannot be reconstructed at the end, and they
are the evidence for CP 4 and for the transversal *démarche de résolution de problème*.

### Step 32 — Fill `DP-Vierge-pre-rempli-CDA.pdf`

- [ ] Six slots, five fields each, written from the prep files.
- [ ] Screenshots pasted into field **5. Informations complémentaires** of each page.
- [ ] Full reread against `docs/dp/00-referentiel-CP.md` — every CP covered by some example.
- [ ] **Signed**, exported as a PDF named exactly `dossier_professionnel.pdf`, uploaded to the
      drive before **07/10/2026 23:59**.

---

## Decisions still open

| # | Decision | Blocks |
|---|---|---|
| 1 | Project-management tool for CP 4 | Track B |
| 2 | Deployment target | Step 29 |
| 3 | *Comptes rendus de réunion* on a solo project | Step 31 |
| 4 | Confirm the English UI with the formateur | — |
| 5 | Irem's name for the *maître d'œuvre* line | — |

---

## Things not to forget

- **Check every feature against `docs/dp/00-referentiel-CP.md` before calling it done.**
- **Veille technologique is graded in six CPs** — one entry a week, it cannot be backdated.
- **Backup and restore must be demonstrated**, not merely scripted.
- Load testing and fuzzing are two separate CP 9 items, and acceptance tests a third.
- Éco-conception (CP 6), RGAA (CP 2, CP 5) and RGPD (CP 2, CP 5, CP 7) are all graded and all
  easy to skip under pressure.
- Commit at every validated checkpoint (CP 4).
