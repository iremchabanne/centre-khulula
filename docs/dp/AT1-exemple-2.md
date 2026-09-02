# AT 1 — Exemple 2 · CP 2 + CP 3

**CP 2** — Développer des interfaces utilisateur
**CP 3** — Développer des composants métier

---

### Intitulé de l'exemple

**Développer les écrans et les règles métier du centre Khulula**

---

### 1. Décrivez les tâches ou opérations que vous avez effectuées, et dans quelles conditions

À partir du dossier de conception, j'ai développé les treize écrans de l'application et les règles
métier qui les servent. Le centre dispose d'un nombre limité d'enclos : c'est cette contrainte qui
structure tout ce qui suit.

**1) J'ai développé les treize écrans définis dans le dossier de conception.**
Six pages publiques, accessibles sans compte, et sept écrans réservés au personnel. Le découpage
et l'enchaînement viennent du document `arborescence-ecrans.md`, écrit avant le code. React pour
les composants, Tailwind pour la mise en forme, `fetch` pour appeler l'API.

**2) J'ai respecté la charte graphique sans jamais coder une couleur en dur.**
La palette et l'échelle typographique sont déclarées une seule fois, dans le thème Tailwind. Un
écran écrit `bg-khulula-*`, jamais une valeur hexadécimale. Une couleur nouvelle est d'abord
mesurée en contraste, puis ajoutée au thème.

**3) J'ai rendu l'interface adaptative.**
Les mises en page à une direction utilisent flex, la grille est réservée aux cas où les lignes et
les colonnes doivent s'aligner. La fiche animal passe à deux colonnes sur écran large et revient à
une seule sur mobile.

**4) J'ai écrit les huit formulaires à la main, sans aucune bibliothèque.**
Chaque formulaire utilise `onSubmit`, appelle `preventDefault()` et lit ses valeurs avec
`new FormData(event.currentTarget)` : aucun champ n'a besoin de son propre état. Un formulaire
garde trois ou quatre variables d'état — erreurs, envoi en cours, résultat. La validation est une
petite fonction de `if` successifs qui renvoie un objet d'erreurs. Comptés champ par champ, les
huit formulaires demandent une quinzaine de vérifications : une bibliothèque de formulaires aurait
été plus longue à apprendre qu'à remplacer.

**5) J'ai appliqué les règles d'accessibilité RGAA.**
`lang`, les repères `header` / `nav` / `main` / `footer`, un seul `h1` par page, un `alt` sur
chaque image, un lien *Skip to content* visible au focus, la touche Échap qui ferme une boîte de
dialogue et le focus qui s'y place à l'ouverture. Le composant partagé `FormField` porte le label,
l'erreur et le câblage `aria-invalid` / `aria-describedby` : la règle est écrite une fois au lieu
de huit. La page de mentions légales déclare une conformité **partielle** et énumère les trois
limites qui restent — un audit au lecteur d'écran n'a pas été mené.

**6) J'ai mis en place les mentions légales RGPD.**
La page dit quelles données sont collectées, pour quoi faire, combien de temps elles sont
conservées, et comment exercer ses droits. Le formulaire de don n'enregistre qu'une intention :
aucun champ bancaire, aucun prestataire de paiement, décision écrite dans le cahier des charges.

**7) J'ai écrit la couche métier en programmation orientée objet.**
Express et Prisma sont fonctionnels : rien n'est objet si on ne le décide pas. J'ai donc écrit la
couche service sous forme de **six classes** — `AnimalService`, `AuthService`, `DonationService`,
`EnclosureService`, `SpeciesService`, `StaffService`. Chacune reçoit le client Prisma dans son
constructeur et expose des méthodes. Pas d'héritage, pas de classe abstraite, pas de patron de
conception : un constructeur et des méthodes, que je peux expliquer ligne à ligne.

**8) J'ai sécurisé les composants métier côté serveur.**
Les mots de passe sont hachés avec argon2. Les sessions du personnel vivent dans Redis. Trois
intergiciels contrôlent l'accès, et `requireSession` **relit le compte en base à chaque requête
protégée** : un compte désactivé est refusé immédiatement, et un rôle modifié aussi. Toute entrée
est validée par Zod avant le moindre accès aux données, les clés inconnues étant rejetées. Un
gestionnaire d'erreurs central garantit qu'aucune erreur technique n'atteint le client.

**9) J'ai fait porter les règles métier par le serveur, jamais par l'écran.**
Masquer un bouton est un confort, jamais une sécurité. L'issue d'un animal — relâché ou décédé —
est réservée au vétérinaire : le soigneur ne voit pas le bouton, et s'il appelle la route
directement il reçoit un `403`. La règle RG17 en est un autre exemple : un animal n'occupe qu'un
enclos du type que son espèce exige, vérifié à l'admission comme au transfert.

**10) J'ai nommé et documenté le code de façon homogène.**
Tout ce qui est à l'intérieur de l'application est en anglais — code, commentaires, tables et
colonnes, libellés d'écran. Les tables sont au singulier en `snake_case`. Un commentaire n'est
écrit que devant ce qui n'est pas évident, et il dit **pourquoi**, pas quoi.

