# Plan — Centre Khulula, from here to the filled DP

**Companion to `PROGRESS.md`.** `PROGRESS.md` says where we are; this file says what comes next.

## How to use this file

- Steps are **ordered by dependency**, not by date. There are no deadlines and no time estimates
  here on purpose — Irem sets the pace.
- **One step at a time.** Each step is built, checkpointed, and validated
  before starting the next.
- Each step says **what**, **why it is graded**, and **done when** — so "finished" is never a
  matter of opinion.
- Tick the boxes as you go. This file is also the CP 4 artefact for *« le projet est planifié »*.

---

## Track A — Conception (finish this before any code)

### Step 1 — Close the remaining mockup decisions

Three small design questions are still open and they change what the data model has to support.

- [x] ~~Species screen~~ — **removed.** Species are reference data: seeded, changed by migration.
      Need T2 dropped from the cahier des charges (§2.2 carries the reasoning).
- [x] ~~Admission screen and its conflict screen~~ — **now a dialog** on screen 8, with the
      conflict as its error state. Reachable from screens 8 and 9.
- [x] Animal cards on screens 1, 3, 4 — **plainly non-clickable.** No public animal page. RGAA:
      they must not look clickable either (no pointer cursor, no hover, not reachable by Tab).
- [x] Screen 10 — the three dialogs are mocked (Add observation, Move enclosure, Record outcome).
      The modal component now carries six dialogs.

**Done when:** every button in the prototype leads somewhere, and no screen has an inline form
that should be a dialog.

**Result so far: 20 → 13 screens** (6 public, 7 staff). This is the floor — below it, screens
start carrying grading criteria that would be lost. See `arborescence-ecrans.md` §1.

---

### Step 2 — Data model: MCD / MLD / MPD  ·  CP 7

The blocker. Nothing below can start without it.

**Done — `docs/conception/modele-donnees.md` v1.1.**

- [x] **MCD** (conceptual) — 7 entities and their relationships, no technical detail.
- [x] **MLD** (logical) — tables, primary keys, foreign keys, cardinalities.
- [x] **MPD** (physical) — real PostgreSQL types, constraints, indexes, `ON DELETE` behaviour.
- [x] Naming convention, written down once and applied everywhere (§1).
- [x] `staff_member` carries `is_admin` and `is_active` — RG12, RG13, RG14.
- [x] `animal.status` as an enum covering the RG4 lifecycle.
- [x] `enclosure.status` — derived by trigger, never written by hand (RG3), and split from the
      human `is_under_maintenance` decision (RG16).
- [x] The **two database users** with different rights (§5.6 du modèle de données).

**Done when:** the three schemas exist as diagrams plus a written commentary, and every business
rule RG1–RG16 maps to something in the model. — *§6 holds the RG coverage table.*

> A seventh table, `observation`, was added: screen 10 showed a follow-up history (S6) that
> nothing stored. Table names are now English (`staff_member`, `species`, `enclosure`, `animal`,
> `stay`, `observation`, `donation`).

---

### Step 3 — Dossier de conception  ·  CP 5

- [x] Assembled into `docs/conception/dossier-de-conception.md`: démarche, besoins, maquettes,
      enchaînement, modèle de données, traçabilité.
- [x] Analysis of needs (actors, system boundaries, use cases) and the argued design choices.

**Done when:** a jury can read one document and understand the whole design without opening
anything else.

---

### Step 4 — Redraw the maquettes in Figma  ·  CP 5

**Irem's task.** CP 5 asks explicitly for a *outil de maquettage*; the HTML prototype may not
count on its own.

- [ ] Rebuild the 16 screens in Figma from `docs/conception/maquettes/prototype.html`.
- [ ] Export the screens for the dossier.

---

### Step 5 — Veille technologique

Graded in **six** CPs and the single easiest thing to forget. Set it up once, early, then it runs
by itself.

