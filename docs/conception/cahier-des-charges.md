# Cahier des charges — Centre Khulula

| | |
|---|---|
| **Projet** | Application de gestion d'un centre de réhabilitation de la faune sauvage |
| **Maître d'ouvrage** | Centre Khulula (organisme fictif) |
| **Maître d'œuvre** | *(votre nom)* |
| **Version** | 1.6 — 28 août 2026 |
| **Statut** | Brouillon, à valider |

---

## 1. Présentation du projet

### 1.1 Contexte

Le Centre Khulula est un centre de réhabilitation de la faune sauvage situé dans le **Limpopo**,
en Afrique du Sud. *Khulula* signifie « libérer » en isiZulu, ce qui résume sa mission : recueillir
des animaux sauvages blessés ou orphelins, les soigner, puis les relâcher.

Le centre dispose d'un **nombre limité d'enclos**, et chaque animal admis en occupe un pendant
toute la durée de ses soins. Cette contrainte matérielle est au cœur du fonctionnement du centre.

### 1.1.1 Espèces accueillies — un périmètre borné, et pourquoi

Le centre accueille **la petite et moyenne faune indigène du Limpopo**, et rien d'autre. Deux
bornes, chacune pour une raison :

- **Géographique.** Une espèce qui ne vit pas dans la région ne peut pas y être trouvée blessée,
  ni y être relâchée. Un manchot du Cap n'a rien à faire dans un centre du Limpopo.
- **De taille.** Éléphants et rhinocéros exigent des installations, un personnel et des protocoles
  sans rapport avec ceux d'un centre de cette taille. Le modèle suivi est celui du *Johannesburg
  Wildlife Veterinary Hospital*, qui se limite explicitement à la petite et moyenne faune indigène.

Le référentiel compte donc **9 espèces**, liste fermée alimentée par le script d'initialisation
(§2.2). Carnivores, herbivores, oiseaux et reptiles y coexistent : c'est le cas de tous les centres
réels, puisque chaque animal occupe un enclos séparé, adapté à son type.

**L'identité du centre est assumée : les espèces dont personne ne fait campagne.** Le pangolin de
Temminck, mammifère le plus trafiqué au monde, dont le Limpopo est la première province de saisie ;
les vautours du Cap, dont la colonie du Blouberg — la plus grande d'Afrique du Sud — se trouve dans
la province ; le calao terrestre, la tortue léopard, la mangouste rayée. Aucun rhinocéros : ils sont
déjà l'objet de centres spécialisés, et le besoin est ailleurs.

Le suivi est aujourd'hui tenu sur un classeur papier et un tableur partagé, ce qui pose trois
problèmes :

- **Fiabilité de l'occupation.** Deux soigneurs peuvent croire au même moment qu'un enclos est
  libre et y affecter deux animaux.
- **Perte d'historique.** Durée de séjour, motif d'admission et issue des soins ne sont pas
  exploitables statistiquement.
- **Absence de visibilité publique.** Le centre vit de dons mais ne peut pas montrer son travail.

### 1.2 Objectif

Développer une application web permettant :

- au personnel de gérer les admissions, le suivi des soins et les sorties, en garantissant qu'un
  enclos n'accueille jamais deux animaux simultanément ;
- au public de consulter le travail du centre et de le soutenir par un don.

### 1.3 Nature du projet

Projet réalisé dans le cadre du titre professionnel « Concepteur Développeur d'Applications »
(niveau 6). L'organisme, les animaux et les données sont fictifs.

---

## 2. Périmètre

### 2.1 Dans le périmètre

- Gestion des enclos et de leur disponibilité
- Admission d'un animal et affectation à un enclos
- Suivi du cycle de vie de l'animal jusqu'à sa sortie
- Déplacement d'un animal d'un enclos à un autre
- Consultation publique des fiches espèces et des animaux pris en charge
- Enregistrement d'un don anonyme
- Authentification du personnel et gestion des droits

### 2.2 Hors périmètre — décisions explicites

Chaque exclusion est une décision assumée, prise pour éviter une complexité qui ne sert aucun
besoin exprimé.

