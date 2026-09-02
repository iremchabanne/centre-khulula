# AT 3 — Exemple 2 · CP 10 + CP 11

**CP 10** — Préparer et documenter le déploiement d'une application
**CP 11** — Contribuer à la mise en production dans une démarche DevOps

---

### Intitulé de l'exemple

**Préparer le déploiement du centre Khulula et automatiser son intégration**

---

### 1. Décrivez les tâches ou opérations que vous avez effectuées, et dans quelles conditions

J'ai préparé la mise en production de l'application : une procédure écrite, des images de
production, et une chaîne d'intégration continue qui vérifie chaque poussée. Aucune machine n'a été
louée et aucune console d'hébergeur n'a été ouverte — la compétence demande une **procédure
documentée et des scripts**, pas un serveur en ligne, et cette limite est écrite dans le document.

**1) J'ai séparé l'environnement de développement de l'environnement de production.**
Deux fichiers Compose. En développement, cinq services, le code monté depuis la machine, cinq ports
ouverts et Adminer pour inspecter la base. En production, quatre services, **le port 80 comme seul
port publié**, aucun volume monté et pas d'Adminer : le code est copié dans l'image, et la surface
exposée est réduite au strict nécessaire.

**2) J'ai écrit les images de production.**
`api/Dockerfile.prod` installe les dépendances sans les outils de développement, applique les
migrations et démarre le serveur. `client/Dockerfile.prod` est construit **en deux étapes** : la
première compile le site, la seconde ne garde que les fichiers produits et les sert avec nginx.
nginx renvoie également `/api` vers l'API, de sorte que le navigateur ne voit qu'une seule origine
et qu'aucune configuration CORS n'est nécessaire. **Les deux images ont réellement été
construites**, pas seulement écrites.

**3) J'ai rédigé la procédure de déploiement.**
Le document donne les deux environnements, la suite exacte des commandes pour déployer, la
procédure de mise à jour, le rôle de chaque image et l'endroit où s'exécute chaque catégorie de
tests. Un point mérite d'être signalé : la migration crée le compte applicatif **sans mot de
passe**, et la procédure demande d'en générer un et de le fournir séparément — un secret n'entre
pas dans un fichier versionné.

**4) J'ai pris en compte les dépendances et les versions.**
Les images de base sont épinglées — PostgreSQL 16, Redis 7, en variantes Alpine. Les migrations de
base de données sont les scripts d'évolution : elles sont versionnées, ordonnées, et appliquées au
démarrage du conteneur d'API. Le document dit aussi ce qui est **hors périmètre** : HTTPS, nom de
domaine, sauvegarde automatique et supervision.

**5) J'ai défini où chaque catégorie de tests s'exécute.**
Les tests unitaires et d'intégration se lancent depuis le dossier de l'API ; les tests unitaires
sont rejoués automatiquement à chaque poussée ; la qualité de code et le typage ont leurs deux
commandes ; la charge et le fuzzing ont leurs deux outils ; la recette fonctionnelle se déroule à
la main sur les dix-huit besoins. L'environnement de développement joue ici le rôle des
environnements d'intégration et d'acceptation : le projet étant mené seul, il n'y avait pas lieu
d'en monter trois, et ce choix est écrit.

**6) J'ai mis en place un outil de qualité de code.**
ESLint, avec les deux jeux de règles recommandés et **une seule règle ajustée** : un paramètre
nommé avec un tiret bas initial n'est pas signalé comme inutilisé, parce qu'Express reconnaît un
gestionnaire d'erreurs à ses quatre paramètres et que le quatrième doit être déclaré sans être
appelé. C'est précisément ce que la première exécution avait signalé. SonarCloud était l'autre
candidat : il demande un compte, une organisation, un jeton et une intégration avant d'afficher
quoi que ce soit, alors qu'ESLint s'exécute hors ligne et produit un rapport lisible sans tableau
de bord.

**7) J'ai créé un script d'intégration continue.**
Un fichier YAML pour GitHub Actions, une tâche, exécutée à chaque poussée et à chaque demande de
fusion vers la branche principale : installation, génération des types Prisma, analyse ESLint,
vérification des types, tests unitaires. Vert depuis sa mise en place.

