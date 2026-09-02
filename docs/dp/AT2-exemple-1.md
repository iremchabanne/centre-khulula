# AT 2 — Exemple 1 · CP 5 + CP 6

**CP 5** — Analyser les besoins et maquetter une application
**CP 6** — Définir l'architecture logicielle d'une application

---

### Intitulé de l'exemple

**Analyser les besoins du centre Khulula et définir l'architecture de l'application**

---

### 1. Décrivez les tâches ou opérations que vous avez effectuées, et dans quelles conditions

Avant tout développement, j'ai analysé le besoin, maquetté les écrans et défini l'architecture
logicielle. La maîtrise d'ouvrage étant fictive, j'ai tenu moi-même le rôle du client : j'ai écrit
le cahier des charges, puis je l'ai relu en me demandant ce qu'un responsable de centre en
attendrait réellement. Le dossier le dit explicitement, ce n'est pas une omission.

**1) J'ai délimité le système et identifié les acteurs.**
Le centre recueille des animaux sauvages blessés, les soigne dans un **nombre limité d'enclos**,
puis les relâche. Cette rareté est la contrainte qui structure toute l'application. Trois acteurs :
le visiteur, sans compte ni authentification ; le soigneur ; le vétérinaire. À cela s'ajoute un
second axe, indépendant du métier : le droit d'administration de l'outil, porté par un booléen et
non par un rôle.

**2) J'ai recensé dix-huit besoins utilisateur, classés par acteur.**
Chacun est écrit du point de vue de celui qui l'exprime et chacun est vérifiable. Ils sont
regroupés dans `cahier-des-charges.md` §4, et c'est cette liste qui a servi de recette
fonctionnelle à la fin du projet.

**3) J'ai écrit les règles de gestion.**
Dix-sept règles numérotées RG1 à RG17, qui disent ce que l'application doit refuser. Par exemple :
un enclos ne peut héberger qu'un séjour ouvert à la fois ; l'issue d'un animal est réservée au
vétérinaire et elle est définitive ; un animal n'occupe qu'un enclos du type que son espèce exige.
Ces règles sont la charnière du projet — elles viennent du besoin et elles se retrouvent une à une
dans la base et dans le code.

**4) J'ai borné le périmètre par des exclusions écrites.**
Trois décisions sont documentées comme exclusions plutôt que subies : **aucun paiement réel** — un
don enregistre une intention, sans aucun champ bancaire ; **aucun écran de gestion des espèces**,
donnée de référence alimentée par migration versionnée ; **aucun téléversement de fichier**, ce qui
supprime une surface d'attaque importante. Chaque exclusion est accompagnée de sa raison, pour
pouvoir la défendre.

**5) J'ai maquetté les écrans et formalisé leur enchaînement par un schéma.**
Treize écrans — six publics, sept réservés au personnel — ramenés à treize depuis une première
liste de vingt. Le document `arborescence-ecrans.md` contient les écrans, les six boîtes de
dialogue, quatre diagrammes d'enchaînement et le cycle de vie de l'animal. Un prototype HTML
cliquable complète les maquettes et permet de parcourir l'application avant qu'elle existe.

**6) J'ai défini une charte graphique mesurée, pas seulement choisie.**
Palette, typographie et échelle de tailles, avec le **contraste mesuré** pour chaque couple de
couleurs, parce que le RGAA impose un rapport minimum. Une couleur non mesurée n'entre pas dans la
charte.

**7) J'ai défini une architecture logicielle multicouche.**
Quatre couches côté serveur, chacune avec un rôle unique : les **routes** déclarent les adresses et
enchaînent les intergiciels ; les **contrôleurs** lisent la requête et écrivent la réponse ; les
**services** portent les règles métier ; **Prisma** accède aux données. Aucune logique métier dans
une route. Le client React est une couche de présentation séparée, qui ne parle au serveur que par
l'API REST.

**8) J'ai défini le rôle de chaque couche en fonction de la stratégie de sécurité.**
La sécurité n'est pas répartie au hasard : la validation des entrées est faite en une seule fois,
en entrée de route, par Zod, avant tout accès aux données ; l'authentification et le contrôle
d'accès sont trois intergiciels, appliqués au même endroit ; les règles métier qui protègent
l'intégrité vivent dans les services ; les garanties de dernier recours — contrainte d'unicité,
déclencheur — vivent dans la base. Un refus vient toujours du serveur : masquer un lien est un
confort, jamais une sécurité.

