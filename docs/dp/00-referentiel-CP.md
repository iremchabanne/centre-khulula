# Référentiel — the 11 compétences professionnelles

Source: `Référentiel_Activités_Compétences_Evaluation_TP_CDA.pdf`
REAC, code titre **TP-01281**, millésime **04**, validated **24/05/2023**.

**The French text below is quoted from the official référentiel and must not be translated
or reworded** — the jury grades against exactly these sentences. My own notes are in English
and marked `→`.

**How to use this file:** the *Critères de performance* are the grading checklist. Before we
call any feature "done", check it against the criteria of the CP it is meant to prove.

---

## Activité-type 1 — Développer une application sécurisée

> Le concepteur développeur d'applications développe des interfaces utilisateur sécurisées et
> adaptées aux besoins des clients. Il développe la partie dynamique de l'application avec des
> composants métiers sécurisés. Il contribue également à la gestion du projet informatique.

---

### CP 1 — Installer et configurer son environnement de travail en fonction du projet

**Description**
En tenant compte des projets qui lui seront confiés, installer et configurer sur son poste de
travail tous les outils de développement nécessaires à son environnement de travail, y compris
en anglais. Afin de pouvoir travailler en équipe, installer et utiliser un outil de gestion des
versions et de collaboration. Afin de reconstituer sur son poste de travail un environnement de
développement conforme à l'environnement de production, paramétrer et utiliser des conteneurs
pour implémenter les services requis.