**8) J'ai interprété les rapports produits.**
L'intégration continue a échoué à son premier passage : le fichier d'environnement de l'API n'étant
pas versionné, la génération des types et les tests n'avaient rien à lire. Deux variables
d'exemple placées dans le workflow ont réglé le problème. Sur ma machine le fichier existe et le
défaut est invisible — c'est exactement ce à quoi sert une intégration continue, et j'ai gardé
l'épisode comme démonstration. J'ai également lu et arbitré un rapport d'audit de dépendances :
trois vulnérabilités de gravité haute, toutes situées dans une dépendance interne de Prisma, dont
le seul correctif proposé est un retour en arrière incompatible. Le risque est consigné et la
correction attend, plutôt que d'être appliquée sans être comprise.

**9) J'ai fait un choix de version documenté.**
L'API tourne sur la version majeure précédente de TypeScript, et non sur la dernière : l'outil
d'analyse ESLint refuse de démarrer sur la plus récente, parue depuis peu. La version retenue a
quatre mois et est prise en charge partout ; la vérification des types et les tests passent sans
modification après le changement. La décision est écrite dans le journal de veille technologique.

---

### 2. Précisez les moyens utilisés

- **Docker** et **Docker Compose**, deux fichiers, un par environnement
- **nginx** pour servir le site construit et relayer `/api` en production
- **GitHub Actions** comme serveur d'automatisation, un script YAML
- **ESLint** comme outil de qualité de code, **Vitest** comme outil d'automatisation des tests
- Le compilateur **TypeScript** pour la vérification des types
- Les **migrations Prisma** comme scripts d'évolution de la base
- `npm audit` pour l'audit des dépendances
- Le document `deploiement.md`, versionné, comme procédure de déploiement

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
- **Période d'exercice :** du 27/08/2026 au 01/09/2026

---

### 5. Informations complémentaires

**Difficultés rencontrées**

| Difficulté | Diagnostic | Résolution |
|---|---|---|
| 27/08/2026 — L'intégration continue a échoué dès son premier passage, alors que tout fonctionnait sur ma machine. | Le fichier d'environnement de l'API n'est pas versionné, et c'est voulu : il contient des secrets. Mais la génération des types Prisma et l'exécution des tests le lisent. Sur la machine d'intégration, qui part d'un dépôt propre, ces deux étapes n'avaient rien à lire. Le défaut n'était pas dans le code mais dans l'écart entre ma machine et un poste vierge. | Deux variables d'exemple sont déclarées dans le fichier de workflow, suffisantes pour ces deux étapes et sans valeur secrète. Je n'ai pas versionné le fichier réel. L'épisode est conservé comme démonstration de l'utilité de l'intégration continue. |

> **Gardé pour l'oral, pas pour le dossier.** L'outil d'analyse de code refusait de démarrer : la
> dernière version majeure de TypeScript venait de paraître et l'analyseur ne la gérait pas encore.
> Retour à la version majeure précédente, âgée de quatre mois et prise en charge partout ; les
> types et les tests passent sans modification. La décision est écrite dans le journal de veille.

---

## Vérification — critères de performance

**CP 10**
- [ ] La procédure de déploiement est rédigée
- [ ] Les scripts de déploiement sont écrits et documentés
- [ ] Les environnements de tests sont définis et la procédure d'exécution des tests
      d'intégration, système et d'acceptation client est rédigée
- [ ] Le système de veille suit les évolutions et les problématiques de sécurité liées au
      déploiement

**CP 11**
- [ ] Les outils de qualité de code sont utilisés
- [ ] Les outils d'automatisation de tests sont utilisés
- [ ] Les scripts d'intégration continue s'exécutent sans erreur
- [ ] Le serveur d'automatisation est paramétré pour les livrables et les tests
- [ ] Les rapports de l'intégration continue sont interprétés
- [ ] La documentation technique des différents outils est comprise (français ou anglais, B1)
- [ ] La démarche structurée de résolution de problème est adaptée en cas de dysfonctionnement
- [ ] Le système de veille suit les évolutions et les problématiques de sécurité liées au DevOps

## Images de la page

1. `docker-compose.prod.yml` — aucun volume monté, le port 80 comme seul port publié
2. Un écran de la procédure de déploiement
