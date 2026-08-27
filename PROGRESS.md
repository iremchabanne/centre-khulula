# Progress — Dossier Professionnel CDA

**Updated:** 27 August 2026
**Deadline:** Khulula finished by **mid-September 2026** · everything on the drive by
**07/10/2026 23:59** · exam **October 2026**.
**Status:** conception complete · database and API complete · **no frontend yet**

> **This file says where we are.** `PLAN.md` says what is left to do, and holds the open
> decisions and the list of things not to forget. Design decisions live in the design documents.
> Nothing is repeated across two files.

---

## 1. Where we are

### Conception — done

Cahier des charges, dossier de conception, charte graphique, data model, screen flow and 13
mockup screens. The veille system exists with its first three entries. Still owed: the Figma
maquettes (step 4, Irem's task) and one veille entry a week.

### Infrastructure — done

The repository is at https://github.com/iremchabanne/centre-khulula. Docker Compose runs
`postgres`, `redis` and `adminer`, all verified. `api` and `client` join them at step 18.

### Database — done

Seven tables from `api/prisma/schema.prisma`, plus **five migrations whose last four are
hand-written SQL** — this is CP 8's graded part, and each one was demonstrated against the
running database:

- the partial unique index `uq_stay_current_enclosure` — one open stay per enclosure (RG1);
- the PL/pgSQL trigger deriving `enclosure.status` (RG3, RG7, RG16), proved across the whole
  lifecycle including a direct `UPDATE` that the trigger corrected back;
- the two dashboard stored functions — occupancy rate and average stay length;
- the two database accounts, with `khulula_app` proved unable to delete anything, rewrite an
  observation, change a species or drop a table, while still able to do its normal work.

`api/prisma/seed.ts` fills it: 14 animals and 12 donations, two pages of ten, all five lifecycle
states present. The seed never writes `enclosure.status` — the reported `3 free / 6 occupied /
1 maintenance` comes back from the trigger. That is the demonstration.

### Backend — complete

`api/src/`, four layers, run with `npm run dev`. Every screen of `arborescence-ecrans.md` has
the routes it needs. Nothing is added until a frontend screen proves something is missing.

- **Structure:** routes → controllers → services → Prisma. A central error handler, so no
  technical error reaches the client. One JSON log line per request. The API connects as the
  restricted `khulula_app` account; migrations use `khulula_admin`.
- **Validation:** every Zod rule in `api/src/schemas.ts`, applied as route middleware, before any
  database access. Unknown keys rejected.
- **Authentication:** argon2, sessions in Redis, three access-control middleware. `requireSession`
  re-reads the account from the database on **every** protected request, so a deactivated account
  is refused immediately (RG12) and so is a changed role. Proved with curl on all six protected
  routes.
- **OOP (CP 3):** six service classes — `AnimalService`, `AuthService`, `DonationService`,
  `EnclosureService`, `SpeciesService`, `StaffService`.
- **Transactions and concurrency (CP 8, the centrepiece):** admission is one transaction with
  `SELECT … FOR UPDATE`; move closes one stay and opens another indivisibly (RG8); outcome is
  vet-only and terminal (RG5, RG6, RG7). RG16 lives in `EnclosureService`, not in the trigger —
  an occupied enclosure cannot be put under maintenance, or the animal inside would vanish from
  the screens.
- **Redis has all three of its jobs:** staff sessions, the free-enclosure cache (`src/cache.ts`,
  invalidated on every admission, move, outcome and maintenance change), and rate limiting
  (`rateLimit()` in `middleware.ts`, 60/minute on public reads, 5/hour on the donation form).
  CP 8's NoSQL half is complete.
- **Pagination** applied server-side, ten per page, one answer shape for all six lists
  (`src/pagination.ts`).

### Tests — done

**Vitest.** Four files in `api/tests/`, five tests, run with `npm test`. Deliberately four and no
more: CP 9 is graded on relevant tests, and four Irem can explain beat forty she cannot.

| File | What it proves |
|---|---|
| `admission-race.test.ts` | Two simultaneous admissions cannot take the last free enclosure — one 201, one 409, one open stay (RG2, CP 8). |
| `admission-rollback.test.ts` | An admission that fails halfway leaves no orphan animal (RG2). |
| `deactivated-account.test.ts` | An account deactivated mid-session is refused on the next request (RG12, OWASP A01). |
| `pagination.test.ts` | The only unit test — pure functions, no database. There so the suite holds both kinds. |

**Every one of the three integration tests was watched failing before being kept**, by breaking
the code it guards and restoring it with `git checkout`: `FOR UPDATE` deleted, `$transaction`
removed, the `is_active` check removed. Those three failing outputs are the DP evidence — better
than the passing ones, because they show the defence is load-bearing.

One finding, written in the race test: removing `FOR UPDATE` does **not** make that test fail,
because the partial unique index refuses the second stay on its own. The test asserts the result
the centre needs, not which of the two defences delivered it.

The HTTP half of RG12 stays with `api/scripts/check-deactivated-account.sh`, run by hand: the
test covers the rule, the script covers the wiring through Express.

**Load testing and fuzzing are done too** (27 August), with no new tool installed: `ab` for the
load test, and `api/scripts/fuzz-donation-form.sh` for the fuzzing. The load test measured 583
req/s and a 6 ms median on a public list, and showed the rate limiter refusing 240 of 300 requests
with a 429. The fuzzing found a real defect on its first run — a non-JSON body answered 500
instead of 400 — fixed the same day in `errorHandler`. Everything is written up in
`docs/tests/plan-de-tests.md` v1.1.

### Code quality — ESLint

`npm run lint` in `api/`, clean. Configured in `api/eslint.config.js`: the two recommended rule
sets, plus one adjusted rule so a parameter named `_next` is not reported — Express recognises an
error handler by its four parameters.

**`api/` runs TypeScript 6.0.3, not 7.0.2, and that is deliberate.** typescript-eslint refuses to
start on TS 7, which was released seven weeks ago. TS 6 is the previous major, four months old,
supported everywhere. `npm run typecheck` and `npm test` pass unchanged after the move.

Known and not fixed: `npm audit` reports three high-severity advisories, all inside Prisma's own
dependency `deepmerge-ts`. The only fix offered is a breaking downgrade of Prisma, so it waits.

### Continuous integration — running

`.github/workflows/ci.yml`, one job, on every push and every pull request against `main`:
install, generate the Prisma types, lint, type check, unit test. Green since 27 August.

The three integration tests are deliberately left out — they need a migrated and seeded
PostgreSQL, and that machinery costs more than it gives here. `npm test` runs them locally.

### Frontend — does not exist

`client/` has not been created.

---

## 2. What is next

**Step 28 — backup and restore**, the last step before the frontend. The order and the reasoning
are in `PLAN.md`.

---

## 3. Files

| File | Version | Purpose |
|---|---|---|
| `docs/decisions.md` | — | Project brief — subject, stack, CP mapping, working rules. Source of truth. |
| `PLAN.md` | — | What is left to do, in order. |
| `PROGRESS.md` | — | This file — where we are. |
| `docs/dp/00-referentiel-CP.md` | — | The 11 CPs and their critères de performance. **Never edit.** |
| `docs/dp/AT1-exemple-1.md` | — | Validated prep-file template. The other 5 are not written yet. |
| `docs/veille/veille-technologique.md` | **1.0** | The watch system: sources, tools, method, entry format. |
| `docs/veille/journal.md` | — | The dated entries. **One a week — it cannot be reconstructed later.** |
| `docs/conception/dossier-de-conception.md` | **1.0** | CP 5 deliverable. The design response. |
| `docs/conception/cahier-des-charges.md` | **1.5** | The specification. 18 needs, RG1–RG16. |
| `docs/conception/charte-graphique.md` | **1.1** | Colours with measured contrast, typography, RGAA, éco-conception. |
| `docs/conception/modele-donnees.md` | **1.1** | MCD, MLD, MPD. Naming convention, RG1–RG16 coverage. |
| `docs/conception/arborescence-ecrans.md` | **1.7** | 13 screens, 4 diagrams, the six dialogs, animal lifecycle. |
| `docs/conception/maquettes/prototype.html` | **v1.6** | 13 clickable screens, working tabs and dialogs. |
| `api/prisma/schema.prisma` | — | The MPD in Prisma form. 7 models, 7 enums. |
| `api/prisma/migrations/` | — | 5 migrations. The last 4 are hand-written SQL — CP 8's graded part. |
| `api/prisma/seed.ts` | — | Development data, sized at two pages of ten. |
| `api/src/` | — | The API. `routes.ts` → `controllers/` → `services/` → Prisma. |
| `api/tests/` | — | Vitest. Four files, five tests. |
| `docs/tests/plan-de-tests.md` | **1.0** | CP 9 deliverable, in French. Plan and *compte rendu d'exécution* in one document. Backend only — the frontend gets a v2.0. |
| `docs/audit.md` | — | **Git-ignored.** A full review of the code as it stands. |
| `docs/dp/captures.md` | — | **Git-ignored.** The running list of screenshots to take for the DP. Images in `docs/dp/captures/`, also git-ignored. |
| `KOMUTLAR.md` | — | **Git-ignored.** Irem's own command cheat-sheet, in Turkish. Not a deliverable. |

---

## 4. Decisions the rest of the build must respect

These are the ones easy to break by accident. Everything else is in the documents.

- **Names are English everywhere inside the application** — code, database tables and columns, UI.
  Jury documents are French, and kept short.
- **Seven tables:** `staff_member`, `species`, `enclosure`, `animal`, `stay`, `observation`,
  `donation`. `staff_member`, not `user` — reserved word in PostgreSQL.
- **`enclosure.status` is written only by the trigger.** The application reads it, never sets it.
- **`observation` is append-only** — no `UPDATE`, no `DELETE`, enforced by the `khulula_app` grants.
- **Nothing is ever deleted:** accounts are deactivated, animals and enclosures keep their history.
- **Two DB accounts**, `khulula_admin` and a deliberately restricted `khulula_app`.
- **Never hardcode a colour** — the palette is declared once in the Tailwind theme.
- **Push at the end of every working day.** Decided 25 August, after the repository had been
  three days behind.
