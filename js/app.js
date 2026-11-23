/* Logique du jeu Undercover — JavaScript vanilla, commenté en français. */
(() => {
  'use strict';
  const cfg = window.UndercoverConfig;
  const words = window.UndercoverWords;
  const $ = (s, root = document) => root.querySelector(s);
  const app = $('#app'), setupView = $('#setupView'), gameView = $('#gameView');
  const state = { players: [], undercover: [], civilianWord: '', undercoverWord: '', theme: '', difficulty: '', mode: 'shared', revealIndex: 0, phase: 'setup', vote: '', timers: {}, intervals: {}, sound: true, roundSeconds: 0, debateSeconds: 0 };
  let toastTimer;

  // Initialise la configuration avec les thèmes réellement présents dans la bibliothèque.
  function init() {
    $('#playerCountOutput').textContent = cfg.defaultPlayers;
    $('#roundMinutes').value = cfg.defaultRoundMinutes;
    $('#debateMinutes').value = cfg.defaultDebateMinutes;
    document.documentElement.style.setProperty('--terra', cfg.palette.terracotta);
    document.documentElement.style.setProperty('--terra-dark', cfg.palette.terracottaDark);
    document.documentElement.style.setProperty('--cream', cfg.palette.cream);
    document.documentElement.style.setProperty('--paper', cfg.palette.paper);
    Object.keys(words).forEach(theme => $('#themeSelect').add(new Option(theme, theme)));
    renderNameFields(); updateUndercoverOptions();
    $('#plusPlayers').addEventListener('click', () => setPlayerCount(playerCount() + 1));
    $('#minusPlayers').addEventListener('click', () => setPlayerCount(playerCount() - 1));
    $('#playerCountOutput').addEventListener('change', e => setPlayerCount(Number(e.target.value)));
    $('#setupForm').addEventListener('submit', startGame);
    $('#soundToggle').addEventListener('click', toggleSound);
    const incoming = readSharedLink();
    if (incoming) showPrivateLinkCard(incoming);
  }
  function playerCount() { return Number($('#playerCountOutput').textContent) || cfg.defaultPlayers; }
  function setPlayerCount(n) {
    n = Math.max(cfg.minPlayers, Math.min(cfg.maxPlayers, Math.round(n || cfg.defaultPlayers)));
    const old = [...document.querySelectorAll('.name-input')].map(el => el.value);
    $('#playerCountOutput').textContent = n; renderNameFields(old); updateUndercoverOptions();
  }
  function renderNameFields(previous = []) {
    const box = $('#nameFields'), count = playerCount(); box.replaceChildren();
    for (let i = 0; i < count; i++) {
      const wrap = document.createElement('label'); wrap.className = 'name-field';
      const num = document.createElement('span'); num.textContent = String(i + 1).padStart(2, '0');
      const input = document.createElement('input'); input.className = 'name-input'; input.maxLength = 24; input.autocomplete = 'off'; input.placeholder = `Joueur ${i + 1}`; input.setAttribute('aria-label', `Nom du joueur ${i + 1}`); input.value = previous[i] || '';
      wrap.append(num, input); box.append(wrap);
    }
  }
  function updateUndercoverOptions() {
    const select = $('#undercoverCount'), old = Number(select.value) || 1; select.replaceChildren();
    const max = Math.min(cfg.maxUndercover, Math.floor((playerCount() - 1) / 2));
    for (let i = 1; i <= max; i++) select.add(new Option(`${i} undercover${i > 1 ? 's' : ''}`, String(i)));
    select.value = String(Math.min(old, max));
  }
  function startGame(event) {
    event.preventDefault();
    const names = [...document.querySelectorAll('.name-input')].map((el, i) => el.value.trim() || `Joueur ${i + 1}`);
    if (new Set(names.map(n => n.toLocaleLowerCase('fr'))).size !== names.length) { toast('Chaque joueur doit avoir un nom différent.'); return; }
    const theme = $('#themeSelect').value, difficulty = $('#difficultySelect').value;
    const available = words[theme]?.[difficulty] || [];
    if (!available.length) { toast('Aucun mot pour cette combinaison.'); return; }
    const pair = choosePair(difficulty, available);
    state.players = names.map((name, id) => ({ id, name, role: 'civil', word: pair.civilian }));
    state.undercover = shuffle(state.players).slice(0, Number($('#undercoverCount').value));
    state.undercover.forEach(p => { p.role = 'undercover'; p.word = pair.undercover; });
    state.civilianWord = pair.civilian; state.undercoverWord = pair.undercover;
    state.theme = theme; state.difficulty = difficulty; state.mode = $('input[name="mode"]:checked').value;
    state.revealIndex = 0; state.phase = state.mode === 'shared' ? 'pass' : 'links'; state.vote = '';
    state.roundSeconds = clampMinutes($('#roundMinutes').value, 8) * 60;
    state.debateSeconds = clampMinutes($('#debateMinutes').value, 3) * 60;
    clearTimers();
    if (state.mode === 'shared') renderPassScreen(); else renderLinksScreen();
  }
  function choosePair(difficulty, available) {
    const pairSet = cfg.wordPairs[difficulty] || [];
    const usable = pairSet.filter(pair => pair.every(w => available.includes(w)));
    if (usable.length) { const p = pick(usable); return { civilian: p[0], undercover: p[1] }; }
    const chosen = pick(available), others = available.filter(w => w !== chosen);
    return { civilian: chosen, undercover: others.length ? pick(others) : chosen };
  }
  function showGame(html) { setupView.classList.add('hidden'); gameView.classList.remove('hidden'); gameView.innerHTML = html; gameView.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  function gameTop(label = 'PARTIE EN COURS') { return `<div class="game-topline"><button class="game-back" type="button">← RÉGLAGES</button><span>${escapeHtml(state.theme || 'UNDERCOVER')} · ${escapeHtml(state.difficulty || '')}</span><span>${label}</span></div>`; }
  function renderPassScreen() {
    const p = state.players[state.revealIndex];
    showGame(`${gameTop('DISTRIBUTION DES RÔLES')}<section class="game-panel"><div class="game-kicker">JOUEUR ${state.revealIndex + 1} SUR ${state.players.length}</div><div class="pass-icon">↻</div><div class="game-title">Passez le téléphone</div><div class="game-subtitle">à la personne suivante, sans regarder l'écran.</div><div class="pass-name">${escapeHtml(p.name)}</div><div class="reveal-box" id="revealBox" role="button" tabindex="0" aria-label="Maintenir appuyé pour voir son rôle"><div class="reveal-content"><div class="reveal-prompt">MAINTENEZ POUR DÉCOUVRIR</div><div class="symbol">◉</div></div></div><p class="alert-note">Appuyez sans relâcher sur la carte pour révéler votre mot. Relâchez pour le masquer.</p><div class="progress-dots">${state.players.map((_, i) => `<i class="${i < state.revealIndex ? 'done' : ''}"></i>`).join('')}</div><button class="secondary-button" id="nextPlayer">${state.revealIndex === state.players.length - 1 ? 'Tout le monde a vu son mot' : 'J’ai vu mon mot — suivant'}　→</button></section>`);
    const box = $('#revealBox'); let held = false, seen = false;
    const reveal = e => { e.preventDefault(); held = true; seen = true; box.classList.add('ready'); box.innerHTML = `<div class="reveal-content"><div class="reveal-role">${p.role === 'undercover' ? 'VOTRE RÔLE · UNDERCOVER' : 'VOTRE MOT SECRET'}</div><div class="reveal-word">${p.role === 'undercover' ? escapeHtml(state.undercoverWord) : escapeHtml(p.word)}</div><div class="symbol">${p.role === 'undercover' ? 'INDICE SECRET' : '✳'}</div></div>`; };
    const hide = () => { if (!held) return; held = false; box.classList.remove('ready'); box.innerHTML = '<div class="reveal-content"><div class="reveal-prompt">MAINTENEZ POUR DÉCOUVRIR</div><div class="symbol">◉</div></div>'; $('#nextPlayer').disabled = false; };
    box.addEventListener('pointerdown', reveal); box.addEventListener('pointerup', hide); box.addEventListener('pointerleave', hide); box.addEventListener('pointercancel', hide);
    box.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') reveal(e); }); box.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') hide(); });
    $('#nextPlayer').addEventListener('click', () => { if (!seen) { toast('Maintenez la carte pour découvrir votre mot.'); return; } state.revealIndex++; if (state.revealIndex >= state.players.length) renderDebate(); else renderPassScreen(); });
    $('.game-back').addEventListener('click', confirmBack);
  }
  function renderLinksScreen() {
    const base = location.href.split('#')[0];
    const links = state.players.map((p, i) => {
      const payload = {
        protocol: cfg.linkProtocol,
        theme: state.theme,
        difficulty: state.difficulty,
        civilianWord: state.civilianWord,
        undercoverWord: state.undercoverWord,
        player: i,
        playersCount: state.players.length,
        name: p.name,
        role: p.role,
        word: p.word
      };
      return { ...p, url: `${base}#${cfg.linkProtocol}=${encodeSharedPayload(payload)}&player=${i}` };
    });
    const inaccessibleHost = ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
    const localFileWarning = location.protocol === 'file:' || inaccessibleHost
      ? `<div class="notice"><strong>Multi-appareils :</strong> ${location.protocol === 'file:' ? 'Les liens <code>file://</code>' : 'Les adresses <code>localhost</code> ou <code>127.0.0.1</code>'} ne peuvent pas être ouverts correctement sur les autres appareils. Lancez un serveur accessible sur votre réseau Wi-Fi, puis ouvrez la partie avec son adresse LAN (exemple : <code>http://192.168.1.20:8000</code>).</div>`
      : '';
    showGame(`${gameTop('DISTRIBUTION DES RÔLES')}<section class="game-panel"><div class="game-kicker">QR CODE OU LIEN PRIVÉ PAR JOUEUR</div><div class="game-title">Chacun son écran.</div><p class="game-subtitle">Faites scanner le QR ou envoyez le lien correspondant à chaque personne.</p>${localFileWarning}<div class="notice"><strong>À savoir :</strong> les rôles restent encodés dans chaque lien, sans serveur ni chiffrement. Partagez chaque QR uniquement avec son destinataire.</div><div id="playerLinks">${links.map((p, i) => `<div class="link-card"><div class="link-player">${escapeHtml(p.name)}</div><div class="qr-code" id="qr-${i}" aria-label="QR code pour ${escapeHtml(p.name)}"></div><div class="link-box" id="url-${i}">${escapeHtml(p.url)}</div><button class="secondary-button copy-link" data-index="${i}">Copier le lien de ${escapeHtml(p.name)}</button></div>`).join('')}</div><p class="alert-note">Le QR est généré localement dans le navigateur. Aucun service externe n’est appelé. Pour plusieurs appareils, chaque appareil doit joindre la même adresse hébergée sur le réseau.</p><div class="button-row"><button class="secondary-button" id="backSetup">← Modifier la partie</button><button class="primary-button" id="hostContinue">Continuer sur cet appareil　↗</button></div></section>`);
    document.querySelectorAll('.copy-link').forEach(button => button.addEventListener('click', () => copyText(links[Number(button.dataset.index)].url)));
    if (window.QRCode) {
      links.forEach((p, i) => new QRCode($(`#qr-${i}`), {
        text: p.url,
        width: 180,
        height: 180,
        colorDark: '#29251F',
        colorLight: '#FAF6EF',
        correctLevel: QRCode.CorrectLevel.M
      }));
    } else {
      toast('Générateur QR indisponible : utilisez les liens.');
    }
    $('#backSetup').addEventListener('click', confirmBack);
    $('#hostContinue').addEventListener('click', () => { state.revealIndex = 0; renderPassScreen(); });
  }
  function showPrivateLinkCard(data) {
    if (!data || data.protocol !== cfg.linkProtocol || !Number.isInteger(data.player) || typeof data.name !== 'string') return;
    const isUndercover = data.role === 'undercover';
    state.theme = data.theme; state.difficulty = data.difficulty; state.civilianWord = data.civilianWord; state.undercoverWord = data.undercoverWord;
    state.phase = 'private';
    showGame(`${gameTop('VOTRE CARTE PRIVÉE')}<section class="game-panel"><div class="game-kicker">JOUEUR • ${data.player + 1}${data.playersCount ? ` SUR ${data.playersCount}` : ''}</div><div class="game-title">Bonjour, ${escapeHtml(data.name)}.</div><p class="game-subtitle">Les autres ne doivent pas voir votre écran.</p><div class="reveal-box ready" style="cursor:default"><div class="reveal-content"><div class="reveal-role">${isUndercover ? 'VOTRE RÔLE · UNDERCOVER' : 'VOTRE MOT SECRET'}</div><div class="reveal-word">${isUndercover ? escapeHtml(data.undercoverWord) : escapeHtml(data.word)}</div><div class="symbol">${isUndercover ? 'INDICE SECRET' : '✳'}</div></div></div><div class="notice">${isUndercover ? 'Votre mot d’indice est votre mot undercover. Ne révélez pas votre rôle.' : 'Retenez votre mot secret puis fermez cet écran.'} Les informations sont encodées dans le lien, pas chiffrées.</div><button class="secondary-button" id="closePrivate">Masquer mon rôle</button></section>`);
    $('#closePrivate').addEventListener('click', () => { history.replaceState(null, '', location.href.split('#')[0]); gameView.classList.add('hidden'); setupView.classList.remove('hidden'); toast('Votre rôle est masqué.'); });
  }
  function readSharedLink() {
    const hash = location.hash;
    const escapedProtocol = cfg.linkProtocol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = hash.match(new RegExp(`^#${escapedProtocol}=([^&]+)&player=(\\d+)$`));
    if (!match) return null;
    try { return { ...decodeSharedPayload(match[1]), player: Number(match[2]) }; } catch { return null; }
  }
  function renderDebate() {
    state.phase = 'debate'; state.roundSeconds = clampMinutes($('#roundMinutes')?.value, state.roundSeconds / 60 || 8) * 60;
    state.debateSeconds = clampMinutes($('#debateMinutes')?.value, state.debateSeconds / 60 || 3) * 60;
    showGame(`${gameTop('PHASE DE DISCUSSION')}<section class="game-panel"><div class="game-kicker">ÉCHANGEZ VOS SOUPÇONS</div><div class="game-title">Qui ne dit pas<br>le bon mot ?</div><p class="game-subtitle">Un indice à la fois. Restez vagues, mais convaincants.</p><div class="timer-grid"><div class="timer-card" id="roundCard"><div class="timer-label">TEMPS DE LA MANCHE</div><div class="timer-time" id="roundClock">${formatTime(state.roundSeconds)}</div><button class="secondary-button" id="roundToggle">▶ Démarrer</button></div><div class="timer-card" id="debateCard"><div class="timer-label">PHASE DE DÉBAT</div><div class="timer-time" id="debateClock">${formatTime(state.debateSeconds)}</div><button class="secondary-button" id="debateToggle">▶ Démarrer</button></div></div><p class="alert-note">Les deux comptes à rebours sont réglables avant la partie. La fin du débat vous emmène au vote ; la fin de manche déclenche une alerte.</p><div class="button-row"><button class="primary-button" id="goVote">Passer au vote　→</button></div></section>`);
    $('#roundToggle').addEventListener('click', () => toggleTimer('round'));
    $('#debateToggle').addEventListener('click', () => toggleTimer('debate'));
    $('#goVote').addEventListener('click', renderVote);
    $('.game-back').addEventListener('click', confirmBack);
  }
  function toggleTimer(which) {
    const button = $(`#${which}Toggle`);
    if (state.intervals[which]) { clearInterval(state.intervals[which]); state.intervals[which] = null; button.textContent = '▶ Reprendre'; return; }
    if (which === 'debate' && state.debateSeconds <= 0) { renderVote(); return; }
    if (which === 'round' && state.roundSeconds <= 0) return;
    button.textContent = 'Ⅱ Pause';
    state.intervals[which] = setInterval(() => {
      const key = which === 'round' ? 'roundSeconds' : 'debateSeconds'; state[key]--;
      const clock = $(`#${which}Clock`), card = $(`#${which}Card`); if (clock) clock.textContent = formatTime(state[key]);
      if (state[key] <= 10 && card) card.classList.add('urgent');
      if (state[key] <= 0) {
        clearInterval(state.intervals[which]); state.intervals[which] = null;
        if (button) button.textContent = which === 'debate' ? 'Débat terminé' : 'Manche terminée';
        notifyEnd(which);
        if (which === 'debate') setTimeout(() => { if (state.phase === 'debate') renderVote(); }, 1000);
      }
    }, 1000);
  }
  function renderVote() {
    clearTimers(); state.phase = 'vote'; state.vote = '';
    showGame(`${gameTop('VOTE')}<section class="game-panel"><div class="game-kicker">LE MOMENT DE VÉRITÉ</div><div class="game-title">Qui éliminez-vous ?</div><p class="game-subtitle">Votez ensemble pour la personne que vous soupçonnez.</p><div class="vote-list">${state.players.map(p => `<label class="vote-option"><input type="radio" name="vote" value="${p.id}"><b>${escapeHtml(p.name)}</b><small>${state.undercover.some(u => u.id === p.id) ? '' : ''}</small></label>`).join('')}</div><p class="alert-note">Le vote est collectif : choisissez une personne, puis découvrez les identités.</p><div class="button-row"><button class="secondary-button" id="skipVote">Ne pas voter</button><button class="primary-button" id="submitVote">Révéler les rôles　↗</button></div></section>`);
    document.querySelectorAll('input[name="vote"]', gameView).forEach(input => {
      input.addEventListener('change', e => { state.vote = e.target.value; });
    });
    $('#submitVote').addEventListener('click', () => { if (state.vote === '') { toast('Choisissez une personne ou passez le vote.'); return; } renderResults(); });
    $('#skipVote').addEventListener('click', renderResults);
    $('.game-back').addEventListener('click', confirmBack);
  }
  function renderResults() {
    clearTimers(); state.phase = 'results';
    const voted = state.vote === '' ? null : state.players[Number(state.vote)];
    const suspects = state.players.filter(p => p.role === 'undercover');
    showGame(`${gameTop('FIN DE MANCHE')}<section class="game-panel"><div class="game-kicker">LES MASQUES TOMBENT</div><div class="game-title">${voted ? (voted.role === 'undercover' ? 'Bien démasqué !' : 'Mauvaise piste…') : 'La vérité éclate.'}</div><p class="game-subtitle">${voted ? `${escapeHtml(voted.name)} a été choisi·e par le groupe.` : 'Vous avez choisi de ne pas voter.'}</p><div class="result-word">Mot des civils : ${escapeHtml(state.civilianWord)}</div><p class="game-subtitle">Les undercover avaient le mot « ${escapeHtml(state.undercoverWord)} ».</p><ul class="result-list">${state.players.map(p => `<li><span>${escapeHtml(p.name)}</span><span class="role-chip ${p.role === 'civil' ? 'civil' : ''}">${p.role === 'undercover' ? 'UNDERCOVER' : 'CIVIL'}</span></li>`).join('')}</ul><p class="alert-note">${suspects.length} undercover${suspects.length > 1 ? 's' : ''} dans la partie.</p><div class="button-row"><button class="secondary-button" id="backSetup">← Modifier les réglages</button><button class="primary-button" id="playAgain">Rejouer　↗</button></div></section>`);
    $('#backSetup').addEventListener('click', backToSetup);
    $('#playAgain').addEventListener('click', () => { backToSetup(); setTimeout(() => $('#setupForm').requestSubmit(), 0); });
    $('.game-back').addEventListener('click', confirmBack);
  }
  function backToSetup() { clearTimers(); gameView.classList.add('hidden'); setupView.classList.remove('hidden'); state.phase = 'setup'; history.replaceState(null, '', location.href.split('#')[0]); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function confirmBack() { if (confirm('Revenir aux réglages ? La partie en cours sera abandonnée.')) backToSetup(); }
  function clearTimers() { Object.values(state.intervals).forEach(id => clearInterval(id)); state.intervals = {}; }
  function formatTime(n) { const m = Math.floor(Math.max(0, n) / 60), s = Math.max(0, n) % 60; return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
  function clampMinutes(raw, fallback) { const n = Number(raw); return Math.max(1, Math.min(30, Math.round(Number.isFinite(n) && n > 0 ? n : fallback))); }
  function notifyEnd(which) {
    const label = which === 'debate' ? 'Temps du débat écoulé !' : 'Temps de la manche écoulé !'; toast(label); if (state.sound) playAlert();
    if (navigator.vibrate) navigator.vibrate([180, 80, 180]);
  }
  function playAlert() { try { const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return; const ctx = new Ctx(); [660, 880, 660].forEach((hz, i) => { const osc = ctx.createOscillator(), gain = ctx.createGain(); osc.frequency.value = hz; osc.type = 'sine'; gain.gain.setValueAtTime(.0001, ctx.currentTime + i * .16); gain.gain.exponentialRampToValueAtTime(.12, ctx.currentTime + i * .16 + .02); gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + i * .16 + .13); osc.connect(gain); gain.connect(ctx.destination); osc.start(ctx.currentTime + i * .16); osc.stop(ctx.currentTime + i * .16 + .14); }); setTimeout(() => ctx.close(), 900); } catch { /* audio indisponible : l'alerte visuelle reste active */ } }
  function toggleSound() { state.sound = !state.sound; $('#soundToggle').textContent = state.sound ? '♫' : '♪'; $('#soundToggle').setAttribute('aria-label', state.sound ? 'Désactiver le son' : 'Activer le son'); toast(state.sound ? 'Son activé.' : 'Son désactivé.'); }
  function encodeSharedPayload(payload) {
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  function decodeSharedPayload(encoded) {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return JSON.parse(new TextDecoder('utf-8').decode(bytes));
  }
  async function copyText(text) { try { await navigator.clipboard.writeText(text); toast('Lien copié dans le presse-papiers.'); } catch { const area = document.createElement('textarea'); area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.append(area); area.select(); try { document.execCommand('copy'); toast('Lien copié dans le presse-papiers.'); } catch { toast('Copie impossible : sélectionnez et copiez l’URL affichée.'); } area.remove(); } }
  function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600); }
  function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function escapeHtml(v) { return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  init();
})();
