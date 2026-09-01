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

curl -s http://localhost/api/health     # attendu : {"status":"ok"}
```

Les migrations s'appliquent au démarrage de l'API. **Le seed n'est jamais lancé en production :
il vide les tables.** Les deux comptes administrateurs sont créés à la main, une fois.

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
