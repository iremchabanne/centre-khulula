# Plan de tests et compte rendu d'exécution — Centre Khulula

**Version 1.1 — 27/08/2026**

Un seul document plutôt que deux : le plan et le compte rendu partagent le même tableau, à une
colonne près. Séparés, ils divergent.

---

## 1. Objet et périmètre

Ce plan couvre le **back-end** : l'API, la base de données et les règles de gestion RG1 à RG16
du cahier des charges. Le front-end n'existe pas encore ; il fera l'objet d'une version 2.0.

**Principe retenu : peu de tests, mais des tests pertinents.** Chaque test correspond à une règle
de gestion que rien d'autre ne garantit. Un test que l'on ne sait pas expliquer ne prouve rien.

---

## 2. Moyens

| Moyen | Usage |
|---|---|
| **Vitest** | Les tests automatisés, lancés par `npm test` depuis `api/`. |
| **PostgreSQL réel** | Trois des quatre tests s'exécutent contre la base de développement : un verrou de ligne et une transaction n'existent que dans un vrai SGBD. |
| **curl** | Les vérifications manuelles du contrôle d'accès, sur l'API en fonctionnement. |
| **Adminer / psql** | La démonstration des objets SQL écrits à la main (index, trigger, fonctions, droits). |

---

## 3. Tests automatisés

Quatre fichiers dans `api/tests/`, cinq tests. Commande : `npm test`.

| Fichier | Règle | Ce qui est vérifié | Attendu | Obtenu (27/08/2026) |
|---|---|---|---|---|
| `admission-race.test.ts` | RG1, RG2 | Deux admissions simultanées dans le dernier enclos libre. | Une réussite, un refus 409, **un seul séjour ouvert** en base. | ✅ Conforme |
| `admission-rollback.test.ts` | RG2 | Une admission qui échoue après la création de l'animal. | Aucun animal orphelin, enclos toujours `free`. | ✅ Conforme |
| `deactivated-account.test.ts` | RG12 | Un compte désactivé pendant que sa session est ouverte. | Refus **401** à la requête suivante. | ✅ Conforme |
| `pagination.test.ts` | §6.4 | `pageQuery` et `pageResult`, fonctions pures. | `skip`/`take` corrects, nombre de pages arrondi au supérieur. | ✅ Conforme |

### 3.1 Chaque test a été vu échouer

Un test qui n'a jamais échoué ne prouve rien : il peut passer parce que la règle est respectée,
ou parce qu'il ne vérifie rien. Les trois tests d'intégration ont donc été exécutés une fois
contre un code volontairement cassé, puis le code a été restauré par `git checkout`.

| Test | Ce qui a été retiré | Résultat |
|---|---|---|
| `admission-race` | La clause `SELECT … FOR UPDATE` | **Le test passe quand même** — l'index unique partiel refuse le second séjour à lui seul. Défense en profondeur : le verrou transforme la course en file d'attente, l'index rend l'erreur impossible. |
| `admission-rollback` | L'appel à `$transaction` | Échec : `expected 1 to be +0` — un animal orphelin subsiste. |
| `deactivated-account` | Le contrôle `is_active` | Échec : la méthode renvoie le compte désactivé au lieu de refuser. |

Le premier résultat est une **découverte**, pas un défaut du test : il documente le fait que deux
défenses indépendantes couvrent RG1. Le test affirme le résultat dont le centre a besoin, pas le
mécanisme qui l'obtient.

---

## 4. Vérifications manuelles

Certaines preuves ne sont pas automatisées, et c'est un choix : les automatiser demanderait de
démarrer un serveur ou de rejouer une migration dans le test, pour une valeur nulle.

| Vérification | Moyen | Date | Résultat |
|---|---|---|---|
| Contrôle d'accès sur les 6 routes protégées : sans session → 401, cookie forgé → 401, compte désactivé → 401, soigneur sur route vétérinaire → 403, soigneur sur route admin → 403. | curl | 26/08/2026 | ✅ Conforme |
| RG12 de bout en bout, à travers Express et un vrai cookie. | `api/scripts/check-deactivated-account.sh` | 26/08/2026 | ✅ Conforme |
| Index unique partiel, trigger `enclosure.status`, deux fonctions stockées, droits du compte `khulula_app`. | Adminer / psql | 22–25/08/2026 | ✅ Conforme |
| Compte `khulula_app` incapable de supprimer une ligne, de réécrire une observation ou de lire l'historique des migrations. | psql | 25/08/2026 | ✅ Conforme |

---

## 5. Test de charge  ·  §6.5

**Outil : `ab` (Apache Bench)**, déjà présent sur la machine. Aucune installation, une commande
par mesure. Le 27/08/2026, API et base de données lancées en local.