| Exclusion | Justification |
|---|---|
| **Paiement en ligne réel** | Un don enregistre une **intention** (montant, donateur, date, message). Aucun prestataire de paiement, aucun champ de carte. L'encaissement est traité hors application. Évite les exigences PCI-DSS, sans rapport avec le besoin. |
| **Cartographie et géolocalisation** | Les zones d'origine sont un libellé textuel. Aucune coordonnée GPS. |
| **Téléversement de fichiers** | Les photos sont référencées par une URL vers une image fournie avec l'application. Supprime une surface d'attaque importante. |
| **Comptes donateurs** | Le don est anonyme et ne nécessite aucune inscription — principe de minimisation du RGPD. |
| **Envoi d'e-mails** | Aucune notification, aucune réinitialisation par e-mail. Les administrateurs créent les comptes et réinitialisent les mots de passe (§3.2). |
| **Écran de gestion des espèces** | Le référentiel des espèces est une **donnée de référence** : le statut de conservation est fixé par l'**UICN**, autorité extérieure, pour tout le secteur. Il est donc alimenté par le script d'initialisation et modifié par **migration versionnée**. Un écran de saisie permettrait à un utilisateur de désynchroniser silencieusement le centre de la classification officielle. |
| **Inscription publique** | Un compte ne peut naître que de la main d'un administrateur : la surface d'attaque de l'authentification se limite au formulaire de connexion. |
| **Dossier médical détaillé** | Statut et observations libres seulement. Aucune prescription, aucune posologie. |
| **Application mobile native** | L'interface web est responsive. |
| **Multilingue** | Interface en anglais uniquement. |

---

## 3. Acteurs et rôles

Les droits se lisent sur **deux axes indépendants** : l'axe **métier** (soigneur ou vétérinaire)
et l'axe **administration** (la capacité à gérer l'outil). Un même agent peut porter les deux.

### 3.1 Acteurs

| Acteur | Compte | Description |
|---|---|---|
| **Visiteur** | Non | Grand public. Consulte les pages publiques, peut faire un don. |
| **Soigneur** | Oui | Admet les animaux, met à jour leur suivi, les déplace d'un enclos à l'autre. |
| **Vétérinaire** | Oui | Tous les droits du soigneur, et **seul habilité à prononcer la sortie** d'un animal. |

### 3.2 Le droit d'administration

Créer un compte, ouvrir un enclos ou consulter les dons ne sont **pas des actes de soin**. Ces
actions sont donc portées par un attribut du compte distinct du rôle : `is_admin`.

| | |
|---|---|
| **Porteurs** | Exactement **deux comptes** : le vétérinaire référent et le soigneur référent. |
| **Origine** | Créés par le script d'initialisation. Aucun écran ne les crée. |
| **Non transmissible** | Le formulaire de création de compte n'expose pas cet attribut. |
| **Périmètre** | Comptes du personnel, parc d'enclos, liste des dons. |

**Pourquoi pas un quatrième rôle « administrateur ».** Le centre compte moins de dix agents. Un
rôle dédié imposerait soit un compte qui n'exerce aucun soin, soit un rôle cumulant tous les
droits — le défaut même que le contrôle d'accès doit prévenir.

**Pourquoi le vétérinaire ne gère pas les enclos.** Affecter un animal à un enclos relève du soin
quotidien (S3, S6). Mais construire un enclos ou le mettre en maintenance relève de la gestion des
installations, pas de la médecine : c'est donc l'axe administration (A2).

### 3.3 Matrice des droits — axe métier

| Action | Visiteur | Soigneur | Vétérinaire |
|---|:---:|:---:|:---:|
| Consulter les pages publiques et les fiches espèces | ✔ | ✔ | ✔ |
| Enregistrer un don | ✔ | ✔ | ✔ |
| Se connecter, se déconnecter | — | ✔ | ✔ |
| Consulter les animaux et l'occupation des enclos | — | ✔ | ✔ |
| Admettre un animal | — | ✔ | ✔ |
| Passer le statut à « en soins » ou « en convalescence » | — | ✔ | ✔ |
| Ajouter une observation | — | ✔ | ✔ |
| Déplacer un animal vers un autre enclos libre | — | ✔ | ✔ |
| Prononcer la sortie (relâché / décédé) | — | — | ✔ |

Les fiches espèces sont **publiques** et modifiables par aucun compte (§2.2). Le vétérinaire se
distingue donc du soigneur par **une seule action, mais la plus lourde de conséquences** :
prononcer la sortie, décision terminale et irréversible (RG5).

### 3.4 Matrice des droits — axe administration

Ces droits s'ajoutent à ceux du rôle.

| Action | Compte ordinaire | Compte administrateur |
|---|:---:|:---:|
| Créer un compte du personnel | — | ✔ |
| Désactiver ou réactiver un compte | — | ✔ |
| Réinitialiser un mot de passe | — | ✔ |
| Créer un enclos, le mettre en maintenance | — | ✔ |
| Consulter la liste des dons | — | ✔ |

