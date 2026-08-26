# AT1 — Exemple 2 · CP 2 + CP 3

> **Fichier partiel.** Seule la section *Difficultés rencontrées* est remplie, parce qu'elle doit
> l'être le jour même. Le reste du fichier est généré à l'étape 30 du `PLAN.md`, à partir du
> gabarit validé de `AT1-exemple-1.md` : ne pas écraser la section 11 à ce moment-là.

---

## 11. Difficultés rencontrées

| Difficulté | Diagnostic | Résolution | Commit |
|---|---|---|---|
| 26/08/2026 — Un compte désactivé par un administrateur continuait de travailler normalement. La règle RG12 était pourtant écrite, testée à la connexion, et annoncée comme faite dans le `PLAN.md`. | Le contrôle d'accès ne posait qu'une seule question : « une session existe-t-elle ? ». La session est écrite **une fois**, à la connexion, et n'est jamais relue ensuite ; elle décrivait donc l'état du compte au moment de la connexion, pas son état actuel. Une seule route, `GET /auth/me`, interrogeait réellement la base. RG12 était donc appliquée sur 1 route sur 6, et un compte désactivé gardait tous ses droits jusqu'à l'expiration de sa session, soit jusqu'à huit heures. Le symptôme était l'absence de refus ; la cause était une donnée mise en cache dans la session et jamais rafraîchie. | Le défaut a d'abord été **reproduit et capturé** avant toute correction (`docs/dp/captures/rg12-before.txt`) : connexion, désactivation en base pendant la session ouverte, puis `GET /enclosures` → `200`. `requireSession` interroge désormais la base à chaque requête protégée et refuse un compte inactif. `requireRole` et `requireAdmin` lisent également le rôle sur la ligne relue plutôt que dans la session, ce qui corrige la même faille pour un changement de rôle. Coût : une requête sur clé primaire par requête protégée, volontairement non mise en cache — un cache rendrait à un compte désactivé les quelques secondes que ce contrôle existe précisément pour lui retirer. Vérifié sur les six routes : `rg12-after.txt`. | `c73fa19` |
| 26/08/2026 — Désactiver un administrateur **déjà** désactivé répondait « le dernier administrateur actif ne peut pas être désactivé », ce qui est faux. | Trouvé en testant RG14, pas en lisant le code. Le contrôle comptait les administrateurs actifs sans vérifier d'abord si la cible était elle-même active : une fois le second administrateur désactivé, le compteur retombait à 1 et la règle se déclenchait sur une opération qui ne changeait rien. La règle était juste, sa condition d'entrée ne l'était pas. | Ajout de `staff.is_active` à la condition : la vérification ne s'applique qu'à un compte réellement actif. Rejouer l'opération renvoie désormais `200` sans rien modifier. | `55ad59e` |

> **À retenir pour l'oral.** Les deux défauts ont été trouvés en écrivant ou en exécutant des
> tests, pas en relisant le code — et le premier avait été déclaré « fait » dans le plan. C'est
> l'argument le plus direct pour le critère *« la démarche structurée de résolution de problème
> est adaptée en cas de dysfonctionnement »*, qui apparaît dans quatre CP.
