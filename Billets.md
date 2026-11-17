Modèle à copier pour un nouveau billet (avec tous les commentaires de guidage) :
- ./src/blog/posts/_modele.mdx

Exemple complet utilisant les composants :
- ./src/blog/posts/2026/decembre.mdx

Composants de billet (./src/components/post/), disponibles dans tous les billets MDX sans import :
- `<CardList label="…" columns={1|2}>` : liste de cartes (label obligatoire, lu par les lecteurs d'écran)
- `<EventCard>` : un festival/événement (name, dates, address, schedule, price, attendance, image, url)
- `<GameList label="…" ids={["id-1", "id-2"]} />` : une carte par jeu, dans l'ordre donné
- `<GameCard id="…">` : la carte d'un jeu, construite depuis sa fiche ; le contenu (facultatif) est un commentaire propre au billet. À placer dans un `<CardList columns={2}>`
- `<GameLink id="…" />` : lien rose vers la fiche d'un jeu, avec infobulle (boîte + prix) au survol. `tooltip={false}` pour la retirer
- `<PersonLink id="…" />` / `<PublisherLink id="…" />` : lien rose vers la fiche d'un auteur/illustrateur ou d'un éditeur/distributeur
  - texte personnalisé : `<GameLink id="faraway">ce petit bijou</GameLink>` ; icône : `icon`
  - rose = une fiche du site, or = un lien classique
- `<PostImage src alt caption>` : image seule (alt obligatoire)
- `<ImageGallery label images>` : grille d'images (alt obligatoire pour chaque image)

Fiches (source unique des infos de jeux) :
- jeux : `./src/data/games/<id>.md` (l'id d'un jeu est le nom du fichier)
- personnes : `./src/data/people.json`, éditeurs et distributeurs : `./src/data/publishers.json`
- « Cité dans le journal » : un billet publié qui utilise `GameLink`, `GameCard`, `GameList`, `PersonLink` ou `PublisherLink` apparaît automatiquement sur les fiches concernées (et sur celles des auteurs/éditeurs de ses jeux). Les brouillons n'y apparaissent pas ; le texte en gras ou les tableaux markdown ne comptent pas comme citation.
- un id sans fiche n'interrompt pas le build : le composant affiche du texte simple et un avertissement `Fiche introuvable` apparaît dans la console. À corriger avant publication.

Accessibilité : alt sur toutes les images, titres sans saut de niveau (`##` puis `###`, le `<h1>` est le titre du billet), liens explicites.

Ancien exemple (tableaux markdown, avant les composants) :
- ./src/blog/posts/2026/octobre.mdx

Source pour les festivals : 
- https://subverti.com/fr/maps/festivals/ (sélectionner ceux proche de l'alsace-moselle pour le mois demandé)

Source pour les jeux : 
- prix :
  - via la recherche : https://www.philibertnet.com/fr/
- sorties des jeux :
  - pour 2026 dans l'onglet du mois correspondant https://www.campustech.fr/calendrier-des-sorties-jeux-de-societe-2026/

Distinguer extension et suite de jeux pour le premier tableau et jeux standalone pour le second tableau.


Rédaction pour un jeu :

1. Récupérer sur campustech le bloc du jeu et l'URL de son image :
```
https://www.campustech.fr/wp-content/uploads/2026/07/foret-mixte-smoky-mountains.png
Forêt Mixte Smoky Mountains
👨‍👩‍👦 2-5 joueurs
🎂 10+
⏱ 60 min
⚙️ Tableau-building, Draft
💡 Kosch
🎨 Toni Llobet, Judit Piella
🛠️ Lookout Games
🚚 Asmodee
📆 Sortie : 23/10/2026
26€
```
   - le logo de l'éditeur devant le nom est ignoré, garder seulement le nom du jeu
   - la date de sortie (📆) est ignorée
   - ajouter le prix (philibertnet) sur sa propre ligne
   - facultatif : `kind: extension|suite`, `parent: <id du jeu de base>`, `id: <id voulu>`
2. Mettre tous les blocs du mois dans un fichier, séparés par une ligne vide, puis lancer :
```
pnpm new-game blocs.txt --dry-run   # vérifier
pnpm new-game blocs.txt             # créer les fiches
```
   Le script crée `src/data/games/<id>.md`, ajoute les auteurs, illustrateurs et éditeurs manquants dans `people.json` / `publishers.json` (comparaison sans accents ni majuscules), passe le jeu en `extension` si la mécanique l'indique, et ne touche pas aux fiches existantes (`--force` pour les remplacer).
   Vérifier les noms proches mais différents (ex. « Intrafin » et « Intrafin Games ») : corriger le bloc pour réutiliser la fiche existante.
3. Dans le billet : `<GameList label="Jeux" ids={["foret-mixte-smoky-mountains", …]} />`.

Pour la petite présentation : 
<TODO>