- [x] Sources chosen, each with its reason — `docs/veille/veille-technologique.md` §2.
- [x] Entries recorded in `docs/veille/journal.md`, five fields, newest first.
- [x] First three entries written.
- [ ] **Irem:** create the Feedly account, add the feeds, and turn on GitHub *Watch → Releases*
      on the seven repositories. Dependabot comes with Step 6.
- [ ] **Ongoing:** one entry in `journal.md` per week worked on the project. Irem raises it at the
      start of a session, from the sources listed in `veille-technologique.md`.
      A weekly automation was attempted and abandoned - the setup was not
      straightforward, and the automation adds nothing the jury can see.

**Done when:** there is a dated log with entries in it, not just an intention.

---

## Track B — Foundations

### Step 6 — Repository

- [x] `git init`, GitHub remote (SSH), `.gitignore`, `README.md`.
      → https://github.com/iremchabanne/centre-khulula
- [x] Commit conventions written down — `README.md`.
- [ ] **Irem:** switch on Dependabot alerts (Settings → Advanced Security → Dependabot alerts).
      It is the third source of the veille system.
- [ ] Decide the project-management tool for CP 4 (GitHub Projects?) and create the first tickets.

### Step 7 — Docker Compose  ·  CP 10, CP 11

- [x] Infrastructure services: `postgres`, `redis`, `adminer` — running and verified.
- [x] `.env.example`, named volumes, healthchecks on postgres and redis.
- [ ] `api` and `client` services — added at step 11, once there is code to containerise.

**Done when:** `docker compose up` gives a working empty stack from a clean clone.
*Partially met: the three infrastructure services do, the two application services do not exist
yet. An application cannot be containerised before it is written.*

### Step 8 — Prisma schema and first migration

**Done — `api/prisma/schema.prisma`, migration `20260822094655_init`.**

- [x] Backend lives in `api/`, the React app will live in `client/` — two separate
      `package.json` files, matching the two Docker services planned for step 11.
- [x] Translate the MPD into `schema.prisma` — 7 models, 7 enums.
- [x] `npx prisma migrate dev` — the seven tables exist, verified in PostgreSQL.

### Step 9 — Hand-written SQL inside Prisma migrations  ·  CP 8 — the graded part

Created with `npx prisma migrate dev --create-only`, then written by hand. Prisma does not
generate any of this, and that split is the answer to give the jury.

**Done — four migrations, each one demonstrated against the running database.**

- [x] **Partial unique index** `uq_stay_current_enclosure` — one open stay per enclosure (RG1).
      Proven: a second admission into an occupied enclosure is refused; the same enclosure is
      reusable once the stay is closed, and keeps both stays.
- [x] PL/pgSQL **trigger** deriving `enclosure.status` from current stays (RG3, RG7, RG16).
      Proven across the whole lifecycle, including a direct `UPDATE … SET status = 'free'` on an
      occupied enclosure — accepted, then corrected back to `occupied`.
- [x] **Stored function** `occupancy_rate()` — maintenance excluded from the denominator.
- [x] **Stored function** `average_stay_length_days()` — finished stays only, `NULL` when none.
- [x] The two **database users** and their grants. `khulula_app` proven unable to delete anything,
      rewrite an observation, change a species, drop a table, or read the migration history —
      while still able to do its normal work.

**Done when:** each object can be demonstrated in Adminer, and you can explain every line.

> The password of `khulula_app` is deliberately **not** in the migration: migrations are
> committed. The role is created able to log in with no password; setting one is a documented
> manual step (`api/.env.example`).

### Step 10 — Seed script

- [ ] The **two administrator accounts** — the referent vet and the referent keeper (RG13).
- [ ] Species, enclosures, animals, stays and donations — enough data to make every screen look
      real and every list worth paginating.

---

## Track C — Backend

### Step 11 — Express skeleton  ·  CP 3, graded on layering

- [ ] Layers: routes → controllers → services → data access. **No business logic in a route.**
- [ ] Central error handler — no technical error ever reaches the client (§6.1).
- [ ] Structured logging.

### Step 12 — Validation with Zod