**11) J'ai vérifié par des tests et par une recette.**
Un test unitaire sur la pagination, trois tests d'intégration sur les règles critiques, et le
parcours des dix-huit besoins du cahier des charges dans l'application en fonctionnement :
dix-huit conformes, aucune anomalie ouverte. Chaque écriture a été vérifiée en base et non à
l'écran.

---

### 2. Précisez les moyens utilisés

- TypeScript, côté client comme côté serveur
- React et React Router pour les écrans ; aucune bibliothèque d'état ni de récupération de données
- Tailwind CSS, la charte graphique déclarée une fois dans le thème
- Node.js et Express, en architecture en couches
- Prisma comme ORM, PostgreSQL comme base relationnelle, Redis pour les sessions
- Zod pour la validation des entrées côté serveur, argon2 pour le hachage des mots de passe
- Vitest pour les tests, ESLint pour la qualité du code
- Le référentiel RGAA et les recommandations OWASP comme cadre

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
- **Période d'exercice :** du 28/08/2026 au 01/09/2026

---

### 5. Informations complémentaires

**Difficultés rencontrées**

| Difficulté | Diagnostic | Résolution | Commit |
|---|---|---|---|
| 26/08/2026 — Un compte désactivé par un administrateur continuait de travailler normalement. La règle RG12 était pourtant écrite, testée à la connexion, et annoncée comme faite dans le `PLAN.md`. | Le contrôle d'accès ne posait qu'une seule question : « une session existe-t-elle ? ». La session est écrite **une fois**, à la connexion, et n'est jamais relue ensuite ; elle décrivait donc l'état du compte au moment de la connexion, pas son état actuel. Une seule route, `GET /auth/me`, interrogeait réellement la base. RG12 était donc appliquée sur 1 route sur 6, et un compte désactivé gardait tous ses droits jusqu'à l'expiration de sa session, soit jusqu'à huit heures. Le symptôme était l'absence de refus ; la cause était une donnée mise en cache dans la session et jamais rafraîchie. | Le défaut a d'abord été **reproduit et capturé** avant toute correction (`docs/dp/captures/rg12-before.txt`) : connexion, désactivation en base pendant la session ouverte, puis `GET /enclosures` → `200`. `requireSession` interroge désormais la base à chaque requête protégée et refuse un compte inactif. `requireRole` et `requireAdmin` lisent également le rôle sur la ligne relue plutôt que dans la session, ce qui corrige la même faille pour un changement de rôle. Coût : une requête sur clé primaire par requête protégée, volontairement non mise en cache — un cache rendrait à un compte désactivé les quelques secondes que ce contrôle existe précisément pour lui retirer. Vérifié sur les six routes : `rg12-after.txt`. | `c73fa19` |

> **À retenir pour l'oral.** Le défaut a été trouvé en écrivant un test, pas en relisant le code —
> et il avait été déclaré « fait » dans le plan. C'est l'argument le plus direct pour le critère
> *« la démarche structurée de résolution de problème est adaptée en cas de dysfonctionnement »*,
> qui apparaît dans quatre CP.
>
> Second défaut du même jour, gardé pour l'oral : désactiver un administrateur **déjà** désactivé
> répondait à tort « le dernier administrateur actif ne peut pas être désactivé ». La règle était
> juste, sa condition d'entrée ne l'était pas — elle ne vérifiait pas d'abord que la cible était
> active. Corrigé par le commit `55ad59e`.

---

## Vérification — critères de performance

**CP 2**
- [ ] L'interface est conforme au dossier de conception
- [ ] L'interface s'adapte à la taille, au type et à la disposition du support
- [ ] La charte graphique est respectée
- [ ] La règlementation en vigueur est respectée
- [ ] Le code est documenté
- [ ] Les tests unitaires ont été réalisés pour les composants concernés
- [ ] Le jeu d'essai fonctionnel est complet
- [ ] Les tests de sécurité sont réalisés
- [ ] La documentation technique est comprise, en français ou en anglais (niveau B1)
- [ ] La démarche structurée de résolution de problème est adaptée en cas de dysfonctionnement
- [ ] Le système de veille suit les évolutions et les problématiques de sécurité des interfaces

**CP 3**
- [ ] Les bonnes pratiques de la programmation orientée objet sont respectées
- [ ] Les composants métier sont sécurisés
- [ ] Les règles de nommage sont conformes aux normes de qualité
- [ ] Le code source est documenté
- [ ] Les traitements répondent aux fonctionnalités décrites dans le dossier de conception
- [ ] Les tests unitaires sont réalisés
- [ ] Les tests de sécurité sont réalisés
- [ ] La démarche structurée de résolution de problème est adaptée en cas de dysfonctionnement
- [ ] Le système de veille suit les évolutions et les problématiques de sécurité des composants
      métier

## Images de la page

1. La boîte de dialogue d'admission, ne proposant que les enclos du type exigé par l'espèce (RG17)
2. Un `403` retourné à un soigneur sur une route réservée, à côté du `200` obtenu par un
   vétérinaire sur la même route
