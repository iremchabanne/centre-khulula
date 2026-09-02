# AT 2 — Exemple 2 · CP 7 + CP 8

**CP 7** — Concevoir et mettre en place une base de données relationnelle
**CP 8** — Développer des composants d'accès aux données SQL et NoSQL

---

### Intitulé de l'exemple

**Concevoir la base de données du centre et développer les accès SQL et NoSQL**

---

### 1. Décrivez les tâches ou opérations que vous avez effectuées, et dans quelles conditions

Le centre dispose d'un nombre limité d'enclos. Toute la difficulté de cette partie tient dans une
seule phrase : **deux soigneurs peuvent admettre un animal dans le dernier enclos libre au même
instant**. C'est le cas qui a dicté la conception de la base comme celle des composants d'accès.

**1) J'ai conçu les trois schémas de données.**
Un modèle conceptuel, un modèle logique et un modèle physique, chacun découlant du précédent, dans
`modele-donnees.md`. Sept tables : `staff_member`, `species`, `enclosure`, `animal`, `stay`,
`observation`, `donation`. Le séjour est une table à part et non deux colonnes dans `animal` :
c'est ce qui permet à un animal d'occuper plusieurs enclos successifs et de garder son historique.

**2) J'ai appliqué une règle de nommage unique et documentée.**
Tables au singulier, en `snake_case`, en anglais. `staff_member` et non `user`, parce que `user`
est un mot réservé de PostgreSQL. La règle est écrite dans le modèle de données et tenue partout.

**3) J'ai assuré l'intégrité par la base, pas seulement par le code.**
Un **index unique partiel** garantit qu'un enclos n'a jamais deux séjours ouverts (RG1). Un
**déclencheur PL/pgSQL** dérive `enclosure.status` du séjour en cours : l'application lit ce
statut, elle ne l'écrit jamais. J'ai vérifié le déclencheur sur tout le cycle de vie, y compris en
lançant un `UPDATE` direct pour le corrompre — le déclencheur l'a corrigé.

**4) J'ai créé deux comptes de base de données aux droits distincts.**
`khulula_admin` pour les migrations, `khulula_app` pour l'application. J'ai prouvé que
`khulula_app` ne peut **rien supprimer**, ne peut pas réécrire une observation, ne peut pas
modifier une espèce et ne peut pas supprimer une table — tout en faisant son travail normal. La
table `observation` est ainsi *append-only* par les droits, pas par une promesse du code.

**5) J'ai écrit un jeu d'essai complet et une procédure de sauvegarde et de restauration.**
Le script de seed remplit la base de quatorze animaux et douze dons, dimensionnés à deux pages de
dix, avec les cinq états du cycle de vie présents. Il n'écrit jamais `enclosure.status` : le
décompte affiché vient du déclencheur, et c'est la démonstration. Deux scripts, `backup.sh` et
`restore.sh`, encadrent `pg_dump`. **La restauration a réellement été exécutée** : sauvegarde,
suppression manuelle d'un animal et de son séjour, restauration, l'animal est revenu avec son
séjour. J'ai vérifié ensuite dans le catalogue système que les déclencheurs, les fonctions
stockées et l'index unique étaient revenus eux aussi — une sauvegarde qui restaure les lignes mais
pas le SQL écrit à la main a l'air correcte et ne sert à rien.

**6) J'ai écrit à la main le SQL que l'ORM ne sait pas écrire.**
Prisma couvre le CRUD, les relations et les migrations. Le reste est du SQL écrit à la main **à
l'intérieur de migrations Prisma** : l'index unique partiel, le déclencheur, deux fonctions
stockées — le taux d'occupation du centre et la durée moyenne de séjour — et le verrouillage de
ligne. Ce partage est délibéré : l'ORM pour les 80 % de routine, le SQL là où l'ORM n'est pas le
bon outil.

**7) J'ai traité le conflit d'accès concurrent.**
L'admission est **une transaction** : l'animal et son séjour sont créés ensemble ou pas du tout.
À l'intérieur, un `SELECT … FOR UPDATE` verrouille la ligne de l'enclos : le second soigneur
attend, puis relit « occupé » et reçoit un refus explicite. Le transfert d'un animal ferme un
séjour et en ouvre un autre de façon indivisible. Trois défenses se superposent — la transaction,
le verrou, et l'index unique en dernier recours.

**8) J'ai ajouté la base clé/valeur.**
Redis remplit trois rôles : les **sessions du personnel**, le **cache des enclos libres**, invalidé
à chaque admission, transfert, issue et changement de maintenance, et la **limitation de débit** —
soixante requêtes par minute sur les pages publiques, cinq par heure sur le formulaire de don.