- [ ] One schema file per resource, server-side, before any DB access.
- [ ] Uniform validation error format.

### Step 13 — Authentication and access control  ·  CP 2, CP 3

- [ ] argon2 password hashing — never in clear text.
- [ ] Sessions in **Redis**.
- [ ] `requireAuth`, `requireRole('veterinaire')`, `requireAdmin` middleware.
- [ ] A deactivated account cannot log in (RG12).
- [ ] Protection against XSS and CSRF.

**Done when:** every protected route refuses the call server-side, not only in the interface —
this is OWASP A01, *Broken Access Control*.

### Step 14 — Service classes  ·  CP 3, the OOP criterion

Plain classes: a constructor taking the Prisma client, and methods. No inheritance, no patterns.

- [ ] `AnimalService`, `EnclosureService`, `SpeciesService`, `DonationService`, `UserService`.

**Done when:** Irem can explain every line of every class to a jury.

### Step 15 — Transactions and concurrency  ·  CP 8 — the centrepiece

- [ ] **Admission**: one transaction — lock the enclosure with `SELECT … FOR UPDATE`, check it is
      still free, create the animal and the stay, let the trigger occupy it. All or nothing (RG2).
- [ ] **Move**: closes the current stay and opens a new one, indivisibly (RG8) — same race, same
      lock.
- [ ] **Outcome**: vet only (RG6), terminal (RG5), frees the enclosure (RG7).
- [ ] An automated test that proves two simultaneous admissions cannot take the same enclosure.

**Done when:** the conflict is reproducible on demand — this is the demonstration the DP is built
around.

### Step 16 — Public API

- [ ] Species, animals filtered by status, donation recording.
- [ ] **Rate limiting via Redis** on the public pages and the donation form.
- [ ] **Redis cache** on the free-enclosure list, invalidated on every admission and outcome.
- [ ] Pagination — the `LIMIT` always applied server-side (§6.4).

### Step 17 — Staff API

- [ ] Enclosures, animals, stays, species, donations, staff accounts.
- [ ] RG14 enforced: nobody deactivates their own account or the last active administrator.

---

## Track D — Frontend

### Step 18 — React foundations  ·  CP 2

- [ ] Project setup, routing, the two layouts (public site / staff app).
- [ ] CSS variables taken from the charte graphique — **never a hardcoded colour**.
- [ ] Shared components: table, pager, toolbar, tabs, modal, status pill.

### Step 19 — The 6 public pages

- [ ] Accueil · Les espèces · Fiche espèce · Nos animaux · Faire un don · Mentions légales.

### Step 20 — Staff shell

- [ ] Login, sign-out, session expiry.
- [ ] Sidebar filtered by role and by `is_admin`.
- [ ] The access-denied / not-found / session-expired page.

### Step 21 — The 10 staff screens

- [ ] Enclos (Overview + Manage tabs) · Liste des animaux · Fiche animal · Admission ·
      conflit d'accès · Fiches espèces · Liste des dons · Comptes du personnel.

### Step 22 — Accessibility pass  ·  RGAA, CP 2 and CP 5

- [ ] Semantic HTML, coherent heading order.
- [ ] Full keyboard navigation, visible focus, modals closing on Escape.
- [ ] Contrast at AA — already measured in the charte graphique.
- [ ] Alt text everywhere; labels and error messages tied to their fields.

---

## Track E — Quality

### Step 23 — Tests  ·  CP 9

- [ ] Unit tests on the service classes.
- [ ] Integration tests on the routes.
- [ ] The concurrency test from step 15.

### Step 24 — Test plan and results  ·  CP 9

- [ ] Written *plan de tests*.
- [ ] *Compte rendu d'exécution*.
- [ ] Acceptance tests — **decide how to do this honestly on a solo project.**

### Step 25 — Load testing and fuzzing  ·  CP 9

Two separate deliverables, both small, both easy to forget.

- [ ] Load test on the public pages and the donation form (§6.5).
- [ ] Fuzzing on the input forms.

