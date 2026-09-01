# Plan de tests et compte rendu d'exécution — Centre Khulula

**Version 2.0 — 01/09/2026**

Un seul document plutôt que deux : le plan et le compte rendu partagent le même tableau, à une
colonne près. Séparés, ils divergent.

---

## 1. Objet et périmètre

Ce plan couvre le **back-end** — l'API, la base de données et les règles de gestion du cahier des
charges — par des tests automatisés (§3), et le **front-end** par la recette fonctionnelle du §9,
parcourue à la main sur les 13 écrans.

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

- **Le front-end n'a pas de tests automatisés** — il est couvert par la recette du §9, parcourue
  à la main. Outiller un navigateur coûterait ici plus que la règle ne vaut.
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

**Recette fonctionnelle du §9 : 01/09/2026, les 18 besoins parcourus dans l'application, 18
conformes, aucune anomalie ouverte.** Chaque écriture a été recoupée en base — l'animal admis, les
deux séjours du déplacement, l'observation et son auteur, l'enclos libéré par la sortie — pour
vérifier non pas ce que l'écran affiche, mais ce que la base contient.

**Aucune anomalie ouverte.** Deux anomalies ont été détectées depuis le début du projet, toutes
deux corrigées le jour même et décrites dans le tableau *Difficultés rencontrées* du dossier
professionnel :

| Date | Anomalie | Trouvée par | État |
|---|---|---|---|
| 26/08/2026 | RG12 non appliqué pendant toute la durée de la session. | Vérification manuelle au curl | Corrigée, et couverte par un test automatisé. |
| 27/08/2026 | Un corps non-JSON renvoyait 500 au lieu de 400. | Fuzzing | Corrigée, et le script la revérifie. |

---

## 9. Recette fonctionnelle  ·  les 18 besoins

Ajoutée en version 2.0, une fois les 13 écrans construits. Chaque besoin du §4 du cahier des
charges est parcouru **dans l'application**, à la main, et le résultat est consigné.

**La maîtrise d'ouvrage est fictive et le projet est mené seul : c'est Irem qui tient le rôle du
client.** Le dossier professionnel le dit tel quel — un jury lit mieux une limite assumée qu'une
mise en scène. Trois développeurs ont en revanche parcouru le site et leurs remarques ont été
traitées le jour même (§9.2).

**Pré-requis :** `docker compose up -d`, puis `npm run seed` depuis `api/`. Comptes :
`thandiwe.mokoena@khulula.org` (vétérinaire et administratrice),
`lerato.dlamini@khulula.org` (soigneuse), mot de passe `khulula-dev-password`.

### 9.1 Tableau de recette

