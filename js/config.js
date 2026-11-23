/* Configuration modifiable du jeu Undercover. */
window.UndercoverConfig = {
  minPlayers: 3,
  maxPlayers: 20,
  defaultPlayers: 5,
  defaultRoundMinutes: 8,
  defaultDebateMinutes: 3,
  maxUndercover: 5,
  palette: { terracotta: '#C96F4A', terracottaDark: '#B85C38', cream: '#F7F2EA', paper: '#FAF6EF' },
  /* Paires de mots qui partagent une idée, mais dont la différence reste jouable. */
  wordPairs: {
    facile: [['chat', 'chien', 'canidé'], ['pomme', 'poire', 'fruit à pépins'], ['football', 'rugby', 'sport collectif'], ['plage', 'piscine', 'lieu aquatique'], ['guitare', 'piano', 'instrument de musique'], ['train', 'métro', 'transport ferroviaire'], ['pizza', 'tarte', 'plat cuisiné'], ['docteur', 'infirmier', 'profession médicale']],
    moyen: [['loup', 'renard', 'canidé sauvage'], ['boulanger', 'pâtissier', 'artisan du pain'], ['thé', 'café', 'boisson chaude'], ['avion', 'hélicoptère', 'aéronef'], ['roman', 'bande dessinée', 'récit illustré'], ['tablette', 'ordinateur portable', 'appareil numérique'], ['comédie', 'film d’action', 'œuvre cinématographique'], ['tennis', 'badminton', 'sport de raquette']],
    difficile: [['lynx', 'ocelot', 'félin sauvage'], ['géologue', 'archéologue', 'science du terrain'], ['safran', 'curcuma', 'épice dorée'], ['ferry', 'paquebot', 'grand navire'], ['satire', 'parodie', 'forme comique'], ['synthétiseur', 'orgue', 'instrument à clavier'], ['cryptographie', 'stéganographie', 'science du secret'], ['escalade', 'alpinisme', 'sport vertical']]
  },
  themeHints: {
    'Animaux': 'animal',
    'Métiers': 'profession',
    'Nourriture': 'aliment',
    'Objets du quotidien': 'objet',
    'Sports': 'sport',
    'Voyages': 'voyage',
    'Célébrités': 'personnalité',
    'Cinéma': 'film',
    'Musique': 'musique',
    'Technologie': 'technologie'
  },
  /* Lors d'une partie liée par URL, les noms, rôles et mots passent en clair :
     ne partagez le lien qu'entre participants de confiance. Voir README.md. */
  linkProtocol: 'undercover-v1'
};