**Le contrôle est toujours vérifié côté serveur.** Masquer un bouton est un confort d'usage, jamais
une mesure de sécurité : la route refuse elle-même l'appel. C'est la faille **OWASP A01 — *Broken
Access Control***, la plus répandue des applications web.

Les dons ne sont visibles d'aucun compte ordinaire : ils portent le nom et l'e-mail facultatifs du
donateur, et la **minimisation** RGPD veut que seuls les agents qui en ont l'usage y accèdent.

---

## 4. Besoins fonctionnels

### 4.1 Visiteur

| Réf. | Besoin |
|---|---|
| **V1** | Consulter la présentation du centre et sa mission, afin de comprendre son action. |
| **V2** | Consulter les fiches des espèces prises en charge, afin d'en apprendre davantage sur la faune locale. |
| **V3** | Voir les animaux actuellement soignés, afin de suivre l'activité du centre. |
| **V4** | Voir les derniers animaux relâchés, afin de constater les réussites du centre. |
| **V5** | Faire un don en indiquant un montant et, si je le souhaite, mon nom et un message. |
| **V6** | Consulter les mentions légales et la politique de confidentialité. |

V3 et V4 sont servis par un **écran unique** doté d'un filtre sur `animal.status` : même liste,
même requête, seul le filtre change. Le statut `deceased` n'est jamais exposé publiquement.

### 4.2 Soigneur

| Réf. | Besoin |
|---|---|
| **S1** | Me connecter et me déconnecter, afin d'accéder à l'espace du personnel et de laisser mon poste sans risque. |
| **S2** | Voir l'occupation des enclos en temps réel, afin de savoir si le centre peut accueillir un animal. |
| **S3** | Admettre un animal en renseignant son espèce, son motif d'admission et son enclos. |
| **S4** | Être empêché d'affecter un animal à un enclos déjà occupé. |
| **S5** | Mettre à jour le statut d'un animal et ajouter une observation, afin de tracer l'évolution de ses soins. |
| **S6** | Déplacer un animal vers un autre enclos libre, afin d'adapter son hébergement à son état. |
| **S7** | Consulter l'historique complet d'un animal. |

### 4.3 Vétérinaire

| Réf. | Besoin |
|---|---|
| **T1** | Prononcer la sortie d'un animal (relâché ou décédé), afin de clore sa prise en charge et libérer son enclos. |
| **T4** | Consulter le taux d'occupation et la durée moyenne de séjour, afin de piloter l'activité. |

**T2 a été supprimé** : le référentiel des espèces est une donnée de référence alimentée par
migration, non une donnée saisie par le centre (§2.2).

Le tableau de bord qui porte T4 est visible de tout le personnel : ces indicateurs ne sont pas
sensibles, et le soigneur en a besoin pour S2.

### 4.4 Administrateur

Besoins portés par les deux comptes administrateurs (§3.2), quel que soit leur rôle métier.

| Réf. | Besoin |
|---|---|
| **A1** | Créer un compte du personnel, le désactiver et réinitialiser son mot de passe, sans passer par un envoi d'e-mail. |
| **A2** | Créer un enclos et le mettre en maintenance, afin que l'application reflète la capacité réelle du centre. C'est un **onglet réservé** de l'écran d'occupation, pas un écran distinct. |
| **A3** | Consulter la liste des dons reçus, afin d'en assurer le suivi. |

---

## 5. Règles de gestion

| Réf. | Règle |
|---|---|
| **RG1** | Un enclos ne peut héberger qu'**un seul animal à la fois**. |
| **RG2** | L'admission est **impossible** s'il n'existe aucun enclos libre. |
| **RG3** | Le statut d'un enclos (`free`, `occupied`, `maintenance`) est **déduit automatiquement** des séjours en cours. Il n'est jamais saisi à la main. |
| **RG4** | Le cycle de vie d'un animal suit l'ordre : `admitted` → `in_care` → `recovering` → `released` ou `deceased`. |
| **RG5** | `released` et `deceased` sont **terminaux**. Un animal sorti ne revient pas à un statut antérieur. |
| **RG6** | Le passage à `released` ou `deceased` est réservé au **vétérinaire**. |
| **RG7** | La sortie d'un animal **libère automatiquement** son enclos. |
| **RG8** | Le déplacement clôt le séjour en cours et en ouvre un nouveau. Les deux opérations sont **indissociables**. |
| **RG9** | Le montant d'un don est strictement supérieur à 0 et inférieur ou égal à 10 000. |
| **RG10** | Un don peut être totalement anonyme : nom et e-mail sont facultatifs. |
| **RG11** | Les pages publiques n'exposent **aucune donnée nominative** du personnel ni aucun don identifiable. |
| **RG12** | Un compte désactivé ne peut plus se connecter, mais son historique d'actions est conservé. |
| **RG13** | Le droit d'administration n'est **jamais accordé depuis l'application**. Tout compte créé depuis l'interface est ordinaire. |
| **RG14** | Un administrateur ne peut ni désactiver son propre compte, ni désactiver le **dernier administrateur actif** — sinon plus aucun compte ne pourrait être créé. |
| **RG15** | Un mot de passe oublié est réinitialisé par un administrateur. Aucune procédure par e-mail. |
| **RG16** | Un enclos ne passe en `maintenance` que s'il est **libre**. |