**Critères de performance**
- Les outils de développement nécessaires sont installés
- Les outils de gestion des versions et de collaboration sont installés
- Les conteneurs implémentent les services requis
- La documentation technique de l'environnement de travail est comprise, en langue française ou
  anglaise (niveau B1 CECRL pour l'anglais)

**Savoir-faire techniques (extraits)**
- Mettre en place et utiliser un environnement de développement intégré y compris en anglais
- Mettre en place localement un serveur de données
- Créer des fichiers pour la persistance de données ou pour des échanges entre applications
- Utiliser un outil de gestion de versions
- Paramétrer et utiliser un outil de conteneurisation

> → **Docker is not optional.** "Les conteneurs implémentent les services requis" is a graded
> criterion. We need a `docker-compose.yml` that runs our services.
> → Git + a remote (GitHub) is also graded here, not only in CP 4.

---

### CP 2 — Développer des interfaces utilisateur

**Description**
A partir du dossier de conception, développer les interfaces utilisateur sécurisées en tenant
compte du type d'utilisation de l'application, de la charte graphique et de la règlementation en
vigueur. Documenter le code y compris en anglais. Concevoir un jeu d'essai fonctionnel et
réaliser les tests unitaires des composants. Déterminer une démarche structurée de résolution de
problème en cas de découverte d'un dysfonctionnement lors de l'analyse des résultats des tests
unitaires. Réaliser les tests de sécurité. Réaliser une veille technologique sur les évolutions
techniques des interfaces utilisateur.

**Critères de performance**
- L'interface est conforme au dossier de conception
- L'interface s'adapte au type d'utilisation de l'application et notamment à la taille, au type
  et à la disposition du support
- La charte graphique est respectée
- La règlementation en vigueur est respectée
- Le code est documenté
- Les tests unitaires ont été réalisés pour les composants concernés
- Le jeu d'essai fonctionnel est complet
- Les tests de sécurité sont réalisés
- La documentation technique des interfaces utilisateur est comprise, en langue française ou
  anglaise (niveau B1 CECRL pour l'anglais)
- La démarche structurée de résolution de problème est adaptée en cas de dysfonctionnement
- Le système de veille permet de suivre les évolutions technologiques et les problématiques de
  sécurité en lien avec les interfaces utilisateur

**Savoir-faire techniques (extraits)**
- Coder dans un langage de programmation, en adoptant un style défensif
- Gérer les événements de l'interface utilisateur
- Utiliser un service distant (API REST)
- Adapter l'interface à la taille, au type et à la disposition du support
- Fluidifier l'interface en utilisant des mécanismes asynchrones (AJAX, task, thread…)
- Respecter les normes d'accessibilité requises pour le projet
- Mettre en place en fonction du projet les mentions légales liées au RGPD
- Valider systématiquement les entrées
- Gérer dans leur intégralité les erreurs et les exceptions, pour éviter les vulnérabilités

**Savoirs attendus (extraits)** — XSS, CSRF et leurs parades ; OWASP ; recommandations ANSSI ;
RGAA (accessibilité) ; W3C / DOM / ECMAScript ; formats JSON, XML.

> → **Responsive is graded**, not a bonus.
> → **RGAA accessibility and RGPD legal notices are graded.** We need real mentions légales and
> real accessibility work, not a placeholder.
> → "Veille technologique" is graded in CP 2, 3, 8, 9, 10 and 11. We need a documented watch
> system (sources, tool, rhythm) that we can show.

---

### CP 3 — Développer des composants métier

**Description**
A partir du dossier de conception, développer la partie dynamique de l'application avec des
composants métier sécurisés, dans un style défensif, et éventuellement en asynchrone, en
respectant les bonnes pratiques de la programmation orientée objet et les règles de nommage
décrites dans les normes de qualité de l'entreprise. Documenter le code y compris en langue
anglaise. Vérifier par des tests unitaires que les traitements répondent aux fonctionnalités
décrites dans le dossier de conception. Réaliser les tests de sécurité. Déterminer une démarche
structurée de résolution de problème… Réaliser une veille technologique…

**Critères de performance**
- Les bonnes pratiques de la programmation orientée objet (POO) sont respectées
- Les composants métier sont sécurisés
- Les règles de nommage sont conformes aux normes de qualité de l'entreprise
- Le code source est documenté
- Les traitements répondent aux fonctionnalités décrites dans le dossier de conception
- Les tests unitaires sont réalisés
- Les tests de sécurité sont réalisés
- La démarche structurée de résolution de problème est adaptée en cas de dysfonctionnement
- Le système de veille permet de suivre les évolutions technologiques et les problématiques de
  sécurité en lien avec les composants métier d'une application

**Savoir-faire techniques (extraits)**
- Coder dans un langage orienté objet avec un style défensif
- Gérer la sécurité de l'application (authentification, permissions, validation des entrées…)
  dans la partie serveur
- Utiliser des composants d'accès aux données
- Améliorer à fonctionnalités constantes un code existant (refactoring)
- Réaliser, avec un outil de tests, un jeu de tests unitaires
- Réaliser des tests de sécurité

> → **"Les bonnes pratiques de la POO sont respectées" is an explicit criterion.** With
> Node/Express this needs a deliberate choice — service classes, or at minimum a clearly
> object-oriented business layer we can point to. Worth deciding early.
> → Authentication and permissions belong here.

---

### CP 4 — Contribuer à la gestion d'un projet informatique

**Description**
À partir des objectifs du projet définis en termes de livrables et de la démarche projet,
planifier les tâches de conception et de développement en fonction du délai défini. En effectuant
le suivi des tâches, identifier les retards éventuels et alerter les acteurs concernés. Veiller au
respect des procédures de la démarche qualité. Définir les environnements de développement en
adéquation avec l'architecture du projet. Définir les outils collaboratifs en fonction de la
méthode de développement. Rédiger les comptes rendus de réunion structurés…

**Critères de performance**
- Les tâches de conception et de développement sont planifiées en fonction du délai défini
- Le suivi des tâches est mis en rapprochement avec la planification, les éventuels retards sont
  identifiés et les acteurs concernés sont alertés
- Les procédures qualité sont mises en œuvre
- L'environnement de développement défini est en adéquation avec l'architecture du projet
- Les outils collaboratifs sont choisis en fonction de la méthode de développement
- Les comptes rendus de réunion sont structurés, rédigés dans un style adapté, dans le respect
  des règles orthographiques et grammaticales, et contiennent les informations nécessaires

**Savoir-faire techniques (extraits)**
- Mettre en œuvre les procédures de la démarche qualité
- Utiliser un outil collaboratif de gestion de projet
- Coordonner de façon itérative et en mode collaboratif un projet informatique
- Rédiger les comptes rendus de réunion

> → **This CP is documentation, not code.** It needs artefacts that only exist if we produce
> them as we go: a project board with tickets, a planning with dates, and **comptes rendus de
> réunion**. These cannot be reconstructed at the end — we have to start now.
> → Solo project: "réunion" can be a point d'étape with your formateur/référent. We need to
> decide how to handle this honestly.

---

## Activité-type 2 — Concevoir et développer une application sécurisée organisée en couches

---

### CP 5 — Analyser les besoins et maquetter une application

**Description**
À partir du cahier des charges de la maîtrise d'ouvrage, analyser les besoins, réaliser les
maquettes, y compris en anglais. Modéliser l'application à l'aide d'un schéma présentant
l'enchainement des écrans. Constituer le dossier de conception en suivant une démarche de
conception.

**Critères de performance**
- Les besoins recensés couvrent l'ensemble des exigences utilisateur exprimées dans le cahier
  des charges
- Les maquettes sont réalisées conformément au cahier des charges
- **L'enchainement des maquettes est formalisé par un schéma**
- Le dossier de conception est structuré, en conformité avec la démarche de conception

**Savoir-faire techniques (extraits)**
- Analyser un cahier des charges en identifiant les limites du système, les acteurs et les messages
- Formaliser les besoins utilisateur (use cases, user stories ou autre)
- Utiliser un outil de maquettage
- Construire la maquette de l'application, l'enchaînement et la composition des écrans
- Appliquer la règlementation relative à l'accessibilité (RGAA)

> → We need a real **cahier des charges** before coding. It is the input to CP 5, 6 and 7.
> → Deliverables: cahier des charges, use cases / user stories, maquettes (Figma or similar),
> **a screen-flow diagram**, and a structured **dossier de conception**.

---

### CP 6 — Définir l'architecture logicielle d'une application

**Description**
En tenant compte des besoins des utilisateurs, en amont de tout développement, définir
l'architecture logicielle multicouche répartie en vue du développement d'une application
sécurisée. Définir le rôle de chaque couche en tenant compte de la stratégie de sécurité.
Identifier les besoins d'éco-conception.

**Critères de performance**
- L'architecture logicielle est conforme aux bonnes pratiques d'une architecture multicouche
  répartie sécurisée
- Le rôle de chaque couche est bien défini en tenant compte de la stratégie de sécurité
- **Les besoins d'éco-conception de l'application sont identifiés**

**Savoir-faire techniques (extraits)**
- Définir l'architecture logicielle en identifiant les Framework et ORM à utiliser
- Adapter l'architecture logicielle aux besoins des utilisateurs et à la stratégie de sécurité
  selon les recommandations de l'ANSSI
- Utiliser les patrons de conception (design patterns) et les patrons de sécurité (security patterns)

**Savoirs attendus (extraits)** — architectures multicouches réparties sécurisées y compris
micro-services ; indicateurs **DICP** (disponibilité, intégrité, confidentialité, preuve) ;
formalisme des diagrammes de modélisation ; éco-conception ; SaaS.

> → **Éco-conception is a graded criterion** and is easy to forget. We need a written section
> identifying eco-design needs.
> → We need an architecture document with a diagram and the role of each layer.

---

### CP 7 — Concevoir et mettre en place une base de données relationnelle

**Description**
A partir des besoins exprimés dans le cahier des charges, concevoir le schéma conceptuel des
données en respectant les règles des bases de données relationnelles, les règles de nommage en
vigueur dans l'entreprise et en assurant l'intégrité des données. A partir du schéma conceptuel,
comprendre la documentation technique, y compris en anglais, et mettre en place la base de
données. Définir les utilisateurs et leurs droits d'accès en respectant les règles de sécurité et
de confidentialité définies dans le cahier des charges. Créer un jeu d'essai complet dans une base
de données de test, la sauvegarder afin de pouvoir la restaurer.

**Critères de performance**
- Le schéma conceptuel respecte les règles du relationnel
- Le schéma physique est conforme aux besoins exprimés dans le cahier des charges
- Les règles de nommage ont été respectées
- L'intégrité, la sécurité et la confidentialité des données est assurée
- **La base de données de test est créée avec un jeu d'essai complet et peut être restaurée en
  cas d'incident**
- La documentation technique des bases de données est comprise, en langue française ou anglaise

**Savoir-faire techniques (extraits)**
- Construire le schéma conceptuel / logique / physique des données
- Mettre en œuvre les instructions pour implémenter les contraintes et l'optimisation des accès
- Exprimer les besoins de sécurité du SGBD, de gestion des comptes et de la politique de mots de passe
- Écrire et exécuter un script de création de base de données
- Définir et implémenter un jeu d'essai complet dans la base de tests
- **Mettre en œuvre les utilitaires de sauvegarde et restauration sur le serveur de test**

> → Three schemas are expected: **conceptuel (MCD), logique (MLD), physique (MPD)**.
> → **Backup and restore must actually be demonstrated** (`pg_dump` / `pg_restore`), plus a
> seed script with a complete jeu d'essai. Both are graded criteria.
> → Database users and their access rights are graded — not just one superuser.

---

### CP 8 — Développer des composants d'accès aux données SQL et NoSQL

**Description**
En tenant compte de la structure de la base de données et du dossier de conception, coder les
traitements relatifs aux accès aux données en consultation, modification, création et suppression.
S'assurer que les traitements gèrent l'intégrité et les conflits d'accès aux données, et qu'ils
permettent de respecter la confidentialité, prendre en compte les cas d'exception. Valider et
contrôler les entrées dans les composants serveurs sécurisés avant la mise à jour de la base de
données. Réaliser les tests unitaires et de sécurité.

**Critères de performance**
- Les traitements relatifs aux manipulations des données répondent aux fonctionnalités décrites
  dans le dossier de conception
- Les cas d'exception sont pris en compte
- L'intégrité et la confidentialité des données sont maintenues
- **Les conflits d'accès aux données sont gérés**
- Toutes les entrées sont contrôlées et validées dans les composants serveurs sécurisés
- Les tests unitaires et de sécurité sont associés à chaque composant
- La démarche structurée de résolution de problème est adaptée en cas de dysfonctionnement
- Le système de veille permet de suivre les évolutions technologiques et les problématiques de
  sécurité liées aux bases de données SQL et NoSQL

**Savoir-faire techniques (extraits)**
- Coder de façon sécurisée les accès aux données relationnelles ou non relationnelles en
  consultation, création, mise à jour et suppression
- Inclure dans les composants d'accès l'authentification et la gestion de la sécurité du SGBD
- **Programmer des fonctions, des procédures stockées et des déclencheurs (triggers)** avec le
  langage du SGBD, dans un style défensif, en validant toutes les entrées
- Tester les composants avec une double approche unitaire et sécurité
- **Intégrer les traitements sur les données dans une transaction**

**Savoirs attendus (extraits)** — SQL ; **une méthode d'interaction avec les bases NoSQL
articulées autour d'un format clé/valeur** ; transactions, niveaux d'isolation, verrouillage ;
injection SQL et ses parades ; requêtes paramétrées.

> → **NoSQL is mandatory.** PostgreSQL alone does not satisfy this CP. The référentiel points at
> a **key/value** store, which makes **Redis** the natural and lightest fit — but MongoDB is also
> accepted. This is an open decision.
> → **Stored procedures / functions / triggers in PL/pgSQL are expected**, and so are
> **transactions** and concurrent-access handling. An ORM alone will not cover this.

---

## Activité-type 3 — Préparer le déploiement d'une application sécurisée

---

### CP 9 — Préparer et exécuter les plans de tests d'une application

**Description**
En tenant compte de toutes les fonctionnalités de l'application, préparer un plan de tests
comprenant les tests d'intégration, y compris de non-régression si nécessaire, les tests systèmes
y compris **les tests de sécurité et de charge**. Créer un environnement de tests. Exécuter ou
faire exécuter, sur cet environnement, tous les tests d'intégration et système définis dans le
plan, manuellement ou automatiquement. **Faire réaliser par les utilisateurs de l'application les
tests d'acceptation.** Vérifier que les résultats sont conformes aux résultats attendus.

**Critères de performance**
- Le plan de tests couvre l'ensemble des fonctionnalités retenues pour l'application
- Un environnement de tests est créé
- L'intégralité des tests exécutés sont conformes au plan de tests défini
- Les résultats obtenus sont cohérents avec les résultats attendus
- Le plan de tests tient compte des évolutions technologiques et des problèmes de sécurité liés
  aux tests logiciels

**Savoir-faire techniques (extraits)**
- Rédiger un plan de tests
- Créer un environnement de test
- **Rechercher des failles de sécurité par des tests aléatoires (fuzzing)**
- Exécuter les tests d'intégration en manuel, ou en automatique, y compris de non-régression
- **Exécuter un test de charge**
- Rédiger le dossier de compte rendu de tests

**Savoirs attendus (extraits)** — outils de tests ; typologie des tests **ISTQB / CFTL**.

> → A written **plan de tests** document and a **compte rendu de tests** are expected, not just
> passing test files.
> → **Load testing** (k6, Artillery…) and **fuzzing** are explicitly named. Easy to skip, easy
> for the jury to ask about.
> → **Tests d'acceptation done by users** — for a solo project we need a plan for who plays the
> user role.

---

### CP 10 — Préparer et documenter le déploiement d'une application

**Description**
En tenant compte des dépendances et des versions, définir ou mettre à jour la procédure
d'exécution des tests d'intégration, système et d'acceptation client. Rédiger la procédure de
déploiement. Ecrire et documenter les scripts de déploiement. Définir les environnements de tests
pour les tests d'intégration, système et d'acceptation client.

**Critères de performance**
- La procédure de déploiement est rédigée
- Les scripts de déploiement sont écrits et documentés
- Les environnements de tests sont définis et la procédure d'exécution des tests d'intégration,
  système et d'acceptation client est rédigée
- Le système de veille permet de suivre les évolutions technologiques et les problématiques de
  sécurité liées au déploiement d'une application

**Savoir-faire techniques (extraits)**
- Prendre en compte les dépendances du composant à déployer vis-à-vis des composants externes
- Prendre en compte les évolutions de versions de l'ensemble des composants
- Rédiger une procédure de déploiement
- **Préparer des scripts d'évolution (de bases de données, de tâches planifiées, …)**

**Savoirs attendus** — environnements **SIT** (test), **UAT** (acceptation client) et
**production** ; types de mise en production (totale, partielle, progressive…) ; rôle de
l'infrastructure et des réseaux TCP-IP.

> → The three environment types **SIT / UAT / production** are named explicitly. Our
> documentation should use that vocabulary.
> → **Database migration scripts** count as "scripts d'évolution" here.

---

### CP 11 — Contribuer à la mise en production dans une démarche DevOps

**Description**
Dans le cadre d'une démarche DevOps, utiliser un environnement collaboratif et des conteneurs afin
d'automatiser l'intégration continue du code, ainsi que les tests d'intégration et système.
**Utiliser un outil pour vérifier la qualité du code.** Automatiser les tests avec des logiciels
d'automatisation de tests. Créer un script d'intégration comprenant l'infrastructure utilisée, les
tests automatisés et la création du livrable. Paramétrer la création du livrable et les tests dans
un serveur d'automatisation. Interpréter les rapports des utilitaires de qualité de code et des
tests, y compris en anglais.

**Critères de performance**
- Les outils de qualité de code sont utilisés
- Les outils d'automatisation de tests sont utilisés
- Les scripts d'intégration continue s'exécutent sans erreur
- Le serveur d'automatisation est paramétré pour les livrables et les tests
- **Les rapports de l'Intégration Continue sont interprétés**
- La documentation technique des différents outils est comprise, en langue française ou anglaise
- La démarche structurée de résolution de problème est adaptée en cas de dysfonctionnement
- Le système de veille permet de suivre les évolutions technologiques et les problématiques de
  sécurité liées à la démarche DevOps

**Savoir-faire techniques (extraits)**
- Savoir utiliser un gestionnaire de conteneurs
- Savoir gérer des stacks de conteneurs (avec un outil de type docker compose)
- Savoir utiliser les outils collaboratifs de développement logiciel et de versionning de type git server
- Savoir coder et exécuter les tests en automatique dans le cadre d'un processus d'Intégration Continue
- **Savoir créer un script d'intégration continue (de type Yaml)**
- Savoir paramétrer les livrables et les tests d'une application dans un serveur d'automatisation
- Savoir interpréter les rapports issus de l'Intégration Continue

**Savoirs attendus** — connectivité TCP-IP ; démarche DevOps ; **bases de Linux**.

> → GitHub Actions covers "serveur d'automatisation" + "script Yaml".
> → **A code-quality tool is a separate graded criterion** from linting — SonarQube / SonarCloud
> is the usual answer. ESLint alone is thin.
> → "Les rapports sont interprétés" means we must *write down our reading* of the reports, not
> just have them exist.

---

## Compétences transversales (graded across the whole dossier)

- Communiquer en français et en anglais
- Mettre en œuvre une démarche de résolution de problème
- Apprendre en continu

> → English is required throughout: **B1** for written expression, written comprehension and oral
> comprehension; **A2** for oral expression. This is why we document the code in English.
> → "Démarche de résolution de problème" appears in CP 2, 3, 8 and 11. This is why every prep
> file has a *Difficultés rencontrées* table — it is the evidence for this transversal competence.

---

## Cross-cutting things that are graded and easy to miss

| Requirement | Appears in | Status |
|---|---|---|
| Docker / conteneurs | CP 1, CP 11 | to do |
| Git + remote + collaborative tooling | CP 1, CP 4, CP 11 | to do |
| Veille technologique, documented | CP 2, 3, 8, 9, 10, 11 | to do |
| Sécurité (OWASP, ANSSI, XSS, CSRF, injection SQL) | CP 2, 3, 6, 7, 8, 9 | to do |
| Accessibilité RGAA | CP 2, CP 5 | to do |
| RGPD / mentions légales | CP 2, CP 5, CP 7 | to do |
| Éco-conception | CP 6 | to do |
| Code and documentation in English | transversal | to do |
| NoSQL (key/value) | CP 8 | **undecided** |
| Stored procedures / triggers / transactions | CP 8 | to do |
| Backup & restore demonstrated | CP 7 | to do |
| Load test + fuzzing | CP 9 | to do |
| Code-quality tool (e.g. SonarCloud) | CP 11 | to do |
| Comptes rendus de réunion | CP 4 | to do |
