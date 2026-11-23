# Undercover — jeu du mot caché

Jeu de bluff et de déduction autonome, en HTML/CSS/JavaScript vanilla. Aucune bibliothèque, police, image ou requête réseau n'est nécessaire pour jouer hors-ligne.

## Lancer une partie

1. Décompressez le dossier téléchargé en conservant son arborescence.
2. Ouvrez `index.html` dans un navigateur récent (téléphone, tablette ou ordinateur).
3. Choisissez le nombre de joueurs, les noms, le nombre d'undercover, le thème, la difficulté, le mode de distribution et les minuteurs.
4. En mode téléphone partagé, passez l'appareil à chaque joueur. Pour voir son information, il maintient le doigt sur la carte ; celle-ci se masque au relâchement.

Si le navigateur restreint certaines fonctions lorsqu'on ouvre un fichier directement, un serveur local est également possible depuis le dossier :

```sh
python3 -m http.server 8000
```

Puis ouvrez `http://localhost:8000`.

## Modes de distribution

- **Téléphone partagé** : les rôles sont révélés un à un par appui maintenu, puis masqués au relâchement. C'est le mode recommandé pour jouer immédiatement hors-ligne.
- **Un téléphone chacun** : le jeu prépare une URL privée par participant, avec bouton de copie et URL de secours affichée. Cette édition n'intègre pas de générateur QR. Il n'y a pas de serveur de synchronisation : pour le jeu en équipe sur plusieurs appareils, les liens doivent être envoyés manuellement et chaque appareil doit accéder à la même installation/page. Les minuteries et votes restent gérés sur l'appareil hôte ; l'écran individuel ne synchronise pas le jeu.

**Confidentialité :** le mode multi-appareil autonome encode les rôles et les mots dans le fragment d'URL en clair (base64 n'est pas du chiffrement). Une personne qui inspecte le lien ou sa page peut voir l'information. Partagez seulement chaque lien avec son destinataire. Pour une vraie confidentialité/synchronisation à distance, il faut ajouter un serveur ou un protocole de partage sécurisé.

## Personnaliser les règles

Modifiez `js/config.js` :

- `minPlayers`, `maxPlayers`, `defaultPlayers` règlent la plage de joueurs.
- `defaultRoundMinutes`, `defaultDebateMinutes` règlent les minuteries par défaut.
- `maxUndercover` fixe le plafond configurable. Le jeu conserve au moins un civil et limite le nombre d'undercover à la moitié des joueurs (arrondi inférieur).
- `wordPairs` fournit des paires suggérées par niveau : mot des civils puis mot des undercover. Les paires doivent exister dans la liste du thème/niveau retenu ; sinon le jeu tire deux mots de cette liste.
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