| Réf. | Ce qui est fait | Résultat attendu | Résultat | Date |
|---|---|---|---|---|
| **V1** | Ouvrir `/` | La mission, la bannière et les trois chiffres s'affichent | Conforme | 01/09/2026 |
| **V2** | Ouvrir `/species` | Les neuf espèces, avec photo et statut UICN | Conforme | 01/09/2026 |
| **V3** | `/animals`, onglet *In our care* | Seuls les animaux en soins, jamais un `deceased` | Conforme — aucun animal décédé dans la liste | 01/09/2026 |
| **V4** | `/animals`, onglet *Released* | Seuls les animaux relâchés | Conforme | 01/09/2026 |
| **V5** | Envoyer le formulaire de don avec un montant seul | Remerciement affiché, don visible en base | Conforme — R 500 enregistré, `donor_name` et `donor_email` à NULL, `consent_given` à false | 01/09/2026 |
| **V6** | Ouvrir `/legal` | Mentions légales, RGPD, crédits photo, accessibilité | Conforme — six sections : éditeur, données collectées, finalité et durée, droits, accessibilité, crédits photo | 01/09/2026 |
| **S1** | Se connecter puis se déconnecter | Accès à l'espace personnel, puis retour à la connexion | Conforme | 01/09/2026 |
| **S2** | Ouvrir `/staff/enclosures` | Les cinq chiffres et l'état réel de chaque enclos | Conforme — 3 libres / 6 occupés / 1 en maintenance, statuts dérivés par le trigger | 01/09/2026 |
| **S3** | Admettre un animal | L'animal est créé, l'enclos passe `occupied` sans être écrit à la main | Conforme — tortue léopard admise en E-09, un enclos `reptile` : espèce et type concordent (RG17), statut `admitted` (RG4), enclos passé `occupied` par le trigger (RG3) | 01/09/2026 |
| **S4** | Ouvrir l'admission dans deux onglets, valider les deux sur le même enclos | Le second reçoit « no longer free », un seul séjour existe | Conforme — E-08 : le second onglet reçoit « Enclosure E-08 is no longer free », la boîte de dialogue reste ouverte. Un seul séjour ouvert sur E-08, et aucun animal sans séjour en base : la transaction refusée n'a rien laissé (RG2) | 01/09/2026 |
| **S5** | Ajouter une observation avec changement de statut | L'observation apparaît, le statut suit | Conforme — l'animal passe `in_care`, l'observation porte le même `status_after` et l'auteur lu dans la session, le tout dans une seule transaction | 01/09/2026 |
| **S6** | Déplacer un animal vers un enclos libre du bon type | Ancien enclos libéré, nouveau occupé, séjour précédent clos | Conforme — E-09 → E-10, deux enclos `reptile` : le premier séjour est clos et son enclos repasse `free`, le second s'ouvre avec son motif et son enclos passe `occupied`. Les deux statuts sont écrits par le trigger (RG8) | 01/09/2026 |
| **S7** | Ouvrir une fiche animal | Identité, séjours successifs et observations, du plus récent au plus ancien | Conforme — identité, les deux séjours successifs et les observations datées et signées, la plus récente en tête | 01/09/2026 |
| **T1** | En vétérinaire, prononcer une sortie | Statut terminal, enclos libéré, fiche close à toute écriture | Conforme — statut `released`, date et vétérinaire enregistrés, séjour clos et E-10 repassé `free` par le trigger (RG7). La fiche n'offre plus ni déplacement ni observation (RG5) | 01/09/2026 |
| **T4** | Lire le tableau de bord | Taux d'occupation et durée moyenne, calculés par les fonctions stockées | Conforme — les deux indicateurs s'affichent, renvoyés par `occupancy_rate()` et `average_stay_length_days()` | 01/09/2026 |
| **A1** | Créer un compte, le désactiver, réinitialiser son mot de passe | Les trois opérations aboutissent, aucun e-mail n'est envoyé | Conforme — compte créé en `keeper` et `is_admin` à false (RG13), désactivé, mot de passe réinitialisé sans e-mail (RG15). Connexion ensuite refusée par « This account has been deactivated », message donné seulement après vérification du mot de passe : un identifiant inconnu et un mot de passe faux répondent la même chose, pour ne pas révéler qu'un compte existe | 01/09/2026 |
| **A2** | Onglet *Maintenance*, basculer un enclos libre puis un enclos occupé | Le premier passe en maintenance, le second est refusé (RG16) | Conforme — E-10 sorti de maintenance repasse `free`, statut écrit par le trigger. Sur un enclos occupé le bouton est désactivé ; la route appelée directement au curl répond « An occupied enclosure cannot be put under maintenance ». RG16 tient donc à l'écran et sur le serveur | 01/09/2026 |
| **A3** | En administratrice, ouvrir `/staff/donations` | La liste des dons ; un compte non administrateur est refusé | Conforme — la liste s'affiche, don de recette V5 compris. Refus d'un compte non administrateur vérifié au curl le même jour : 403 | 01/09/2026 |

### 9.2 Relecture par des tiers

| Date | Relecteur | Remarques retenues |
|---|---|---|
| 01/09/2026 | Un développeur | Lien *Staff login* du pied de page justifié et documenté ; deux défauts réels corrigés : les formulaires se vidaient entièrement sur une seule erreur de champ, et RG4 interdisait la rechute d'un animal en convalescence. |
