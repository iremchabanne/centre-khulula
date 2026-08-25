# Progress — Dossier Professionnel CDA

**Updated:** 25 August 2026
**Deadline:** Khulula finished by **mid-September 2026** · everything on the drive by
**07/10/2026 23:59** · exam **October 2026**. See `docs/decisions.md` — the old "31 August" was wrong.
**Status:** conception complete · database schema in place · **no application code yet**

> `PLAN.md` holds the ordered list of remaining steps. Design decisions are **not** repeated
> here — they live in the design documents themselves.

---

## 1. Where we are

- **Conception is complete** (steps 1–3 of `PLAN.md`): cahier des charges, dossier de conception,
  charte graphique, data model, screen flow, 13 mockup screens.
- **The technology watch system is in place** (step 5), with its first three entries.
- **The repository exists** (step 6) — https://github.com/iremchabanne/centre-khulula
- **The Docker infrastructure runs** (step 7): `postgres`, `redis`, `adminer`, all verified.
  `api` and `client` join it at step 11, when there is code to containerise.
- **The database schema exists** (step 8): `api/prisma/schema.prisma`, 7 models and 7 enums,
  applied by migration `20260822094655_init`. The seven tables are visible in Adminer.
- **The hand-written SQL is done** (step 9), in four separate migrations, each one demonstrated
  against the running database: the partial unique index (RG1), the `enclosure.status` trigger
  (RG3, RG7, RG16), the two dashboard stored functions (T4), and the restricted `khulula_app`
  account. This is the CP 8 centrepiece.
- **The database has data** (step 10): `api/prisma/seed.ts`, run with `npm run seed`. 14 animals,
  12 donations — two pages of ten. TypeScript is set up (`tsconfig.json`, `tsx`, `argon2`).
- **The API runs** (step 11): `api/src/`, 10 short files, `npm run dev`. Four layers, a central
  error handler, JSON request logging, and the connection made as the restricted `khulula_app`
  account. `species` is written end to end as the reference example.
- **Input validation is in place** (step 12): all Zod rules in `api/src/schemas.ts`, applied as
  route middleware. `POST /api/donations` is the first write endpoint and proves it.
- **Authentication works** (step 13): `POST /api/auth/login`, `POST /api/auth/logout`,
  `GET /api/auth/me`. argon2, sessions in Redis, and the three access-control middleware.
  Proved with curl, not only written — see the checklist in `PLAN.md` step 13.
  `requireRole` and `requireAdmin` exist but have **no route yet**; step 15 gives them one.
- **Enclosures are done end to end** (part of step 14): `EnclosureService`, `GET /enclosures`,
  `GET /enclosures/free`, `PATCH /enclosures/:id/maintenance`. RG16 lives in the service, not in
  the trigger — an occupied enclosure cannot be put under maintenance, or the animal inside would
  vanish from the screens.
- **Step 15 is nearly done** — the CP 8 centrepiece. `POST /animals` admits in one transaction
  with `SELECT … FOR UPDATE`; `PATCH /animals/:id/enclosure` moves (RG8); `PATCH
  /animals/:id/outcome` pronounces an outcome, vet only (RG5, RG6, RG7).
  **The race was demonstrated by hand**: two parallel admissions into the last free enclosure
  give one 201 and one 409, with a single open stay left in the database.
- **What step 15 still owes:** an **automated** test of that race, and a test that actually proves
  the transaction rolls back. Both belong with step 23, which now comes before the frontend.
- **No frontend yet.** `client/` does not exist.
- **Next session:** finish step 15's automated test, then step 16 — the public API.
- **Working habit, decided 25 August:** push at the end of every working day. The repository had
  been three days behind.
- Still Irem's, whenever she wants: Dependabot alerts, the Feedly account, and step 4 (Figma).

---

## 2. Files

