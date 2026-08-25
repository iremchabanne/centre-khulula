# Centre Khulula

Application de gestion d'un centre de réhabilitation de la faune sauvage, réalisée dans le cadre
du titre professionnel **Concepteur Développeur d'Applications** (niveau 6, TP-01281).

*Khulula* signifie « libérer » en isiZulu. Le centre recueille des animaux sauvages blessés ou
orphelins, les soigne, puis les relâche. Il dispose d'un **nombre limité d'enclos** : c'est la
contrainte qui structure toute l'application.

L'organisme, les animaux et les données sont fictifs.

---

## État du projet

**Phase de conception terminée. Le développement n'a pas commencé.**

Voir `PROGRESS.md` pour l'état détaillé et `PLAN.md` pour les étapes restantes.

## Stack technique

| Couche | Technologie |
|---|---|
| Langage | TypeScript |
| Interface | React, Tailwind |
| Serveur | Node.js, Express — architecture en couches |
| ORM | Prisma |
| Validation | Zod |
| Base relationnelle | PostgreSQL |
| Base clé/valeur | Redis |
| Conteneurs | Docker Compose |

## Démarrer l'environnement de développement

Prérequis : **Docker Desktop** installé et lancé.

```bash
cp .env.example .env     # puis remplacer les mots de passe
docker compose up -d     # démarre postgres, redis et adminer
docker compose ps        # vérifier que tout est "healthy"
```

| Service | Accès | Rôle |
|---|---|---|
| `postgres` | `localhost:5432` | Base de données relationnelle |
| `redis` | `localhost:6379` | Sessions, cache, rate limiting |
| `adminer` | http://localhost:8080 | Interface web pour inspecter la base |

Pour se connecter depuis Adminer : système **PostgreSQL**, serveur `postgres`, et les
identifiants du fichier `.env`.

```bash
docker compose down      # arrêter
docker compose down -v   # arrêter et supprimer les données
```

> Les services `api` et `client` seront ajoutés à l'étape 11, quand il y aura du code à exécuter.

## Organisation du dépôt

| Chemin | Contenu |
|---|---|
| `docs/conception/` | Cahier des charges, dossier de conception, charte graphique, modèle de données, maquettes |
| `docs/veille/` | Système de veille technologique et son journal |
| `docs/dp/` | Référentiel des compétences et fiches de préparation du dossier professionnel |
| `PLAN.md` | Les étapes du projet, ordonnées par dépendance |
| `PROGRESS.md` | L'état d'avancement |
| `docs/decisions.md` | Les décisions de projet — source de vérité (local, non versionné) |

## Langues

- **Code, base de données, interface :** anglais
- **Documents de projet :** français

---

## Conventions de commit

Format : `type(scope): description à l'infinitif, en anglais`

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `refactor` | Réécriture sans changement de comportement |
| `test` | Ajout ou correction de tests |
| `chore` | Outillage, configuration, dépendances |

Exemple : `feat(animal): add admission transaction with row-level lock`
