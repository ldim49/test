# Undercover — jeu du mot caché

Jeu de bluff et de déduction autonome, en HTML/CSS/JavaScript vanilla. Aucune bibliothèque, police, image ou requête réseau n'est nécessaire pour jouer hors-ligne.

## Lancer une partie

1. Décompressez le dossier téléchargé en conservant son arborescence.
2. Ouvrez `index.html` dans un navigateur récent (téléphone, tablette ou ordinateur).
3. Choisissez le nombre de joueurs, les noms, le nombre d'undercover, le thème, la difficulté, le mode de distribution et les minuteurs.
4. En mode téléphone partagé, passez l'appareil à chaque joueur. Pour voir son information, il maintient le doigt sur la carte ; celle-ci se masque au relâchement.
5. Choisissez `Aléatoire` dans les thèmes pour varier les catégories à chaque partie ou à chaque tour.
6. Réglez le nombre de tours de 1 à 5 pour enchaîner plusieurs manches.

La page `cartes.html` affiche les cartes par thème et par difficulté. Depuis l'accueil, le bouton `Voir la bibliothèque des cartes` ouvre cette bibliothèque. Les cartes peuvent être filtrées avec les menus déroulants du haut.

## Indices des undercover

Chaque paire contient désormais un mot civil, un mot undercover et un indice sémantique :

```js
['chat', 'chien', 'canidé']
```

- Les civils voient `chat`.
- Les undercover voient `canidé`, indice lié au mot undercover.
- `themeHints` fournit un indice de repli pour les thèmes sans paire définie.

Cet indice apparaît aussi dans les cartes privées, les liens individuels et les QR codes.

Si le navigateur restreint certaines fonctions lorsqu'on ouvre un fichier directement, un serveur local est également possible depuis le dossier :

```sh
python3 -m http.server 8000
```

Puis ouvrez `http://localhost:8000`.

## Modes de distribution

- **Téléphone partagé** : les rôles sont révélés un à un par appui maintenu, puis masqués au relâchement. C'est le mode recommandé pour jouer immédiatement hors-ligne.
- **Un téléphone chacun** : le jeu prépare un QR code et une URL privée par participant. Chaque QR est généré localement avec la bibliothèque embarquée `js/qrcode.min.js`, sans appel externe. Pour plusieurs appareils, chaque participant doit pouvoir accéder à la même adresse HTTP du dossier. Ouvrez le dossier avec un serveur local accessible sur le réseau pour remplacer les liens `file://`. Il n'y a pas de serveur de synchronisation : les minuteries et votes restent gérés sur l'appareil hôte ; l'écran individuel ne synchronise pas le jeu.

**Confidentialité :** le mode multi-appareil autonome encode les rôles et les mots dans le fragment d'URL en clair (base64 n'est pas du chiffrement). Une personne qui inspecte le lien ou sa page peut voir l'information. Partagez seulement chaque lien avec son destinataire. Pour une vraie confidentialité/synchronisation à distance, il faut ajouter un serveur ou un protocole de partage sécurisé.

## Personnaliser les règles

Modifiez `js/config.js` :

- `minPlayers`, `maxPlayers`, `defaultPlayers` règlent la plage de joueurs.
- `defaultRoundMinutes`, `defaultDebateMinutes` règlent les minuteries par défaut.
- `maxUndercover` fixe le plafond configurable. Le jeu conserve au moins un civil et limite le nombre d'undercover à la moitié des joueurs (arrondi inférieur).
- `wordPairs` fournit les paires suggérées par niveau : mot civil, mot undercover, puis indice sémantique.
- `themeHints` associe un indice de repli à chaque thème.
- `palette` regroupe les couleurs principales utilisées comme référence. Le thème CSS se modifie dans `css/style.css` via `:root`.

## Modifier et ajouter des mots

La bibliothèque indépendante est `js/words.js`. Sa structure est :

```js
window.UndercoverWords = {
  "Animaux": {
    facile: ["chat", "chien"],
    moyen: ["loup", "renard"],
    difficile: ["ocelot", "axolotl"]
  }
};
```

Ajoutez vos mots à la liste correspondant au thème et au niveau. Pour une partie bien équilibrée, chaque liste devrait proposer au moins 15 à 20 mots. Pour introduire un thème, ajoutez un objet avec les trois niveaux. Les listes fournies dans ce dossier contiennent 20 mots par combinaison. Vous pouvez aussi ajouter des paires de mots pertinentes dans `wordPairs` de `js/config.js` : le premier mot est distribué aux civils et le second aux undercover. Les paires associées ne sont pas obligatoires ; sans paire utilisable, deux mots distincts sont tirés au hasard dans la liste choisie.

Les noms, caractères HTML saisis et mots révélés sont affichés sans interprétation HTML.

## Contenu

- `index.html` : structure de l'interface et ordre de chargement.
- `css/style.css` : direction artistique crème/terracotta, responsive mobile-first.
- `js/words.js` : mots par thème et difficulté.
- `js/config.js` : réglages du jeu et paires de mots.
- `js/app.js` : configuration, distribution, révélation, minuteurs, vote, résultats et partage de liens.

Le son utilise WebAudio et la vibration l'API `navigator.vibrate` quand le navigateur les permet. Ces fonctionnalités peuvent être limitées par les réglages ou appareils. Le jeu, les rôles et les votes locaux restent utilisables sans elles.
