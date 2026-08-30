# Charte graphique — Centre Khulula

| | |
|---|---|
| **Version** | 1.2 — 28 août 2026 |
| **Maquettes de référence** | `maquettes/prototype.html` (13 écrans) |
| **Statut** | Validée |

> Référence unique pour l'apparence de l'application — CP 2, *« La charte graphique est
> respectée »*. Toute couleur, taille ou espacement utilisé dans le code vient de ce document.
> Les valeurs sont déclarées **une fois dans le thème Tailwind** : on écrit `bg-khulula-primary`,
> jamais un code hexadécimal.

---

## 1. Principes directeurs

1. **Le contenu d'abord.** L'interface ne doit jamais attirer l'attention plus que l'animal
   dont elle parle. Pas d'ornement décoratif, pas d'animation gratuite.
2. **La retenue plutôt que le vide.** Le minimalisme retenu ici est un choix d'intention : peu
   d'éléments, mais chacun soigné. Typographie large et assumée, hiérarchie nette, respiration.
3. **La lisibilité prime sur l'esthétique.** En cas de conflit entre une intention graphique et
   un critère d'accessibilité, l'accessibilité gagne. Sans exception.
4. **Chaque choix a un coût.** Une police distante, une image lourde, une ombre portée sont des
   octets transférés. L'éco-conception (CP 6) est intégrée à la charte, pas ajoutée après.

---

## 2. Palette

### 2.1 Couleurs de base

| Variable | Valeur | Usage |
|---|---|---|
| `--bg` | `#FAF7F2` | Fond général — blanc cassé chaud |
| `--surface` | `#FFFFFF` | Cartes, panneaux, en-têtes |
| `--surface-alt` | `#F3EEE5` | Bandes alternées, en-têtes de tableau — sable |
| `--ink` | `#16211C` | Titres, texte fort, barres latérales |
| `--body` | `#3D453F` | Texte courant |
| `--muted` | `#646B62` | Texte secondaire, légendes |
| `--line` | `#E4DCD0` | Séparateurs, bordures de cartes |
| `--line-strong` | `#D3C7B6` | Bordures de champs de formulaire |
| `--primary` | `#1F4436` | Actions principales — vert forêt profond |
| `--accent` | `#A85128` | Don, mise en avant — ocre brûlé |
| `--accent-soft` | `#F6E9DD` | Fond d'encadré informatif |
| `--on-dark` | `#C9D2CC` | Texte sur les barres sombres — pied de page, menu latéral |
| `--on-dark-muted` | `#8FA096` | Surtitres et libellés secondaires sur fond sombre |

> `--on-dark` et `--on-dark-muted` ont été ajoutées le 28/08/2026, à l'intégration des deux
> coquilles. Le prototype employait quatre gris clairs sur fond sombre ; deux suffisent, l'écart
> n'étant pas perceptible, et deux noms se retiennent mieux que quatre.

**Intention.** Une base neutre chaude, un vert profond pour l'action, un ocre de savane pour
l'accent. Deux couleurs seulement, jamais plus. La palette évoque le contexte sud-africain sans
recourir à l'imagerie touristique.

### 2.2 Couleurs de statut

Chaque statut a un couple texte / fond. **La couleur ne porte jamais l'information seule** : elle
est toujours accompagnée du libellé écrit (RGAA 3.1).

| Statut | Libellé affiché | Texte | Fond |
|---|---|---|---|
| `admitted` | Admitted | `#4A5D6E` | `#E8EDF1` |
| `in_care` | In care | `#8A5A12` | `#F7EBD7` |
| `recovering` | Recovering | `#14605F` | `#DCEBEA` |
| `released` | Released | `#2F6B33` | `#E3EFE1` |
| `deceased` | Deceased | `#5B5B5B` | `#ECEAE7` |

Enclos : `free` `#3F8A4B` · `occupied` `#A85128` · `maintenance` `#9AA096` — également doublés
d'un libellé texte.

