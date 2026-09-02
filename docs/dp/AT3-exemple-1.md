# AT 3 — Exemple 1 · CP 9

**CP 9** — Préparer et exécuter les plans de tests d'une application

---

### Intitulé de l'exemple

**Préparer et exécuter le plan de tests du centre Khulula**

---

### 1. Décrivez les tâches ou opérations que vous avez effectuées, et dans quelles conditions

J'ai écrit un plan de tests couvrant les fonctionnalités retenues, je l'ai exécuté, et j'ai
consigné les résultats dans le même document — plan et compte rendu d'exécution partagent le même
tableau, ce qui évite d'en tenir deux.

**1) J'ai créé un environnement de test.**
Les tests s'exécutent contre la pile Docker de développement : PostgreSQL migré et alimenté par le
script de seed, Redis démarré. Un fichier de configuration Vitest passe les variables
d'environnement aux tests, parce qu'ils utilisent une vraie base et non des simulacres. Le jeu
d'essai est le même à chaque exécution, ce qui rend les résultats comparables.

**2) J'ai écrit un plan de tests couvrant les fonctionnalités retenues.**
Le document décrit l'objet et le périmètre, les moyens, les tests automatisés, les vérifications
manuelles, le test de charge, le fuzzing, ce qui n'est pas couvert et pourquoi, puis le compte
rendu d'exécution et la recette fonctionnelle. Il annonce sa propre limite : il porte sur le
serveur, l'interface étant couverte par la recette.

**3) J'ai automatisé quatre tests, et pas davantage.**
Un test unitaire sur les fonctions de pagination — fonctions pures, sans base ni simulacre — et
trois tests d'intégration sur les règles critiques : la course à l'admission, le retour en arrière
d'une admission interrompue, et le refus d'un compte désactivé en cours de session. Le choix de
s'arrêter à quatre est délibéré : le critère est que les tests soient **pertinents**, et quatre
tests que je peux expliquer ligne à ligne valent mieux que quarante que je ne pourrais pas.

**4) J'ai vérifié que chaque test d'intégration sert réellement à quelque chose.**
Chacun a été **observé en échec avant d'être conservé**, en cassant le code qu'il protège puis en
le restaurant : le verrou de ligne supprimé, la transaction supprimée, le contrôle du compte actif
supprimé. Un test qui n'a jamais été vu échouer ne prouve rien. Ces trois sorties en échec sont la
preuve la plus solide du plan, davantage que les trois sorties vertes.

**5) J'ai exécuté un test de charge.**
Avec `ab`, déjà présent sur la machine, sur une liste publique. Deux mesures : **583 requêtes par
seconde et une médiane à 6 ms** sous le seuil du limiteur de débit ; et au-dessus du seuil,
**soixante requêtes acceptées et deux cent quarante refusées avec un `429`**. La seconde mesure
vérifie une protection, pas une performance.

**6) J'ai cherché des failles par des tests aléatoires.**
Un script de fuzzing de mon écriture envoie quinze charges utiles choisies à la main au formulaire
de don et ne vérifie qu'une chose : **toute réponse est un `201` ou un `400`, jamais un `500`**.
Un `500` signalerait une exception non traitée, donc une information technique susceptible de
fuir. Le fuzzing a trouvé un vrai défaut dès la première exécution — un corps de requête non JSON
répondait `500` au lieu de `400` — corrigé le jour même dans le gestionnaire d'erreurs central. Le
script vérifie désormais la correction.

**7) J'ai fait exécuter la recette fonctionnelle sur les dix-huit besoins.**
Chacun des dix-huit besoins du cahier des charges a été parcouru un par un dans l'application en
fonctionnement : **dix-huit conformes, aucune anomalie ouverte**. Chaque écriture a été vérifiée
dans la base et non à l'écran. Le dossier dit clairement que j'ai tenu moi-même le rôle du client,
la maîtrise d'ouvrage étant fictive.

**8) J'ai fait relire l'application par trois développeurs.**
Trois personnes ont parcouru le site et signalé ce qui les gênait. Leurs remarques sont consignées
dans le plan de tests, et **deux étaient de vrais défauts**, corrigés le jour même : un formulaire
qui se vidait entièrement lorsqu'un seul champ était refusé, et une règle qui interdisait à tort à
un animal en convalescence de rechuter.

**9) J'ai écrit les limites plutôt que de les taire.**
Les trois tests d'intégration sont exclus de l'intégration continue : ils exigent une base migrée
et alimentée, et reconstruire cela à chaque poussée coûte plus qu'il ne rapporte ici. La limite est
écrite dans le fichier de workflow et dans le plan de tests. Une limite assumée se défend mieux
qu'une chaîne que je ne saurais pas expliquer.

---

### 2. Précisez les moyens utilisés

- **Vitest** comme outil de tests, unitaires et d'intégration
- **`ab`** (Apache Bench) pour le test de charge — aucun outil nouveau installé
- Un **script de fuzzing** écrit pour le projet, quinze charges utiles choisies à la main
- **`curl`** pour les vérifications manuelles route par route
- **Adminer** et `psql` pour vérifier en base le résultat de chaque écriture
- La pile **Docker Compose** de développement comme environnement de test
- Le document `plan-de-tests.md`, versionné, comme plan **et** compte rendu d'exécution

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
- **Période d'exercice :** du 26/08/2026 au 01/09/2026

---

### 5. Informations complémentaires

**Difficultés rencontrées**

| Difficulté | Diagnostic | Résolution |
|---|---|---|
| 27/08/2026 — Dès sa première exécution, le fuzzing a obtenu un `500` sur le formulaire de don, là où toute entrée invalide devait recevoir un `400`. | Le corps de la requête n'était pas du JSON valide. L'analyseur d'Express lève alors une erreur avant que la validation Zod soit atteinte : cette erreur arrivait au gestionnaire central, qui ne la reconnaissait pas et la traitait comme une panne du serveur. Le défaut n'était pas dans la validation mais **en amont d'elle** — aucun test écrit à la main ne l'aurait trouvé, parce que je n'aurais pas pensé à envoyer un corps illisible. | Le gestionnaire d'erreurs central reconnaît désormais l'erreur d'analyse JSON et répond `400`. Le script de fuzzing rejoue le cas à chaque exécution. C'est l'argument à donner si le jury demande à quoi sert le fuzzing quand on a déjà des tests. |

> **Gardé pour l'oral, pas pour le dossier.** La relecture par des tiers a révélé qu'un formulaire
> refusé sur **un seul** champ se vidait entièrement : l'attribut `action` de React 19 réinitialise
> un formulaire non contrôlé dès que l'action se termine, y compris par un refus. Je ne l'avais pas
> vu parce que je testais avec des valeurs correctes. Les huit formulaires sont passés à
> `onSubmit` avec `preventDefault()`.

---

## Vérification — critères de performance

**CP 9**
- [ ] Le plan de tests couvre l'ensemble des fonctionnalités retenues pour l'application
- [ ] Un environnement de tests est créé
- [ ] L'intégralité des tests exécutés sont conformes au plan de tests défini
- [ ] Les résultats obtenus sont cohérents avec les résultats attendus
- [ ] Le plan de tests tient compte des évolutions technologiques et des problèmes de sécurité
      liés aux tests logiciels

## Images de la page

1. `npm test` au vert — quatre fichiers, cinq tests
2. Le tableau de recette des dix-huit besoins, §9 du plan de tests
