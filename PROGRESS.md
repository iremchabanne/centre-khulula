# Progress — Dossier Professionnel CDA

**Updated:** 22 August 2026
**Deadline:** DP filled in by **31 August 2026** · exam **October 2026**
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
- **No application code yet.** `api/` holds only Prisma; there is no Express, no `client/`.
- **Next session:** **Step 9** — the hand-written SQL that Prisma cannot generate. Four pieces,
  one at a time: the partial unique index (RG1), the `enclosure.status` trigger (RG3, RG7),
  the two stored functions, and the two database accounts with their grants.
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
