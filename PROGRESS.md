# Progress — Dossier Professionnel CDA

**Last session:** 20 August 2026 — *session 3*
**Deadline:** DP filled in by **31 August 2026** · exam **October 2026**
**Status:** conception finished through Step 3 · **no code written yet**

> Read this first when resuming. `PLAN.md` has the ordered list of remaining steps.
> Design decisions are **not** repeated here — they live in the documents themselves.

---

## 1. Where we are

- **Conception is done through Step 3 of `PLAN.md`**: cahier des charges, charte graphique, screen
  flow, 13 mockup screens, the data model, and the assembled dossier de conception.
- **No code yet.** No repo, no `package.json`, no Docker.
- **Step 5 (veille) is set up**, and three entries are written. Irem still has to create the
  Feedly account, switch on GitHub *Watch → Releases*, and pick the weekly day.
- **Next:** Step 6 — the repository. Step 4 (Figma) is Irem's, done last.

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
| Project-management tool for CP 4 | Step 6 |
| Code-quality tool (SonarCloud?) | Step 26 |
| Deployment target | Step 29 |
| Acceptance tests on a solo project | Step 24 |
| *Comptes rendus de réunion* on a solo project | Step 31 |
| Confirm the English UI with the formateur | — |
| Irem's name for the *maître d'œuvre* line | — |

---

## 5. How we work

- **One task at a time**, then a checkpoint. Wait for validation before the next step.
- **No time estimates, no calendar planning.** Irem sets the pace.
- Documents stay **short**. If Irem cannot explain a line to a jury, it does not belong there.
- Chat in English; Turkish when Irem asks.

---

## 6. Things not to forget

- **CP 4 artefacts cannot be reconstructed later.** The *Difficultés rencontrées* table and the
  *comptes rendus de réunion* must be written **the day the problem happens**.
- **Veille technologique is graded in six CPs.** The system exists now — what is left is the
  habit. One entry a week, written the week it happens.
- **Backup and restore must be demonstrated**, not merely scripted.
- Load testing, fuzzing and acceptance tests are three separate CP 9 items.
- Éco-conception (CP 6), RGAA (CP 2, CP 5) and RGPD (CP 2, CP 5, CP 7) are graded and easy to skip.
- **Git history is graded (CP 4)** — the repository does not exist yet (Step 6).