**Échelle UICN** — les cinq degrés de l'écran 3, du moins au plus menacé. Le libellé est toujours
écrit : la couleur classe, elle n'informe pas seule.

| Degré | Texte | Fond |
|---|---|---|
| `least_concern` | `#2F6B33` | `#E3EFE1` |
| `near_threatened` | `#14605F` | `#DCEBEA` |
| `vulnerable` | `#8A5A12` | `#F7EBD7` |
| `endangered` | `#A85128` | `#F6E9DD` |
| `critically_endangered` | `#A32020` | `#F7E3E3` |

### 2.3 Contrôle de contraste

Tous les couples ont été mesurés selon la formule WCAG 2.1. **Seuil retenu : AA (4,5:1)** pour le
texte courant.

| Couple | Ratio | AA |
|---|---:|:---:|
| Texte courant sur fond | 9,26 | ✔ |
| Titre sur fond | 15,49 | ✔ |
| Texte secondaire sur fond | 5,14 | ✔ |
| Texte secondaire sur sable | 4,76 | ✔ |
| Blanc sur vert primaire | 10,83 | ✔ |
| Blanc sur ocre accent | 5,42 | ✔ |
| Étiquette *Admitted* | 5,78 | ✔ |
| Étiquette *In care* | 5,02 | ✔ |
| Étiquette *Recovering* | 5,97 | ✔ |
| Étiquette *Released* | 5,41 | ✔ |
| Étiquette *Deceased* | 5,66 | ✔ |
| Message d'erreur sur fond | 7,06 | ✔ |
| UICN *least concern* | 5,41 | ✔ |
| UICN *near threatened* | 5,97 | ✔ |
| UICN *vulnerable* | 5,02 | ✔ |
| UICN *endangered* | 4,55 | ✔ |
| UICN *critically endangered* | 6,12 | ✔ |
| `--on-dark` sur encre | 10,70 | ✔ |
| `--on-dark-muted` sur encre | 6,02 | ✔ |

> **Traçabilité.** Le calcul a été effectué par script, et non à l'œil. Une première valeur de
> `--muted` (`#6B7269`) atteignait 4,29 sur fond sable et a donc été rejetée puis corrigée en
> `#646B62`. Ce contrôle est à rejouer à chaque ajout de couleur.

---

## 3. Typographie

**Aucune police distante n'est chargée.** Les deux familles s'appuient sur les polices déjà
présentes sur la machine de l'utilisateur. C'est un choix d'éco-conception assumé : zéro requête
réseau, zéro octet transféré, aucun décalage de mise en page au chargement.

| Rôle | Pile |
|---|---|
| Titres | `ui-serif, Georgia, "Iowan Old Style", "Times New Roman", serif` |
| Texte courant | `-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif` |

### Échelle

| Niveau | Taille | Graisse | Interlignage |
|---|---|---|---|
| Titre d'accueil | `clamp(2.4rem, 5.5vw, 3.9rem)` | 600 | 1.05 |
| Titre de section | `clamp(1.6rem, 3vw, 2.15rem)` | 600 | 1.15 |
| Titre de bloc | 1.5 rem | 600 | 1.15 |
| Sous-titre | 1.05 rem | 600 | 1.15 |
| Texte courant | 1 rem | 400 | 1.65 |
| Texte secondaire | 0,875 rem | 400 | 1.65 |
| Surtitre | 0,6875 rem | 600 | — |

**Règles.** Les titres serif portent un interlettrage resserré (`-0.02em`). Les surtitres sont en
majuscules avec un interlettrage élargi (`0.14em`) et **toujours accompagnés d'un titre réel** :
un surtitre n'est jamais un titre de niveau (RGAA 9.1). La longueur de ligne du texte courant est
limitée à 60–70 caractères.

---

## 4. Espacement, rayons, ombres

- **Échelle d'espacement :** 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 60 · 76 px. Aucune valeur hors
  échelle.
- **Rayons :** 6 px (boutons, champs) · 10 px (cartes, panneaux) · 16 px (grands conteneurs) ·
  999 px (étiquettes).
