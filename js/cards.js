(() => {
  'use strict';

  const cfg = window.UndercoverConfig;
  const words = window.UndercoverWords;
  const $ = selector => document.querySelector(selector);
  const themeFilter = $('#themeFilter');
  const difficultyFilter = $('#difficultyFilter');
  const grid = $('#cardsGrid');
  const count = $('#cardsCount');

  themeFilter.add(new Option('Tous les thèmes', 'all'));
  Object.keys(words).forEach(theme => themeFilter.add(new Option(theme, theme)));

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function pairData(theme, difficulty) {
    const pairs = cfg.wordPairs[difficulty] || [];
    const available = words[theme]?.[difficulty] || [];
    return pairs
      .filter(pair => pair.slice(0, 2).every(word => available.includes(word)))
      .map(pair => ({ word: pair[1], hint: pair[2] || cfg.themeHints[theme] || 'mot apparenté', civilWord: pair[0] }));
  }

  function fallbackCards(theme, difficulty) {
    const available = words[theme]?.[difficulty] || [];
    const pairs = pairData(theme, difficulty);
    const pairedWords = new Set(pairs.flatMap(pair => [pair.word, pair.civilWord]));
    return available
      .filter(word => !pairedWords.has(word))
      .map(word => ({ word, hint: cfg.themeHints[theme] || 'mot apparenté', civilWord: '' }));
  }

  function render() {
    const selectedTheme = themeFilter.value;
    const selectedDifficulty = difficultyFilter.value;
    const themes = selectedTheme === 'all' ? Object.keys(words) : [selectedTheme];
    const difficulties = selectedDifficulty === 'all'
      ? ['facile', 'moyen', 'difficile']
      : [selectedDifficulty];

    const cards = [];
    themes.forEach(theme => {
      difficulties.forEach(difficulty => {
        cards.push(...pairData(theme, difficulty).map(card => ({ ...card, theme, difficulty })));
        cards.push(...fallbackCards(theme, difficulty).map(card => ({ ...card, theme, difficulty })));
      });
    });

    count.textContent = `${cards.length} carte${cards.length > 1 ? 's' : ''}`;
    grid.innerHTML = cards.map(card => `
      <article class="word-card">
        <div class="word-card-top">
          <span>${escapeHtml(card.theme)}</span>
          <span>${escapeHtml(card.difficulty)}</span>
        </div>
        <div class="word-card-body">
          <small>MOT UNDERCOVER</small>
          <h2>${escapeHtml(card.word)}</h2>
          ${card.civilWord ? `<p><span>Civil :</span> ${escapeHtml(card.civilWord)}</p>` : ''}
        </div>
        <div class="word-card-hint">
          <small>INDICE</small>
          <strong>${escapeHtml(card.hint)}</strong>
        </div>
      </article>
    `).join('');
  }

  themeFilter.addEventListener('change', render);
  difficultyFilter.addEventListener('change', render);
  render();
})();
