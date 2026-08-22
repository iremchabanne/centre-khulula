# Journal de veille — Centre Khulula

Le système, les sources et la méthode sont décrits dans `veille-technologique.md`.
**Entrées les plus récentes en haut.**

Une entrée n'est retenue que si elle répond à *« qu'est-ce que cela change pour Khulula ? »*.

---

## 22 août 2026

### `deepmerge-ts` — vulnérabilité dans une dépendance de l'outil Prisma

| | |
|---|---|
| **Source** | GitHub Advisory Database — GHSA-ggr8-5vv4-36mx, remontée par `npm audit` |
| **CP** | 8, 11 |

L'installation de Prisma déclenche trois alertes de sévérité *high*. Elles viennent toutes du même
paquet, `deepmerge-ts`, tiré par `@prisma/config` : une saturation de pile lorsqu'il fusionne un
objet dont la structure se référence elle-même.

**Ce que cela change pour Khulula : aucune action, et la raison est la chaîne de dépendance.**
`@prisma/config` n'est chargé que par l'outil en ligne de commande `prisma`, déclaré en
`devDependencies` : il sert à lire la configuration pendant une migration, sur le poste de
développement. Il n'est pas embarqué dans `@prisma/client`, donc il n'est jamais exécuté par l'API.
Aucune donnée venant d'un utilisateur ne l'atteint. Le correctif proposé par `npm audit fix --force`
rétrograderait Prisma de 6.19 à 6.12, ce qui coûte plus que le risque encouru. La situation sera
revue à la sortie d'une version corrigée.

**Ce que cela apprend.** Une alerte *high* n'est pas une urgence en soi : ce qui compte est de
savoir si le code vulnérable est atteignable depuis une entrée utilisateur. `dependencies` et
`devDependencies` ne présentent pas le même risque, et lire la chaîne de dépendance fait partie du
travail de tri.

> Constat annexe : Dependabot n'est toujours pas activé sur le dépôt, cette alerte a donc été
> trouvée manuellement. À activer — c'est la troisième source du système.

---

## 20 août 2026

### Index unique partiel — garantir l'unicité d'occupation d'un enclos

| | |
|---|---|
| **Source** | Documentation PostgreSQL — *Partial Indexes* |
| **CP** | 8 |

Un index unique peut être restreint par une clause `WHERE` : l'unicité ne s'applique alors qu'aux
lignes qui satisfont la condition. Sur `stay(enclosure_id) WHERE ended_at IS NULL`, cela signifie
qu'un enclos ne peut avoir qu'**un seul séjour ouvert**, mais autant de séjours clos qu'on veut.

**Ce que cela change pour Khulula.** RG1 était jusque-là garantie par un contrôle applicatif, qui
se contourne par deux requêtes simultanées. La garantie passe en base : `modele-donnees.md` §5.3.
C'est aussi ce qui transforme le conflit d'accès de l'écran 8 en erreur propre plutôt qu'en double
occupation.

---

### OWASP — stockage des mots de passe

| | |
|---|---|
| **Source** | OWASP *Password Storage Cheat Sheet* |
| **CP** | 2, 3 |

OWASP place **Argon2id** en premier choix pour le hachage de mots de passe, devant bcrypt qui
reste acceptable. Argon2id résiste mieux aux attaques par matériel spécialisé (GPU, ASIC) parce
qu'il consomme volontairement de la mémoire, pas seulement du temps de calcul.

**Ce que cela change pour Khulula.** Le cahier des charges disait « bcrypt ou argon2 ». La
décision est tranchée : **argon2**, et §6.1 a été mis à jour en conséquence.

---

### OWASP Top 10 — A01 *Broken Access Control*

| | |
|---|---|
| **Source** | OWASP Top 10 |
| **CP** | 2, 3 |

*Broken Access Control* est classée **première** des dix risques applicatifs. Le cas typique :
l'interface masque un bouton, mais la route correspondante accepte quand même l'appel. Masquer
n'est pas contrôler.

**Ce que cela change pour Khulula.** Trois règles reposent entièrement sur du contrôle d'accès —
RG6 (seul le vétérinaire prononce une sortie), RG13 (aucun compte administrateur créé depuis
l'interface) et l'onglet *Manage* réservé de l'écran 8. Chacune doit être vérifiée **côté
serveur**, et non seulement masquée. Écrit dans `cahier-des-charges.md` §3.4 et à tester au
moment du CP 9.

---

> **Ces trois premières entrées ont été écrites le jour de la mise en place du système**, à partir
> des sources réellement consultées pendant la phase de conception. Les suivantes sont à écrire
> **au fil de l'eau**, une par semaine : un journal reconstitué à la fin ne prouve rien, et
> l'historique Git le montrerait.