### Step 26 — Code quality tool  ·  CP 11

- [ ] **Decision open** — SonarCloud, or something else.
- [ ] Wired in and producing a report.

### Step 27 — Continuous integration  ·  CP 11

- [ ] Pipeline: install, lint, test, build.
- [ ] Runs on every push.

---

## Track F — Operations

### Step 28 — Backup and restore  ·  graded, easy to forget

- [ ] Backup script, restore script.
- [ ] **A demonstrated restore** — not just a script that exists.

### Step 29 — Deployment  ·  CP 10, CP 11

- [ ] **Decision open** — deployment target.
- [ ] Documented deployment procedure and scripts.

---

## Track G — The DP itself (runs alongside everything above)

**This track does not wait for the others.** Steps 30 and 31 start now.

### Step 30 — The nine prep files

Only `AT1-exemple-1.md` exists. The other eight are not generated yet.

- [ ] Generate the eight remaining files from the validated template.
- [ ] After **each validated feature**: note what to screenshot and which CP it proves.

| DP slot | CP(s) | File |
|---|---|---|
| AT1 — Exemple 1 | CP 1 + CP 4 | `docs/dp/AT1-exemple-1.md` ✅ |
| AT1 — Exemple 2 | CP 2 | `docs/dp/AT1-exemple-2.md` |
| AT1 — Exemple 3 | CP 3 | `docs/dp/AT1-exemple-3.md` |
| AT2 — Exemple 1 | CP 5 + CP 6 | `docs/dp/AT2-exemple-1.md` |
| AT2 — Exemple 2 | CP 7 | `docs/dp/AT2-exemple-2.md` |
| AT2 — Exemple 3 | CP 8 | `docs/dp/AT2-exemple-3.md` |
| AT3 — Exemple 1 | CP 9 | `docs/dp/AT3-exemple-1.md` |
| AT3 — Exemple 2 | CP 10 | `docs/dp/AT3-exemple-2.md` |
| AT3 — Exemple 3 | CP 11 | `docs/dp/AT3-exemple-3.md` |

### Step 31 — Difficulties and meeting notes — **the same day, never later**

- [ ] *Difficultés rencontrées* — filled the day the problem happens.
- [ ] *Comptes rendus de réunion* — **decide the honest approach for a solo project.**

These are the only parts of the DP that genuinely cannot be reconstructed at the end, and they
are the evidence for CP 4 and for the transversal *démarche de résolution de problème*.

### Step 32 — Fill `DP-Vierge-pre-rempli-CDA.pdf`

- [ ] Nine slots, five fields each, written from the prep files.
- [ ] Screenshots and annexes attached.
- [ ] Full reread against `docs/dp/00-referentiel-CP.md`.

---

## Decisions still open

| # | Decision | Blocks |
|---|---|---|
| 1 | Animal cards — clickable or not, and to where | Step 1 |
| 2 | Screen 10 dialogs | Step 1 |
| 3 | Species screen — create only, and where the button lives | Step 1 |
| 4 | Project-management tool for CP 4 | Step 6 |
| 5 | Code-quality tool | Step 26 |
| 6 | Deployment target | Step 29 |
| 7 | Acceptance tests on a solo project | Step 24 |
| 8 | *Comptes rendus de réunion* on a solo project | Step 31 |
| 9 | Confirm the English UI with the formateur | — |
| 10 | Irem's name for the *maître d'œuvre* line | — |

---

## Things not to forget

- **Git history is graded (CP 4).** Commit at every validated checkpoint.
- **Veille technologique is graded in six CPs.**
- **Backup and restore must be demonstrated**, not merely scripted.
- **Two database users** with different rights.
- Load testing, fuzzing and acceptance tests are three separate CP 9 items.
- Éco-conception (CP 6), RGAA (CP 2, CP 5) and RGPD (CP 2, CP 5, CP 7) are all graded and all
  easy to skip under pressure.
- **Check every feature against `docs/dp/00-referentiel-CP.md` before calling it done.**