---

## 6. Besoins non fonctionnels

### 6.1 Sécurité

- Mots de passe hachés avec argon2, jamais en clair.
- Validation systématique et centralisée de **toutes** les entrées côté serveur, avant tout accès
  à la base.
- Requêtes paramétrées exclusivement, pour prévenir les injections SQL.
- Droits vérifiés **côté serveur** pour chaque route protégée, jamais uniquement dans l'interface.
- Protection contre XSS et CSRF.
- *Rate limiting* sur les pages publiques et le formulaire de don.
- Gestion complète des erreurs ; aucun message technique renvoyé au client.
- **Deux comptes distincts sur le SGBD** : un compte applicatif aux droits restreints, un compte
  d'administration.
- Référentiels suivis : **OWASP Top 10** et recommandations de l'**ANSSI**.

### 6.2 Accessibilité (RGAA)

- HTML sémantique, hiérarchie de titres cohérente.
- Navigation complète au clavier.
- Contrastes conformes au niveau AA.
- Alternatives textuelles sur toutes les images.
- Étiquettes explicites et messages d'erreur associés à leur champ.

### 6.3 Protection des données (RGPD)

- **Minimisation** : le don est anonyme par défaut.
- **Base légale** : consentement explicite pour les coordonnées facultatives du donateur.
- **Durée de conservation** définie et documentée.
- **Droits des personnes** : procédure de suppression sur demande, documentée.
- Mentions légales et politique de confidentialité accessibles depuis toutes les pages.

### 6.4 Éco-conception

- Images compressées et dimensionnées pour leur usage réel.
- **Pagination systématique** : la clause `LIMIT` est appliquée côté serveur sur les listes qui
  s'allongent avec le temps — espèces, animaux (public et personnel), dons, comptes du personnel.
  Y compris celles qui tiennent aujourd'hui sur une page : c'est la requête sans borne qui pose
  problème, pas la liste courte. Le contrôle n'est affiché qu'au-delà d'une page.
  **L'inventaire des enclos fait exception et n'est pas paginé** : son volume est borné par le
  centre lui-même, et l'écran *Overview* les montre tous ensemble.
- Recherche par nom sur les deux listes où l'on cherche un élément précis : animaux (écran 9) et
  comptes du personnel (écran 12).
- Mise en cache des données peu variables (enclos disponibles, fiches espèces).
- Nombre de dépendances volontairement réduit ; aucune animation lourde.

### 6.5 Performance

- Temps de réponse des pages publiques inférieur à 500 ms en conditions nominales.
- Comportement vérifié sous charge sur les pages publiques et le formulaire de don.

### 6.6 Compatibilité

- Interface **responsive** : mobile, tablette, poste fixe.
- Navigateurs récents (deux dernières versions majeures).

---

## 7. Contraintes techniques

| Élément | Choix |
|---|---|
| Langage | TypeScript, côté serveur et côté interface |
| Interface | React |
| Styles | Tailwind |
| Serveur applicatif | Node.js + Express, architecture en couches |
| ORM | Prisma |
| Validation des entrées | Zod |
| Base de données relationnelle | PostgreSQL |
| Base clé/valeur | Redis (sessions, cache, rate limiting) |
| Conteneurisation | Docker Compose |
| Gestion de versions | Git + GitHub |
| Langue du code, de la base et de l'interface | Anglais |
| Langue des documents projet | Français |

---

## 8. Livrables attendus

1. Dossier de conception (analyse des besoins, maquettes, enchaînement des écrans)
2. Dossier d'architecture logicielle
3. Schémas de données conceptuel, logique et physique
4. Code source de l'application, versionné
5. Jeu d'essai et scripts de sauvegarde / restauration
6. Plan de tests et compte rendu d'exécution
7. Procédure de déploiement et scripts documentés
8. Chaîne d'intégration continue

---

## 9. Planning

Voir `PLAN.md`. Échéance de rédaction du dossier professionnel : **31 août 2026**.