**9) J'ai validé toutes les entrées avant tout accès aux données.**
Chaque règle Zod est écrite en un seul endroit et appliquée comme intergiciel de route, avant que
la moindre requête parte vers la base. Les clés inconnues sont rejetées. Prisma produit des
requêtes paramétrées, et le SQL écrit à la main passe ses identifiants en paramètres : l'injection
SQL est traitée des deux côtés.

**10) J'ai testé ces composants, et j'ai vérifié que les tests servent à quelque chose.**
Trois tests d'intégration couvrent les cas critiques : la course à l'admission, le retour en
arrière d'une admission interrompue, et le refus d'un compte désactivé. **Chacun a été observé en
échec avant d'être conservé**, en cassant le code qu'il protège puis en le restaurant : verrou
supprimé, transaction supprimée, contrôle supprimé. Un test qu'on n'a jamais vu échouer ne prouve
rien.

---

### 2. Précisez les moyens utilisés

- **PostgreSQL 16** comme base relationnelle, en conteneur Docker
- **Redis 7** comme base clé/valeur
- **Prisma** comme ORM — schéma, migrations et CRUD
- **PL/pgSQL** pour le déclencheur et les deux fonctions stockées, écrits dans des migrations
- **Zod** pour la validation de toutes les entrées côté serveur
- **argon2** pour le hachage des mots de passe
- `pg_dump` et `psql`, encadrés par deux scripts shell, pour la sauvegarde et la restauration
- **Adminer** pour inspecter la base, **Vitest** pour les tests

---

### 3. Avec qui avez-vous travaillé ?

> Réponse commune aux six pages, écrite à l'étape 31 du `PLAN.md` et recopiée telle quelle.

*(à recopier depuis l'étape 31)*

---

### 4. Contexte

- **Nom de l'entreprise, organisme ou association :** Centre Khulula — organisme fictif, projet
  personnel réalisé pendant la formation
- **Chantier, atelier, service :** Formation au titre professionnel Concepteur Développeur
  d'Applications
- **Période d'exercice :** du 22/08/2026 au 30/08/2026

---

### 5. Informations complémentaires

**Difficultés rencontrées**

| Difficulté | Diagnostic | Résolution |
|---|---|---|
| 27/08/2026 — En écrivant le test de la course à l'admission, j'ai constaté qu'il **restait vert après avoir supprimé le `SELECT … FOR UPDATE`**. Le test semblait donc ne rien prouver. | Le verrou n'est pas la seule défense. Une fois le verrou retiré, c'est l'index unique partiel qui refuse le second séjour : le résultat visible est identique — un `201` et un `409` — mais il est obtenu par une autre voie. Le test n'était pas faux, il vérifiait le résultat dont le centre a besoin et non lequel des deux mécanismes l'avait produit. | Le constat est écrit dans le fichier de test lui-même, pour qu'il ne se reperde pas. J'ai gardé le test tel quel : c'est le comportement métier qu'il doit garantir. Les deux défenses sont conservées, chacune ayant sa raison — le verrou fait attendre le second soigneur, l'index l'empêche en dernier recours. |

> **Gardé pour l'oral, pas pour le dossier.** Ajouter à `species` une colonne `enclosure_type`
> **obligatoire** alors que la table contenait déjà neuf lignes : une migration générée
> automatiquement échoue, parce qu'une colonne `NOT NULL` ne peut pas être ajoutée à une table
> peuplée sans dire quoi mettre dans les lignes existantes. Migration écrite à la main en trois
> temps — ajouter la colonne facultative, remplir les neuf lignes, puis la rendre obligatoire.
> C'est de là que vient la règle RG17.

---

## Vérification — critères de performance

**CP 7**
- [ ] Le schéma conceptuel respecte les règles du relationnel
- [ ] Le schéma physique est conforme aux besoins exprimés dans le cahier des charges
- [ ] Les règles de nommage ont été respectées
- [ ] L'intégrité, la sécurité et la confidentialité des données sont assurées
- [ ] La base de données de test est créée avec un jeu d'essai complet et peut être restaurée
- [ ] La documentation technique des bases de données est comprise (français ou anglais, B1)

**CP 8**
- [ ] Les traitements répondent aux fonctionnalités décrites dans le dossier de conception
- [ ] Les cas d'exception sont pris en compte
- [ ] L'intégrité et la confidentialité des données sont maintenues
- [ ] Les conflits d'accès aux données sont gérés
- [ ] Toutes les entrées sont contrôlées et validées dans les composants serveurs sécurisés
- [ ] Les tests unitaires et de sécurité sont associés à chaque composant
- [ ] La démarche structurée de résolution de problème est adaptée en cas de dysfonctionnement
- [ ] Le système de veille suit les évolutions et les problématiques de sécurité SQL et NoSQL

## Images de la page

1. Le modèle physique des données — sept tables et leurs relations
2. Les deux admissions concurrentes : un `201` et un `409`, sur le dernier enclos libre