| File | Version | Purpose |
|---|---|---|
| `docs/decisions.md` | — | Project brief — subject, stack, CP mapping, working rules. Source of truth. |
| `PLAN.md` | — | 32 ordered steps to the filled DP. No dates. |
| `PROGRESS.md` | — | This file — the session handover. |
| `docs/dp/00-referentiel-CP.md` | — | The 11 CPs and their critères de performance. **Never edit.** |
| `docs/dp/AT1-exemple-1.md` | — | Validated prep-file template. The other 8 are not written yet. |
| `docs/veille/veille-technologique.md` | **1.0** | The watch system: sources, tools, method, entry format. Graded in CP 2, 3, 8, 9, 10, 11. |
| `docs/veille/journal.md` | — | The dated entries. **Write one a week — it cannot be reconstructed later.** |
| `docs/conception/dossier-de-conception.md` | **1.0** | CP 5 deliverable. The design response: démarche, needs analysis, use cases, screen flow, data model, traceability. |
| `docs/conception/cahier-des-charges.md` | **1.5** | The specification — the *input*, from the maîtrise d'ouvrage. 18 needs, RG1–RG16. |
| `docs/conception/charte-graphique.md` | **1.1** | Colours with measured contrast, typography, RGAA, éco-conception. |
| `docs/conception/modele-donnees.md` | **1.1** | MCD, MLD, MPD. Naming convention, RG1–RG16 coverage. |
| `docs/conception/arborescence-ecrans.md` | **1.7** | 13 screens, 4 diagrams, the six dialogs, animal lifecycle. |
| `docs/conception/maquettes/prototype.html` | **v1.6** | 13 clickable screens, working tabs and dialogs. |
| `api/prisma/schema.prisma` | — | The MPD in Prisma form. 7 models, 7 enums. Says in a header comment what it deliberately leaves to step 9. |
| `api/prisma/migrations/` | — | 5 migrations. The last 4 are hand-written SQL — CP 8's graded part. Each file explains in comments why the rule lives in the database. |
| `api/prisma/seed.ts` | — | Development data. Flat lists plus two simple loops; deliberately sized at two pages of ten. |
| `api/src/` | — | The API. `routes.ts` → `controllers/` → `services/` → Prisma. `middleware.ts` holds the request logger, `validate()`, the three access-control middleware and the central error handler; `schemas.ts` holds every Zod rule; `session.ts` and `redis.ts` hold the staff sessions. |
| `docs/dp/captures.md` | — | **Git-ignored.** The running list of screenshots to take for the DP: what to show, how to reproduce it, which slot it goes in. Images live in `docs/dp/captures/`, also git-ignored. |
| `KOMUTLAR.md` | — | **Git-ignored.** Irem's own command cheat-sheet, in Turkish. Not a deliverable. |

---

## 3. Decisions the rest of the build must respect

These are the ones easy to break by accident. Everything else is in the documents.

- **Names are English everywhere inside the application** — code, database tables and columns, UI.
  Jury documents are French, and kept short.
- **Seven tables:** `staff_member`, `species`, `enclosure`, `animal`, `stay`, `observation`,
  `donation`. `staff_member`, not `user` — reserved word in PostgreSQL.
- **`enclosure.status` is written only by the trigger.** The application reads it, never sets it.
- **`observation` is append-only** — no `UPDATE`, no `DELETE`, enforced by the `khulula_app` grants.
- **Nothing is ever deleted:** accounts are deactivated, animals and enclosures keep their history.
- **Two DB accounts**, `khulula_admin` and a deliberately restricted `khulula_app`.

---

## 4. Open decisions

| Decision | Blocks |
|---|---|
| Project-management tool for CP 4 (GitHub Projects?) | Step 6 |
| Code-quality tool (SonarCloud?) | Step 26 |
| Deployment target | Step 29 |
| Acceptance tests on a solo project | Step 24 |
| *Comptes rendus de réunion* on a solo project | Step 31 |
| Confirm the English UI with the formateur | — |
| Irem's name for the *maître d'œuvre* line | — |

---

## 5. Things not to forget

- **CP 4 artefacts cannot be reconstructed later.** The *Difficultés rencontrées* table and the
  *comptes rendus de réunion* must be written **the day the problem happens**.
- **Veille technologique is graded in six CPs.** The system exists — what is left is the habit.
  An entry written the week it happens cannot be reconstructed afterwards.
- **Backup and restore must be demonstrated**, not merely scripted.
- Load testing, fuzzing and acceptance tests are three separate CP 9 items.
- Éco-conception (CP 6), RGAA (CP 2, CP 5) and RGPD (CP 2, CP 5, CP 7) are graded and easy to skip.
- **Dependabot alerts are still switched off** on the repository — the third source of the watch
  system does not actually run until they are enabled.
