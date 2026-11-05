Modèle à copier pour un nouveau billet (avec tous les commentaires de guidage) :
- ./src/blog/posts/_modele.mdx

Exemple complet utilisant les composants :
- ./src/blog/posts/2026/decembre.mdx

Composants de billet (./src/components/post/) :
- `<CardList label="…" columns={1|2}>` : liste de cartes (label obligatoire, lu par les lecteurs d'écran)
- `<EventCard>` : un festival/événement (name, dates, address, schedule, price, attendance, image, url)
- `<GameCard>` : un jeu (name, image, players, age, duration, mechanics, authors, artists, publisher, distributor, price)
- `<PostImage src alt caption>` : image seule (alt obligatoire)
- `<ImageGallery label images>` : grille d'images (alt obligatoire pour chaque image)

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


rédaction pour un jeu :
- URL de l'image
- récupérer à partir des emojis sur campustech : 
  - <logo éditeur> nom du jeu -> garder le nom du jeu
  - 👨‍👩‍👦 <nombre de joueurs> -> à garder à l'identique
  - 🎂 <age mini> -> à garder à l'identique
  - ⏱ <temps de jeu> -> à garder à l'identique
  - ⚙️ <mécanique de jeu> -> à garder à l'identique
  - 💡 <auteur> -> à garder à l'identique
  - 🎨 <design> -> à garder à l'identique
  - 🛠️ <éditeur> -> à garder à l'identique
  - 🚚 <distributeur> -> à garder à l'identique
  - 📆 <date de sortie> -> ignorer

Restitution dans le billet pour un jeu : 

(source) Jeu sur campustech : 
```
image du jeu : https://www.campustech.fr/wp-content/uploads/2026/07/foret-mixte-smoky-mountains.png
<logo éditeur> Forêt Mixte Smoky Mountains
👨‍👩‍👦 2-5 joueurs
🎂 10+
⏱ 60 min
⚙️ Tableau-building, Draft
💡 Kosch
🎨 Toni Llobet, Judit Piella
🛠️ Lookout Games
🚚 Asmodee
📆 Sortie : 23/10/2026
```
Ligne dans le tableau : 
```
| ![Forêt Mixte Smoky Mountains]([../../../assets/posts/2026/octobre/foret_mixte.png](https://www.campustech.fr/wp-content/uploads/2026/07/foret-mixte-smoky-mountains.png)) | **Forêt Mixte Smoky Mountains** <br/>👨‍👩‍👦 2-5 joueurs<br/>🎂 10+<br/>⏱ 60 min<br/>⚙️ Tableau-building, Draft<br/>💡 Kosch<br/>🎨 Toni Llobet, Judit Piella<br/>🛠️ Lookout Games<br/>🚚 Asmodee<br/>26€ |
```

Pour la petite présentation : 
<TODO>
