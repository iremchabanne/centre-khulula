# Système de veille technologique — Centre Khulula

| | |
|---|---|
| **Version** | 1.0 — 20 août 2026 |
| **Couvre** | CP 2, 3, 8, 9, 10, 11 — *« Le système de veille permet de suivre les évolutions technologiques et les problématiques de sécurité »* |
| **Journal** | `journal.md` — les entrées datées |

Ce document décrit **le système**. Les entrées elles-mêmes sont dans `journal.md`.

---

## 1. Périmètre

Le critère est identique dans six compétences, mais chacune vise son propre domaine. Les sources
sont donc choisies pour couvrir les six.

| CP | Domaine surveillé |
|---|---|
| CP 2 | Interfaces utilisateur — React, accessibilité, XSS/CSRF |
| CP 3 | Composants métier — Node.js, TypeScript |
| CP 8 | Accès aux données — PostgreSQL, Prisma, Redis |
| CP 9 | Tests et sécurité applicative — OWASP |
| CP 10 | Déploiement — Docker |
| CP 11 | DevOps — CI/CD, dépendances |

**Deux axes indissociables** : les évolutions technologiques *et* les problématiques de sécurité.
Une veille qui ne suit que les nouveautés ne répond qu'à la moitié du critère.

---

## 2. Sources

### 2.1 Sécurité

| Source | Ce qu'elle apporte | Pourquoi celle-ci |
|---|---|---|
| **CERT-FR** (ANSSI) — avis et alertes | Vulnérabilités touchant Node.js, PostgreSQL, Docker | Autorité française de référence, et le cahier des charges §6.1 cite explicitement l'ANSSI |
| **OWASP** — Top 10 et *cheat sheets* | Failles applicatives et parades | Référentiel cité dans le cahier des charges §6.1 ; les *cheat sheets* sont directement applicables |
| **GitHub Dependabot** sur le dépôt | Alertes sur nos dépendances réelles | Automatique et ciblé sur *nos* paquets, pas sur l'écosystème entier |

### 2.2 Technologies du projet

Suivies par la fonction **Watch → Releases** de GitHub, qui notifie à chaque version publiée.
Uniquement les briques que nous utilisons vraiment.

| Dépôt suivi | CP |
|---|---|
| `nodejs/node` | 3 |
| `facebook/react` | 2 |
| `microsoft/TypeScript` | 3 |
| `prisma/prisma` | 8 |
| `postgres/postgres` | 8 |
| `redis/redis` | 8 |
| `tailwindlabs/tailwindcss` | 2 |

### 2.3 Accessibilité et éco-conception

| Source | CP |
|---|---|
| **RGAA** — référentiel officiel (numerique.gouv.fr) | 2, 5 |
| **W3C / WAI** — WCAG et notes de mise à jour | 2, 5 |

---

## 3. Outils

| Outil | Rôle | Coût |
|---|---|---|
| **Feedly** (offre gratuite) | Agrégateur RSS — rassemble CERT-FR, OWASP, RGAA et les flux de releases en un seul endroit | 0 € |
| **GitHub Watch → Releases** | Notification à chaque version des sept dépôts suivis | 0 € |
| **GitHub Dependabot** | Alerte automatique sur les vulnérabilités de nos dépendances | 0 € |
| **`journal.md`** | Trace écrite, versionnée avec le projet | 0 € |

> **Pourquoi un fichier versionné et non un outil externe.** Le journal vit dans le dépôt : il est
> horodaté par Git, il ne peut pas être reconstitué après coup, et le jury voit dans l'historique
> qu'il a été tenu au fil du projet. C'est précisément ce que la preuve demande.

---

## 4. Méthode

**Rythme : une session par semaine**, à jour fixe. Le jour est choisi par la maîtrise d'œuvre et
ne change pas — une veille irrégulière n'est pas un système.

Trois étapes :

1. **Parcourir** les alertes CERT-FR et Dependabot en premier — la sécurité passe avant la
   nouveauté.
2. **Retenir ce qui concerne le projet.** Une nouveauté qui ne touche aucune de nos briques n'est
   pas retenue. La veille n'est pas une revue de presse.
3. **Écrire une entrée** dans `journal.md`, même courte, même pour dire qu'il ne s'est rien passé
   d'applicable. Une semaine sans entrée est un trou dans la preuve.

**Une entrée n'est retenue que si elle répond à : *« qu'est-ce que cela change pour Khulula ? »***
Si la réponse est « rien », elle ne mérite pas une entrée. Si la réponse est « il faut modifier
quelque chose », l'action est notée et suivie.

---

## 5. Format d'une entrée

Chaque entrée du journal a cinq champs. Le dernier est le plus important.

| Champ | Contenu |
|---|---|
| **Date** | Le jour de lecture |
| **Source** | D'où vient l'information |
| **Sujet** | En une phrase |
| **CP** | La ou les compétences concernées |
| **Ce que cela change pour Khulula** | L'action décidée, ou « aucune action » avec la raison |
