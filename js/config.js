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
    facile: [['chat', 'chien'], ['pomme', 'poire'], ['football', 'rugby'], ['plage', 'piscine'], ['guitare', 'piano'], ['train', 'métro'], ['pizza', 'tarte'], ['docteur', 'infirmier']],
    moyen: [['loup', 'renard'], ['boulanger', 'pâtissier'], ['thé', 'café'], ['avion', 'hélicoptère'], ['roman', 'bande dessinée'], ['tablette', 'ordinateur portable'], ['comédie', 'film d’action'], ['tennis', 'badminton']],
    difficile: [['lynx', 'ocelot'], ['géologue', 'archéologue'], ['safran', 'curcuma'], ['ferry', 'paquebot'], ['satire', 'parodie'], ['synthétiseur', 'orgue'], ['cryptographie', 'stéganographie'], ['escalade', 'alpinisme']]
  },
  /* Lors d'une partie liée par URL, les noms, rôles et mots passent en clair :
     ne partagez le lien qu'entre participants de confiance. Voir README.md. */
  linkProtocol: 'undercover-v1'
};
