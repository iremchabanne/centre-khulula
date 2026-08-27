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
- [ ] The `api` and `client` Docker services — added at step 18, once the React app exists.

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
- [ ] Acceptance tests — **decision open.** How to do this honestly on a solo project, where the
      maîtrise d'ouvrage is fictional.

### Step 25 — Load testing and fuzzing  ·  CP 9

Two separate deliverables, both small, both easy to forget.

- [ ] Load test on the public pages and the donation form (§6.5 du cahier des charges).
- [ ] Fuzzing on the input forms.

### Step 26 — Code quality tool  ·  CP 11

- [ ] **Decision open** — SonarCloud, or something else.
- [ ] Wired in and producing a report.

### Step 27 — Continuous integration  ·  CP 11

- [ ] Pipeline: install, lint, test, build.
- [ ] Runs on every push.

---

## Track F — Operations

### Step 28 — Backup and restore  ·  CP 7, easy to forget

- [ ] Backup script, restore script.
- [ ] **A demonstrated restore** — not just a script that exists.

### Step 29 — Deployment  ·  CP 10, CP 11

- [ ] **Decision open** — deployment target.
- [ ] Documented deployment procedure and scripts.

---

## Track D — Frontend  ·  after Track E

`client/` does not exist yet.

### Step 18 — React foundations  ·  CP 2

- [ ] Project setup, routing, the two layouts (public site / staff app).
- [ ] The charte graphique palette declared once in the Tailwind theme —
      **never a hardcoded colour**.
- [ ] Shared components: table, pager, toolbar, tabs, modal, status pill.
- [ ] The `api` and `client` Docker services, completing step 7.

### Step 20 — Staff shell

- [ ] Login, sign-out, session expiry.
- [ ] Sidebar filtered by role and by `is_admin`.
- [ ] The access-denied / not-found / session-expired page.

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
| 2 | Code-quality tool | Step 26 |
| 3 | Deployment target | Step 29 |
| 4 | Acceptance tests on a solo project | Step 24 |
| 5 | *Comptes rendus de réunion* on a solo project | Step 31 |
| 6 | Confirm the English UI with the formateur | — |
| 7 | Irem's name for the *maître d'œuvre* line | — |

---

## Things not to forget

- **Check every feature against `docs/dp/00-referentiel-CP.md` before calling it done.**
- **Veille technologique is graded in six CPs** — one entry a week, it cannot be backdated.
- **Backup and restore must be demonstrated**, not merely scripted.
- Load testing and fuzzing are two separate CP 9 items, and acceptance tests a third.
- Éco-conception (CP 6), RGAA (CP 2, CP 5) and RGPD (CP 2, CP 5, CP 7) are all graded and all
  easy to skip under pressure.
- Commit at every validated checkpoint (CP 4).
