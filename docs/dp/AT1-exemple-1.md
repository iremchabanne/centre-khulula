# AT 1 — Exemple 1

**Couvre : CP 1** (Installer et configurer son environnement de travail en fonction du projet)
**et CP 4** (Contribuer à la gestion d'un projet informatique)

| | |
|---|---|
| **Projet support** | *(à définir)* |
| **Dépôt** | *(à définir)* |
| **Période** | Du *(jj/mm/aaaa)* au *(jj/mm/aaaa)* |
| **Rôle** | *(à définir)* |

> **How this file works.** The long sections below are the *working notes* — much more detail
> than the DP needs. Write them while you build, not at the end. The last section,
> **« Pour le DP »**, is what you actually copy into the official form. Writing it is easy once
> the notes exist.
>
> Everything meant for the jury is in **French** — it goes into a French document. My
> instructions to you are in English, in blockquotes like this one, and get deleted at the end.

---

## 1. Contexte et besoin

> What is the project, what does it do, and **why did the environment need to be set up this
> way**? Do not describe Docker in general — describe the constraint in *our* project that made
> containers the answer (several services, two database engines, matching production, avoiding
> port conflicts…). The jury is looking for a justified choice, not a tool list.

*(à rédiger)*

**Architecture technique du projet :**

| Composant | Technologie | Rôle |
|---|---|---|
| *(à compléter)* | | |

🔗 *(liens : docker-compose.yml, README.md, arborescence du projet)*

---

## 2. Configuration du poste de développement — CP 1

> Your machine, your OS, your editor, and **why each choice fits this project**. Every tool needs
> a reason tied to the project, not "je le connais bien".
>
> Cover: OS, editor + extensions (with what each one is for), runtime version and how you install
> it, package manager, and how a newcomer gets started.

**Système et éditeur :** *(à rédiger)*

**Extensions installées :**

| Extension | Rôle dans le projet |
|---|---|
| *(à compléter)* | |

**Runtime et gestionnaire de paquets :** *(à rédiger)*

**Documentation de mise en route :** *(à rédiger — fichier INSTALL.md)*

🔗 *(liens)*

---

## 3. Environnement conteneurisé — CP 1

> **This is the graded criterion: « Les conteneurs implémentent les services requis ».**
> Don't just say "j'ai utilisé Docker". Explain two or three configuration choices that solved a
> real problem, and show the YAML extract.
>
> Good candidates: port offsets to avoid conflicts, healthchecks + `depends_on: service_healthy`,
> volume mounts for hot reload without crushing `node_modules`, network isolation.

*(à rédiger)*

```yaml
# extrait de docker-compose.yml
```

🔗 *(liens)*

---

## 4. Configuration et données sensibles — CP 1

> No secret in the code. Explain: `.env` gitignored, `.env.example` versioned and why,
> separate dev/prod examples, and where CI secrets live.

*(à rédiger)*

🔗 *(liens : .gitignore, .env.example)*

---

## 5. Gestion des versions et collaboration — CP 1 + CP 4

> Serves both CPs. Cover: Git + GitHub, branch strategy, commit convention, pull requests,
> and where the project documentation lives.
>
> CP 4 criterion: « Les outils collaboratifs sont choisis en fonction de la méthode de
> développement » — so say *why* these tools fit the method you chose.

*(à rédiger)*

🔗 *(liens : branches, pull requests, historique des commits)*

---

## 6. Contrôles automatisés avant commit — CP 1 + CP 4

> CP 4 criterion: « Les procédures qualité sont mises en œuvre ».
> Cover: linter, formatter, why they are separate, pre-commit hooks, and what the hook runs.

*(à rédiger)*

🔗 *(liens)*

---

## 7. Méthode de gestion de projet — CP 4

> CP 4 criteria: « Les tâches … sont planifiées en fonction du délai défini » and « Le suivi des
> tâches est mis en rapprochement avec la planification, les éventuels retards sont identifiés ».
>
> Name the method (agile / itératif or séquentiel) and justify it. Describe the sprints or
> iterations, and the tool used for the board.
>
> **The "retards identifiés" criterion needs a real example** — a task that slipped, how you saw
> it, and what you did. Note it down when it happens; you will not remember later.

**Méthode retenue et justification :** *(à rédiger)*

**Découpage en itérations :** *(à rédiger)*

**Outil de gestion de projet :** *(à rédiger)*

**Suivi et écarts constatés :** *(à rédiger)*

🔗 *(liens : board du projet, tickets, jalons)*

---

## 8. Planification et suivi des tâches — CP 4

> A dated planning, and the comparison between planned and actual.

| Itération | Période prévue | Contenu | Réalisé | Écart et action |
|---|---|---|---|---|
| *(à compléter)* | | | | |

🔗 *(liens)*

---

## 9. Comptes rendus de réunion — CP 4

> **Graded criterion**: « Les comptes rendus de réunion sont structurés, rédigés dans un style
> adapté, dans le respect des règles orthographiques et grammaticales, et contiennent les
> informations nécessaires. »
>
> These cannot be invented at the end — write one after each point d'étape, review, or
> soutenance. Store them in `docs/reunions/`.
>
> Each one needs: date, participants, ordre du jour, décisions prises, actions avec responsable
> et échéance.

| Date | Objet | Participants | Lien |
|---|---|---|---|
| *(à compléter)* | | | |

🔗 *(liens vers docs/reunions/)*

---

## 10. Veille technologique

> Graded in six CPs. Describe the actual system: which sources, which tool, how often, and one
> concrete example of something you found that changed a decision in the project.

*(à rédiger)*

---

## 11. Difficultés rencontrées

> **This table is the evidence for the transversal competence « Mettre en œuvre une démarche de
> résolution de problème ».** It is also what the jury asks about orally — a real bug you
> diagnosed is far more convincing than a feature that worked first time.
>
> Fill it in *the day it happens*. One line per problem: what broke, what the actual cause was
> (not the symptom), how you fixed it, and the commit that proves it.
>
> **Scope — decided 22/08/2026.** Only two kinds of entry belong here: a real problem that came
> out of the code, and a design decision taken early that had to be changed later. Incidents with
> the editor or other local tooling are out of scope and never go in.

| Difficulté | Diagnostic | Résolution | Commit |
|---|---|---|---|
| 25/08/2026 — `docker compose up` échoue : « container name /khulula-redis is already in use », alors que les conteneurs tournaient. | `docker inspect` montre le label `com.docker.compose.project=dossierprof` et un chemin de configuration qui n'existe plus. Le dossier du projet avait été renommé `dossier prof` → `khulula` ; Compose déduit le nom de projet du nom du dossier, il tentait donc de créer un projet neuf `khulula` dont les noms de conteneurs étaient déjà pris par l'ancien projet. Le symptôme était le nom du conteneur, la cause était le renommage du dossier. | Migration propre plutôt que contournement : suppression des conteneurs de l'ancien projet, `docker compose up -d` depuis le nouveau dossier, puis `prisma migrate deploy` et `npm run seed`. Les volumes de l'ancien projet ont été conservés le temps de vérifier les données. Aucune perte : le contenu était le jeu de données de développement, reproductible par le seed (14 animaux, 5 comptes, 12 dons, identiques avant et après). | — (incident d'environnement, aucun fichier du dépôt modifié) |

---

## Annexes à joindre

> The list of files and screenshots to attach to the DP. Keep it updated as you go so the final
> assembly is mechanical.

1. *(à compléter — extrait de `docker-compose.yml`)*
2. *(à compléter — `INSTALL.md`)*
3. *(à compléter — `.env.example`)*
4. *(capture — `docker compose ps` avec tous les services démarrés)*
5. *(capture — board du projet avec les tickets)*
6. *(capture — une pull request avec son commentaire de revue)*
7. *(un compte rendu de réunion)*

---
---

# Pour le DP

> **This is the part that goes into `DP-Vierge-pre-rempli-CDA.pdf`, Activité-type 1, Exemple 1.**
> The five headings below are the official ones, word for word. Keep it condensed — the jury
> reads the DP, then asks questions; the detail above is your preparation for those questions.
> Aim for roughly half a page per field.

### Intitulé de l'exemple

*(à définir — un titre court et concret)*

### 1. Décrivez les tâches ou opérations que vous avez effectuées, et dans quelles conditions

> Draw from sections 1, 2, 3, 7 and 8. What you *did*, in the first person, with the conditions
> (solo/team, constraints, deadline).

*(à rédiger)*

### 2. Précisez les moyens utilisés

> Draw from sections 2, 3, 4, 5 and 6. The tools, languages, and why they were chosen.

*(à rédiger)*

### 3. Avec qui avez-vous travaillé ?

> Draw from section 9. Formateur, référent, promotion, testers. Be honest about a solo project —
> say who you interacted with and in what role.

*(à rédiger)*

### 4. Contexte

- **Nom de l'entreprise, organisme ou association :** *(à compléter)*
- **Chantier, atelier, service :** *(à compléter)*
- **Période d'exercice :** du *(jj/mm/aaaa)* au *(jj/mm/aaaa)*

### 5. Informations complémentaires (facultatif)

> Optional field. Good place for the *Difficultés rencontrées* table or the veille system.

*(à rédiger)*

---

## Vérification — critères de performance

> Tick these off before declaring this example finished. Quoted from the référentiel.
> See `00-referentiel-CP.md`.

**CP 1**
- [ ] Les outils de développement nécessaires sont installés
- [ ] Les outils de gestion des versions et de collaboration sont installés
- [ ] Les conteneurs implémentent les services requis
- [ ] La documentation technique de l'environnement de travail est comprise, en langue française
      ou anglaise (niveau B1 CECRL pour l'anglais)

**CP 4**
- [ ] Les tâches de conception et de développement sont planifiées en fonction du délai défini
- [ ] Le suivi des tâches est mis en rapprochement avec la planification, les éventuels retards
      sont identifiés et les acteurs concernés sont alertés
- [ ] Les procédures qualité sont mises en œuvre
- [ ] L'environnement de développement défini est en adéquation avec l'architecture du projet
- [ ] Les outils collaboratifs sont choisis en fonction de la méthode de développement
- [ ] Les comptes rendus de réunion sont structurés, rédigés dans un style adapté, dans le respect
      des règles orthographiques et grammaticales, et contiennent les informations nécessaires