| Mesure | Commande | Résultat |
|---|---|---|
| Temps de réponse sous la limite | `ab -n 50 -c 5 .../api/species` | 0 échec · **583 req/s** · médiane **6 ms** · 99ᵉ centile 38 ms |
| Comportement au-delà de la limite | `ab -n 300 -c 20 .../api/animals?status=in_care` | **60 réponses 200, 240 réponses 429** |

Les deux mesures se lisent ensemble. La première donne la vitesse réelle d'une liste publique :
six millisecondes en médiane, sur une liste paginée à dix éléments (§6.4). La seconde montre que
la limitation de débit fait exactement son travail — 60 requêtes par minute et par IP passent, les
240 suivantes sont refusées avec un 429. **La protection contre la charge n'est pas une option de
configuration : c'est du code, et il est vérifié.**

---

## 6. Fuzzing  ·  formulaire de don

**Outil : un script écrit pour le projet**, `api/scripts/fuzz-donation-form.sh`. Quinze charges
utiles choisies à la main, couvrant les catégories qui cassent réellement un formulaire web :
mauvais type, hors bornes, champ manquant, injection, corps illisible.

Il ne vérifie **qu'une chose** : chaque réponse doit être 201 ou 400. Un 400 signifie que Zod a
intercepté l'entrée ; un 500 signifierait qu'elle est arrivée jusqu'à du code qui ne l'attendait
pas.

**Résultat du 27/08/2026 : 15 charges utiles, 0 échec** — après correction de l'anomalie ci-dessous.

### 6.1 Anomalie trouvée et corrigée le jour même

| | |
|---|---|
| **Symptôme** | Un corps de requête qui n'est pas du JSON renvoyait **HTTP 500**. |
| **Cause** | `express.json()` échoue avant d'atteindre nos routes ; le gestionnaire d'erreurs central ne reconnaissait pas cette erreur et appliquait son 500 générique. |
| **Pourquoi c'est un défaut** | 500 annonce une panne du serveur. Ici rien n'est en panne : c'est l'appelant qui a envoyé n'importe quoi. Le bon code est 400. Un mauvais code brouille les journaux et déclenche de fausses alertes. |
| **Correction** | Une branche dans `errorHandler` (`api/src/middleware.ts`) qui reconnaît l'erreur d'analyse d'`express.json()` et répond 400. |
| **Vérification** | Script relancé : 15/15 conformes. |

### 6.2 Deux réponses 201 qui sont le comportement attendu

Un fragment SQL dans le nom du donateur et une balise `<script>` dans le message sont **acceptés**,
et c'est correct :

- le fragment SQL n'est que du texte — Prisma envoie des requêtes paramétrées, il n'est jamais
  exécuté (OWASP A03) ;
- la balise `<script>` se neutralise **à l'affichage**, pas à la saisie : React échappe le texte
  qu'il rend. Refuser ces caractères à l'entrée reviendrait à refuser des messages légitimes.

---

## 7. Ce qui n'est pas couvert, et pourquoi

L'honnêteté sur les limites fait partie du plan.

- **Le front-end** — il n'existe pas encore.
- **Les tests d'acceptation** — reportés après le front-end, et c'est délibéré : une recette se
  fait sur des écrans. Chacun des 18 besoins du cahier des charges sera alors parcouru dans
  l'application et le résultat consigné, daté. Le projet étant mené seul et la maîtrise d'ouvrage
  fictive, c'est Irem qui tiendra le rôle du client : le dossier professionnel le dira tel quel.
- **Le câblage HTTP des middlewares** — couvert par les vérifications manuelles du §4, pas par
  Vitest. Démarrer un serveur Express dans un test coûterait plus que la règle ne vaut.

---

## 8. Compte rendu d'exécution

**Date :** 27/08/2026 · **Commande :** `npm test` depuis `api/` · **Pré-requis :**
`docker compose up -d`

```
 Test Files  4 passed (4)
      Tests  5 passed (5)
   Duration  3.23s
```

Le test de charge (§5) et le fuzzing (§6) ont été exécutés le même jour, contre la même pile.

**Aucune anomalie ouverte.** Deux anomalies ont été détectées depuis le début du projet, toutes
deux corrigées le jour même et décrites dans le tableau *Difficultés rencontrées* du dossier
professionnel :

| Date | Anomalie | Trouvée par | État |
|---|---|---|---|
| 26/08/2026 | RG12 non appliqué pendant toute la durée de la session. | Vérification manuelle au curl | Corrigée, et couverte par un test automatisé. |
| 27/08/2026 | Un corps non-JSON renvoyait 500 au lieu de 400. | Fuzzing | Corrigée, et le script la revérifie. |