**9) J'ai identifié les besoins d'éco-conception.**
Pagination systématique côté serveur sur toutes les listes qui s'allongent avec le temps, y compris
celles qui tiennent aujourd'hui sur une page — c'est la requête sans borne qui pose problème, pas
la liste courte. L'inventaire des enclos fait exception, son volume étant borné par le centre
lui-même. S'y ajoutent la mise en cache des données peu variables, des images compressées et
dimensionnées pour leur usage réel, un nombre de dépendances volontairement réduit et aucune
animation lourde.

**10) J'ai réuni tout cela dans un dossier de conception structuré.**
Démarche de conception, analyse des besoins, maquettes, enchaînement des écrans, modèle de données,
traçabilité besoin → règle → écran, et un dernier chapitre sur ce que la conception a délibérément
exclu.

---

### 2. Précisez les moyens utilisés

> À compléter par Irem : l'outil de maquettage (Figma) et l'outil de diagrammes.

- Un outil de maquettage pour les écrans, et un prototype HTML cliquable pour l'enchaînement
- Markdown versionné dans le dépôt Git pour l'ensemble des documents de conception
- Le référentiel **RGAA** pour l'accessibilité et un vérificateur de contraste pour la charte
- Les recommandations **OWASP** comme cadre de la stratégie de sécurité
- Le référentiel du titre professionnel comme grille de vérification des livrables

---

### 3. Avec qui avez-vous travaillé ?

J'ai mené ce projet seule, de bout en bout. C'est un projet personnel, réalisé en dehors de tout
cadre d'entreprise : ni équipe, ni client, ni encadrement technique. La maîtrise d'ouvrage étant
fictive, j'ai tenu moi-même son rôle — j'ai écrit les dix-huit besoins du cahier des charges, puis
je les ai acceptés un par un lors de la recette fonctionnelle. Le dossier le dit explicitement
plutôt que de le laisser deviner.

Trois développeurs de mon entourage ont néanmoins parcouru l'application en fonctionnement et
m'ont signalé ce qui les gênait. Leurs remarques sont consignées dans le plan de tests, et **deux
étaient de vrais défauts**, corrigés le jour même : un formulaire qui se vidait entièrement
lorsqu'un seul champ était refusé, et une règle de gestion qui interdisait à tort à un animal en
convalescence de rechuter.

---

### 4. Contexte

- **Nom de l'entreprise, organisme ou association :** Centre Khulula — organisme fictif, projet
  personnel réalisé pendant la formation
- **Chantier, atelier, service :** Formation au titre professionnel Concepteur Développeur
  d'Applications
- **Période d'exercice :** du 20/08/2026 au 25/08/2026

---

### 5. Informations complémentaires

*(champ laissé vide — les quatre difficultés retenues pour le dossier sont réparties sur les
quatre autres pages)*

> **Gardé pour l'oral, pas pour le dossier.** La liste des espèces a d'abord contenu un manchot du
> Cap, alors que le centre est dans le Limpopo, à quatre cents kilomètres de la côte : les espèces
> avaient été choisies pour leur intérêt, sans critère écrit. Deux règles ont refermé la liste à
> neuf espèces — **même région**, et **faune indigène de petite et moyenne taille**, ni éléphant ni
> rhinocéros. C'est la réponse à donner si le jury demande comment le périmètre a été fixé.

---

## Vérification — critères de performance

**CP 5**
- [ ] Les besoins recensés couvrent l'ensemble des exigences exprimées dans le cahier des charges
- [ ] Les maquettes sont réalisées conformément au cahier des charges
- [ ] L'enchaînement des maquettes est formalisé par un schéma
- [ ] Le dossier de conception est structuré, en conformité avec la démarche de conception

**CP 6**
- [ ] L'architecture logicielle est conforme aux bonnes pratiques d'une architecture multicouche
      répartie sécurisée
- [ ] Le rôle de chaque couche est bien défini en tenant compte de la stratégie de sécurité
- [ ] Les besoins d'éco-conception de l'application sont identifiés

## Images de la page

1. Le schéma d'enchaînement des écrans, tiré de `arborescence-ecrans.md`
2. Les quatre couches : routes → contrôleurs → services → Prisma