- **Ombres :** aucune. La séparation se fait par bordure `1px solid var(--line)`. Plus net à
  l'écran, moins coûteux au rendu.

---

## 5. Composants

### Boutons

| Variante | Fond | Texte | Usage |
|---|---|---|---|
| `btn-primary` | `--primary` | blanc | Action principale d'un écran |
| `btn-accent` | `--accent` | blanc | Don uniquement |
| `btn-ghost` | `--surface-alt` | `--ink` | Action secondaire, annulation |

Un seul bouton primaire par écran. Zone de clic minimale 44 × 44 px sur mobile.

### Cartes

Fond `--surface`, bordure `--line`, rayon 10 px. Structure constante : visuel, étiquette de
statut, titre, nom latin en italique, ligne de contexte.

### Étiquettes de statut

Pastille arrondie, 0,6875 rem, graisse 600. Couple de couleurs du §2.2. **Toujours du texte, pas
seulement une couleur.**

### Formulaires

- Étiquette visible au-dessus du champ, liée par `for` / `id`. Pas de `placeholder` en guise
  d'étiquette.
- Champs obligatoires marqués d'un astérisque, avec la mention en début de formulaire.
- Texte d'aide sous le champ, en `--muted`.
- Erreur affichée **sous le champ concerné**, en `#A32020`, bordure du champ en rouge, et message
  formulé en langage clair — jamais un code technique.

### Tableaux

En-tête en `--surface-alt`, libellés en majuscules 0,6875 rem. `<th>` avec portée explicite.
Défilement horizontal dans un conteneur dédié sur petit écran, jamais de débordement de la page.

---

## 6. Règles d'accessibilité (RGAA)

Ces règles sont contraignantes. Elles sont vérifiées avant chaque validation d'écran.

| Règle | Application |
|---|---|
| **Contraste** | AA minimum (4,5:1) sur tout texte. Vérifié par script, pas à l'œil. |
| **Structure** | HTML sémantique : `<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`. Hiérarchie de titres sans saut de niveau. |
| **Navigation clavier** | Tout élément interactif atteignable au clavier, dans un ordre logique. |
| **Indicateur de focus** | Contour 2 px `--accent`, décalé de 2 px. **Jamais supprimé.** |
| **Liens** | Vrais éléments `<a>`, jamais un `<div>` cliquable. Intitulé explicite hors contexte. |
| **Images** | Alternative textuelle sur toute image porteuse d'information ; `alt=""` sur les images décoratives. |
| **Couleur seule** | Aucune information transmise par la couleur uniquement. |
| **Formulaires** | Étiquette liée à chaque champ, erreurs explicites et associées au champ. |
| **Langue** | `lang` déclaré sur la page ; `lang` local sur les termes d'une autre langue (noms latins, mots isiZulu). |
| **Zoom** | Contenu utilisable jusqu'à 200 % sans perte d'information ni défilement horizontal. |
| **Mouvement** | Respect de `prefers-reduced-motion`. |

**Restant à faire dans l'application React** (non couvert par les maquettes statiques) : lien
d'évitement en début de page, annonce des erreurs dynamiques via `role="status"`, test au lecteur
d'écran, déclaration d'accessibilité en pied de page.

---

## 7. Éco-conception

| Décision | Effet |
|---|---|
| Polices système uniquement | Aucun téléchargement de police |
| Aucune ombre portée | Rendu moins coûteux |
| Aucune bibliothèque de composants graphiques | Poids du bundle réduit |
| Pagination systématique | Aucune requête sans limite |
| Images dimensionnées pour leur usage réel | Octets transférés réduits |
| Mise en cache des données peu variables | Requêtes serveur évitées |

---

## 8. Responsive

| Palier | Comportement |
|---|---|
| ≥ 1024 px | Grilles pleines, barre latérale du personnel visible |
| 820 – 1024 px | Grilles réduites, navigation conservée |
| < 820 px | Colonne unique, barre latérale repliée, tableaux à défilement horizontal dans leur conteneur |

Le corps de page ne défile **jamais** horizontalement.
