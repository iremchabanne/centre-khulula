# Procédure de déploiement — Centre Khulula

**Version 1.0 — 01/09/2026**

Machine avec Docker installé. À suivre dans l'ordre.

---

## 1. Les deux environnements

| | Développement | Production |
|---|---|---|
| Fichier | `docker-compose.yml` | `docker-compose.prod.yml` |
| Services | postgres, redis, adminer, api, client | postgres, redis, api, client |
| Ports ouverts | 5173, 3000, 5432, 6379, 8080 | 80 seulement |
| Code | monté depuis la machine | copié dans l'image |

## 2. Déployer

```bash
git clone git@github.com:iremchabanne/centre-khulula.git
cd centre-khulula

cp .env.example .env
openssl rand -base64 32          # un mot de passe et un SESSION_SECRET neufs

docker compose -f docker-compose.prod.yml up -d --build

# Donner son mot de passe au compte applicatif. La migration crée le rôle
# khulula_app SANS mot de passe, parce qu'un secret n'entre pas dans un fichier
# versionné : sans cette commande l'API répond 500 sur toute lecture.
source .env
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "ALTER ROLE khulula_app PASSWORD '$APP_DB_PASSWORD';"

docker compose -f docker-compose.prod.yml restart api

curl -s http://localhost/api/health     # attendu : {"status":"ok"}
```

Au démarrage, l'API applique les migrations puis lance le seed. Ce déploiement est une
démonstration : il repart donc du même jeu de données à chaque redémarrage, et tout ce qui a été
saisi entre-temps est effacé. Les comptes se connectent avec `khulula-dev-password`.

## 3. Mettre à jour

```bash
api/scripts/backup.sh            # toujours avant
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

La base n'est pas touchée. Pour revenir en arrière : `api/scripts/restore.sh <fichier>`.

## 4. Les images de production

- `api/Dockerfile.prod` — dépendances sans les outils de développement, migrations, démarrage.
- `client/Dockerfile.prod` — Vite construit le site, nginx sert les fichiers.
- `client/nginx.conf` — renvoie `/api` vers l'API, le reste vers `index.html`.

## 5. Exécuter les tests

| Tests | Commande |
|---|---|
| Unitaires et d'intégration | `npm test` depuis `api/` |
| Unitaires, à chaque push | automatique, `.github/workflows/ci.yml` |
| Qualité de code et types | `npm run lint`, `npm run typecheck` |
| Charge et fuzzing | `ab`, `api/scripts/fuzz-donation-form.sh` |
| Recette fonctionnelle | `docs/tests/plan-de-tests.md` §9, à la main |

## 6. Hors périmètre

HTTPS, nom de domaine, sauvegarde automatique, supervision.
