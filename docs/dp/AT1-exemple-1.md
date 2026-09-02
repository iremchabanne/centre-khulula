# AT 1 — Exemple 1 · CP 1 + CP 4

**CP 1** — Installer et configurer son environnement de travail en fonction du projet
**CP 4** — Contribuer à la gestion d'un projet informatique

> Ce fichier est la préparation des cinq champs de la page. Il ne contient rien de plus que ce
> que la page peut recevoir. Les blocs en citation comme celui-ci sont des notes de travail et
> disparaissent au moment de remplir le PDF.

---

### Intitulé de l'exemple

**Mettre en place et piloter l'environnement de développement du centre Khulula**

---

### 1. Décrivez les tâches ou opérations que vous avez effectuées, et dans quelles conditions

J'ai développé seule Centre Khulula, une application de gestion d'un centre de réhabilitation de
la faune sauvage. Avant d'écrire la moindre ligne de code métier, j'ai monté l'environnement de
travail et défini la façon dont le projet serait suivi. C'est ce travail que je décris ici.

**1) J'ai installé et configuré mon poste.**
> À compléter par Irem : système d'exploitation, éditeur, et les deux ou trois extensions
> réellement utilisées, avec en une ligne ce que chacune apporte au projet.

**2) J'ai conteneurisé la totalité des services dans Docker Compose.**
L'application a besoin de cinq services : une base relationnelle PostgreSQL, une base clé/valeur
Redis, l'API Node.js, le client React, et Adminer pour inspecter la base. Les installer un par un
sur ma machine m'aurait donné un environnement que je serais seule à pouvoir reproduire. Un seul
fichier `docker-compose.yml` les décrit tous, et `docker compose up -d` suffit à les démarrer.

Trois choix de configuration répondent à un problème précis :

- un **healthcheck** sur `postgres` et sur `redis`, avec `depends_on: service_healthy`, parce que
  l'API démarrait plus vite que la base et échouait à se connecter ;
- des **volumes nommés**, pour que les données survivent à un `docker compose down` ;
- un **mot de passe sur Redis dès le développement**, alors que Redis n'en demande pas : je voulais
  que l'environnement de développement ressemble à la production et que l'habitude ne se perde pas.

**3) J'ai sorti toute la configuration du dépôt.**
Aucun mot de passe n'est versionné. Le fichier `.env` est ignoré par Git ; un `.env.example`, lui,
est versionné avec des valeurs factices — il sert de liste documentée de ce dont la pile a besoin.
La procédure d'installation tient en trois commandes dans le `README.md`.

**4) J'ai mis en place la gestion de versions.**
Git en local, GitHub en dépôt distant, 80 commits. Chaque commit correspond à une fonctionnalité
terminée et validée, avec un message court en anglais qui dit ce qui change. Je pousse à la fin de
chaque journée de travail, décision prise après que le dépôt s'est retrouvé trois jours en retard
sur ma machine.

**5) J'ai mis en œuvre des procédures qualité automatiques.**
ESLint pour la qualité du code, le compilateur TypeScript pour le typage, et Vitest pour les tests.
Les trois tournent sur ma machine et de nouveau dans une intégration continue GitHub Actions, à
chaque push et à chaque pull request sur `main`. La CI a immédiatement prouvé son utilité : elle a
échoué au premier essai parce que `api/.env` n'est pas dans le dépôt — un problème invisible sur ma
machine, où le fichier existe.

**6) J'ai planifié le projet et suivi son avancement.**
Le fichier `PLAN.md` est mon outil de planification. Il découpe le travail en 33 étapes **ordonnées
par dépendance** et non par date, chacune disant ce qu'elle produit et à quelle condition elle est
terminée. `PROGRESS.md` dit où j'en suis. Je travaille une étape à la fois et je ne passe à la
suivante qu'après validation de la précédente.

**7) J'ai identifié et corrigé un écart de planification.**
Ma première planification visait la fin août. En reprenant la date auprès du formateur, j'ai
constaté que l'échéance réelle était le 07/10/2026 et que j'avais construit une pression inutile
sur une date fausse. J'ai corrigé le calendrier et documenté l'erreur dans le fichier de décisions,
pour ne pas la refaire.

---

### 2. Précisez les moyens utilisés

> À compléter : système d'exploitation et éditeur, ligne 1.

- Docker et Docker Compose pour l'environnement conteneurisé
- PostgreSQL 16 et Redis 7, en images officielles Alpine
- Node.js et npm comme environnement d'exécution et gestionnaire de paquets
- Git et GitHub pour la gestion de versions
- GitHub Actions pour l'intégration continue
- ESLint et le compilateur TypeScript pour les procédures qualité
- `PLAN.md` et `PROGRESS.md`, versionnés, comme outils de planification et de suivi

---

### 3. Avec qui avez-vous travaillé ?

> Réponse commune aux six pages. Elle est écrite une fois à l'étape 31 du `PLAN.md` et recopiée
> telle quelle ici.

*(à recopier depuis l'étape 31)*

---

### 4. Contexte

- **Nom de l'entreprise, organisme ou association :** Centre Khulula — organisme fictif, projet
  personnel réalisé pendant la formation
- **Chantier, atelier, service :** Formation au titre professionnel Concepteur Développeur
  d'Applications
- **Période d'exercice :** du 20/08/2026 au *(à compléter à la fin du projet)*

---

### 5. Informations complémentaires

*(champ laissé vide — les quatre difficultés retenues pour le dossier sont réparties sur les
quatre autres pages)*

> **Gardé pour l'oral, pas pour le dossier.** Deux défauts liés à la conteneurisation, le
> 01/09/2026 : le client Prisma du conteneur, généré au `build`, ignorait une colonne ajoutée par
> une migration plus récente, et Prisma traite une valeur `undefined` comme « pas de filtre » — la
> règle RG17 disparaissait du `where` sans erreur ni log. Et `vite.config.ts`, hors du dossier
> partagé avec le conteneur, y restait figé dans sa version d'avant le proxy `/api`, ce qui vidait
> toutes les pages publiques. Même écart dans les deux cas : ce qui tourne dans le conteneur n'est
> pas ce qui est écrit sur la machine. Corrigés par le commit `ce5c98b`. C'est la réponse à donner
> si le jury demande ce que la conteneurisation a coûté.

---

## Vérification — critères de performance

> À cocher avant de déclarer la page terminée. Citations du référentiel, voir
> `00-referentiel-CP.md`.

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

## Images de la page

1. `docker compose ps` — les cinq services démarrés et *healthy*
2. Une exécution verte de GitHub Actions
