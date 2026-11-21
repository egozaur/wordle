(function () {
'use strict';

/* ================= DANE / KONFIG ================= */
const MAX_TRIES = 6;
const LAUNCH_DAY = Date.UTC(2026, 0, 1) / 86400000; // numer dnia #1
const AVAILABLE_LENGTHS = [5];                       // 6 i 7 dojdą później

const LANGS = {
  pl: {
    data: window.WORDS_PL,
    alphabet: 'AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ'.split(''),
    rows: [
      ['Ą','Ć','Ę','Ł','Ń','Ó','Ś','Ź','Ż'],
      ['W','E','R','T','Y','U','I','O','P'],
      ['A','S','D','F','G','H','J','K','L'],
      ['ENTER','Z','C','B','N','M','BACK']
    ],
    seed: 1101
  },
  en: {
    data: window.WORDS_EN,
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    rows: [
      ['Q','W','E','R','T','Y','U','I','O','P'],
      ['A','S','D','F','G','H','J','K','L'],
      ['ENTER','Z','X','C','V','B','N','M','BACK']
    ],
    seed: 2202
  }
};

const I18N = {
  pl: {
    tagline: 'Zgadnij słowo w 6 próbach.',
    language: 'Język', letters: 'Liczba liter',
    daily: 'Słowo dnia', practice: 'Graj dalej',
    practiceSub: 'Dowolna liczba gier – nie wlicza się do rankingu',
    dailyNew: 'Nowe słowo czeka na Ciebie', dailyWon: 'Rozwiązane dziś ✓', dailyLost: 'Dzisiejsze słowo już za Tobą',
    dailyProgress: 'Dokończ dzisiejszą grę',
    stats: 'Statystyki', howto: 'Jak grać', settings: 'Ustawienia',
    soon: 'Dłuższe słowa już wkrótce!',
    notEnough: 'Za mało liter', notInList: 'Nie ma takiego słowa', copied: 'Skopiowano wyniki!',
    praise: ['Genialnie!', 'Niesamowite!', 'Świetnie!', 'Super!', 'Brawo!', 'Uff, udało się!'],
    played: 'Gry', winPct: '% wygranych', streak: 'Seria', maxStreak: 'Najlepsza seria',
    dist: 'Rozkład prób', share: 'Udostępnij', playOn: 'Graj dalej', nextWord: 'Następne słowo',
    nextIn: 'Następne słowo za', theWordWas: 'Szukane słowo', menu: 'Menu',
    practiceNote: 'Gra treningowa – nie liczy się do statystyk.',
    hard: 'Tryb trudny', hardSub: 'Znalezione podpowiedzi musisz użyć w kolejnych próbach.',
    hardLocked: 'Tryb trudny można zmienić tylko przed pierwszą próbą.',
    dark: 'Motyw', contrast: 'Wysoki kontrast', contrastSub: 'Kolory pomarańczowy i niebieski dla daltonistów.',
    themeAuto: 'Auto', themeLight: 'Jasny', themeDark: 'Ciemny',
    mustUse: (l, p) => `${p}. litera musi być ${l}`, mustContain: l => `Słowo musi zawierać ${l}`,
    fineDaily: 'Statystyki i seria liczą się tylko ze słowa dnia.',
    howBody: `<p>Zgadnij <b>WORDLE</b> w 6 próbach.</p>
      <p>Każda próba musi być prawdziwym słowem o wskazanej długości. Naciśnij ENTER, aby ją sprawdzić.</p>
      <p>Po każdej próbie kolor kafelka pokaże, jak blisko jesteś.</p>`,
    exG: 'Litera jest w słowie i na dobrym miejscu.', exY: 'Litera jest w słowie, ale na złym miejscu.', exA: 'Tej litery nie ma w słowie.',
    howExamples: 'Przykłady',
    howTail: '<p>Nowe słowo dnia pojawia się o północy. W polskiej wersji ą, ć, ę, ł, ń, ó, ś, ź, ż są osobnymi literami.</p>',
    letterWord: n => `${n} liter`
  },
  en: {
    tagline: 'Guess the word in 6 tries.',
    language: 'Language', letters: 'Word length',
    daily: 'Word of the day', practice: 'Play on',
    practiceSub: 'Unlimited games – not counted in your stats',
    dailyNew: 'A new word is waiting', dailyWon: 'Solved today ✓', dailyLost: "Today's word is behind you",
    dailyProgress: "Finish today's game",
    stats: 'Statistics', howto: 'How to play', settings: 'Settings',
    soon: 'Longer words coming soon!',
    notEnough: 'Not enough letters', notInList: 'Not in word list', copied: 'Results copied!',
    praise: ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'],
    played: 'Played', winPct: 'Win %', streak: 'Streak', maxStreak: 'Max streak',
    dist: 'Guess distribution', share: 'Share', playOn: 'Play on', nextWord: 'Next word',
    nextIn: 'Next word in', theWordWas: 'The word was', menu: 'Menu',
    practiceNote: 'Practice game – not counted in your stats.',
    hard: 'Hard mode', hardSub: 'Any revealed hints must be used in subsequent guesses.',
    hardLocked: 'Hard mode can only be changed before your first guess.',
    dark: 'Theme', contrast: 'High contrast', contrastSub: 'Orange and blue colours for colour-blind players.',
    themeAuto: 'Auto', themeLight: 'Light', themeDark: 'Dark',
    mustUse: (l, p) => `${p}${['st','nd','rd'][p-1]||'th'} letter must be ${l}`, mustContain: l => `Guess must contain ${l}`,
    fineDaily: 'Stats and streak count only the word of the day.',
    howBody: `<p>Guess the <b>WORDLE</b> in 6 tries.</p>
      <p>Each guess must be a valid word of the given length. Hit ENTER to submit.</p>
      <p>After each guess, the colour of the tiles shows how close you are.</p>`,
    exG: 'The letter is in the word and in the correct spot.', exY: 'The letter is in the word but in the wrong spot.', exA: 'The letter is not in the word.',
    howExamples: 'Examples',
    howTail: '<p>A new word of the day appears at midnight.</p>',
    letterWord: n => `${n} letters`
  }
};

/* ================= NARZĘDZIA ================= */
const $ = s => document.querySelector(s);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function seededOrder(arr, seed) { const a = arr.slice(), r = mulberry32(seed); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function todayIndex() { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); }
function dailyWord(lang) { const L = LANGS[lang], order = seededOrder(L.data.answers, L.seed); return order[((todayIndex() % order.length) + order.length) % order.length]; }

/* ================= USTAWIENIA ================= */
const settings = Object.assign({ lang: (navigator.language || '').toLowerCase().startsWith('pl') ? 'pl' : 'en', len: 5, theme: 'auto', contrast: false, hard: false }, store.get('wordle:settings', {}));
function saveSettings() { store.set('wordle:settings', settings); }
function applyTheme() {
  const dark = settings.theme === 'dark' || (settings.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.contrast = settings.contrast ? '1' : '0';
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = dark ? '#121213' : '#ffffff';
}
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);
const t = () => I18N[settings.lang];

/* ================= STATYSTYKI ================= */
const statsKey = () => `wordle:stats:${settings.lang}:${settings.len}`;
const dayKey = () => `wordle:daily:${settings.lang}:${settings.len}:${todayIndex()}`;
function getStats() { return store.get(statsKey(), { played: 0, wins: 0, streak: 0, max: 0, dist: [0, 0, 0, 0, 0, 0], last: -1 }); }

/* ================= STAN GRY ================= */
let G = null; // { mode, answer, guesses:[], current:'', status, locked, keyState:{} }
let modalOpen = false;
let countdownTimer = null;

function newGame(mode) {
  const L = LANGS[settings.lang];
  let answer, guesses = [], status = 'playing';
  if (mode === 'daily') {
    answer = dailyWord(settings.lang);
    const saved = store.get(dayKey(), null);
    if (saved) { guesses = saved.guesses; status = saved.status; }
  } else {
    const today = dailyWord(settings.lang);
    const pool = L.data.answers.filter(w => w !== today);
    answer = pool[Math.floor(Math.random() * pool.length)];
  }
  G = { mode, answer, guesses, current: '', status, locked: false, keyState: {}, hardOn: settings.hard };
  G.guesses.forEach(g => mergeKeys(g, evaluate(g, answer)));
}

function evaluate(guess, answer) {
  const n = guess.length, res = Array(n).fill('absent'), left = {};
  for (let i = 0; i < n; i++) { if (guess[i] === answer[i]) res[i] = 'correct'; else left[answer[i]] = (left[answer[i]] || 0) + 1; }
  for (let i = 0; i < n; i++) { if (res[i] === 'correct') continue; if (left[guess[i]] > 0) { res[i] = 'present'; left[guess[i]]--; } }
  return res;
}
const RANK = { absent: 1, present: 2, correct: 3 };
function mergeKeys(guess, res) { for (let i = 0; i < guess.length; i++) { const c = guess[i], cur = G.keyState[c]; if (!cur || RANK[res[i]] > RANK[cur]) G.keyState[c] = res[i]; } }

function hardCheck(guess) {
  if (!G.hardOn || !G.guesses.length) return null;
  const prev = G.guesses[G.guesses.length - 1], res = evaluate(prev, G.answer);
  for (let i = 0; i < prev.length; i++) if (res[i] === 'correct' && guess[i] !== prev[i]) return t().mustUse(prev[i], i + 1);
  const need = {}; res.forEach((r, i) => { if (r !== 'absent') need[prev[i]] = (need[prev[i]] || 0) + 1; });
  const have = {}; for (const c of guess) have[c] = (have[c] || 0) + 1;
  for (const c in need) if ((have[c] || 0) < need[c]) return t().mustContain(c);
  return null;
}

/* ================= WIDOKI ================= */
function show(screen) { $('#home').hidden = screen !== 'home'; $('#game').hidden = screen !== 'game'; }

function renderHome() {
  document.documentElement.lang = settings.lang;
  document.querySelectorAll('[data-i18n]').forEach(n => n.textContent = t()[n.dataset.i18n]);
  document.querySelectorAll('#langSeg button').forEach(b => b.classList.toggle('on', b.dataset.lang === settings.lang));
  document.querySelectorAll('#lenChips .chip').forEach(b => b.classList.toggle('on', +b.dataset.len === settings.len));
  const saved = store.get(dayKey(), null);
  $('#dailySub').textContent = !saved ? t().dailyNew : saved.status === 'won' ? t().dailyWon : saved.status === 'lost' ? t().dailyLost : t().dailyProgress;
}

function buildBoard() {
  const b = $('#board'); b.innerHTML = ''; b.style.setProperty('--len', settings.len);
  for (let r = 0; r < MAX_TRIES; r++) {
    const row = el('div', 'row');
    for (let c = 0; c < settings.len; c++) row.appendChild(el('div', 'tile'));
    b.appendChild(row);
  }
}
function buildKeyboard() {
  const kb = $('#keyboard'); kb.innerHTML = '';
  LANGS[settings.lang].rows.forEach((row, ri) => {
    const r = el('div', 'krow' + (settings.lang === 'pl' && ri === 0 ? ' pl-extra' : ''));
    row.forEach(k => {
      const b = el('button', 'key' + (k.length > 1 ? ' wide' : ''), k === 'BACK' ? '⌫' : k === 'ENTER' ? (settings.lang === 'pl' ? 'ENTER' : 'ENTER') : k);
      b.dataset.key = k; b.type = 'button'; b.setAttribute('aria-label', k);
      r.appendChild(b);
    });
    kb.appendChild(r);
  });
}
function paintKeys() {
  document.querySelectorAll('.key').forEach(k => { const s = G.keyState[k.dataset.key]; if (s) k.dataset.state = s; else delete k.dataset.state; });
}
const rowEl = i => $('#board').children[i];
function tileEl(r, c) { return rowEl(r).children[c]; }
function paintRow(r, word) { for (let c = 0; c < settings.len; c++) { const tl = tileEl(r, c), ch = word[c] || ''; tl.textContent = ch; if (ch) tl.dataset.filled = '1'; else delete tl.dataset.filled; } }

function startGame(mode) {
  newGame(mode); show('game');
  $('#gameSub').textContent = `${mode === 'daily' ? t().daily : t().practice} · ${t().letterWord(settings.len)}`;
  $('#gameTitle').textContent = 'Wordle' + (settings.lang === 'pl' ? ' PL' : ' EN');
  buildBoard(); buildKeyboard();
  G.guesses.forEach((g, r) => { paintRow(r, g); const res = evaluate(g, G.answer); res.forEach((s, c) => tileEl(r, c).dataset.state = s); });
  paintKeys();
  if (G.status !== 'playing') setTimeout(() => openResult(), 400);
}

/* ================= WEJŚCIE ================= */
function toast(msg, ms = 1500) {
  const d = el('div', 'toast', msg); $('#toasts').prepend(d);
  setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 320); }, ms);
}
function typeLetter(ch) {
  if (!G || G.locked || G.status !== 'playing' || G.current.length >= settings.len) return;
  G.current += ch; const r = G.guesses.length, c = G.current.length - 1, tl = tileEl(r, c);
  tl.textContent = ch; tl.dataset.filled = '1'; tl.classList.remove('pop'); void tl.offsetWidth; tl.classList.add('pop');
}
function backspace() {
  if (!G || G.locked || G.status !== 'playing' || !G.current.length) return;
  const tl = tileEl(G.guesses.length, G.current.length - 1); tl.textContent = ''; delete tl.dataset.filled; tl.classList.remove('pop');
  G.current = G.current.slice(0, -1);
}
function shake(msg) { const r = rowEl(G.guesses.length); r.classList.remove('shake'); void r.offsetWidth; r.classList.add('shake'); toast(msg); }

async function submit() {
  if (!G || G.locked || G.status !== 'playing') return;
  if (G.current.length < settings.len) return shake(t().notEnough);
  const guess = G.current, data = LANGS[settings.lang].data;
  if (!data.allowed.includes(guess) && !data.answers.includes(guess)) return shake(t().notInList);
  const hm = hardCheck(guess); if (hm) return shake(hm);

  G.locked = true;
  const r = G.guesses.length, res = evaluate(guess, G.answer);
  G.guesses.push(guess); G.current = '';
  // animacja odsłaniania
  await Promise.all(res.map((s, c) => (async () => {
    await sleep(c * 300);
    const tl = tileEl(r, c); tl.classList.add('flip-in'); await sleep(250);
    tl.dataset.state = s; tl.classList.remove('flip-in'); tl.classList.add('flip-out'); await sleep(250);
    tl.classList.remove('flip-out');
  })()));
  mergeKeys(guess, res); paintKeys();

  const won = guess === G.answer;
  G.status = won ? 'won' : G.guesses.length >= MAX_TRIES ? 'lost' : 'playing';
  if (G.mode === 'daily') store.set(dayKey(), { guesses: G.guesses, status: G.status });
  if (G.status !== 'playing') finish(won, r);
  G.locked = false;
}

async function finish(won, row) {
  if (G.mode === 'daily') updateStats(won, row + 1);
  if (won) {
    toast(t().praise[row], 1800);
    for (let c = 0; c < settings.len; c++) { const tl = tileEl(row, c); setTimeout(() => tl.classList.add('bounce'), c * 100); }
    await sleep(1800);
  } else { toast(G.answer, 3500); await sleep(1500); }
  openResult();
}
function updateStats(won, tries) {
  const s = getStats(), today = todayIndex();
  s.played++; if (won) { s.wins++; s.streak = (s.last === today - 1 ? s.streak : 0) + 1; s.max = Math.max(s.max, s.streak); s.dist[tries - 1]++; } else s.streak = 0;
  s.last = today; store.set(statsKey(), s);
}

/* ================= MODALE ================= */
function openModal(html, onClose) {
  $('#modalBody').innerHTML = ''; if (typeof html === 'string') $('#modalBody').innerHTML = html; else $('#modalBody').appendChild(html);
  $('#modal').hidden = false; modalOpen = true; $('#modal')._onClose = onClose;
}
function closeModal() {
  $('#modal').hidden = true; modalOpen = false; clearInterval(countdownTimer);
  const f = $('#modal')._onClose; $('#modal')._onClose = null; if (f) f();
}
function statsHTML() {
  const s = getStats(), max = Math.max(1, ...s.dist), pct = s.played ? Math.round(s.wins / s.played * 100) : 0;
  const lastRow = G && G.mode === 'daily' && G.status === 'won' ? G.guesses.length - 1 : -1;
  return `<h2>${t().stats} · ${settings.lang.toUpperCase()} ${settings.len}</h2>
    <div class="stat-grid"><div><b>${s.played}</b><span>${t().played}</span></div><div><b>${pct}</b><span>${t().winPct}</span></div>
    <div><b>${s.streak}</b><span>${t().streak}</span></div><div><b>${s.max}</b><span>${t().maxStreak}</span></div></div>
    <h3>${t().dist}</h3><div class="dist">${s.dist.map((n, i) => `<div><span>${i + 1}</span><span class="bar-fill ${i === lastRow ? 'hl' : ''}" style="width:${Math.max(7, n / max * 100)}%">${n}</span></div>`).join('')}</div>
    <p class="fine">${t().fineDaily}</p>`;
}
function shareText() {
  const hc = settings.contrast;
  const em = { correct: hc ? '🟧' : '🟩', present: hc ? '🟦' : '🟨', absent: document.documentElement.dataset.theme === 'dark' ? '⬛' : '⬜' };
  const n = todayIndex() - LAUNCH_DAY + 1;
  const head = `Wordle ${settings.lang.toUpperCase()} ${settings.len} #${n} ${G.status === 'won' ? G.guesses.length : 'X'}/${MAX_TRIES}${G.hardOn ? '*' : ''}`;
  return head + '\n\n' + G.guesses.map(g => evaluate(g, G.answer).map(s => em[s]).join('')).join('\n');
}
async function share() {
  const text = shareText();
  try { if (navigator.share) { await navigator.share({ text }); return; } } catch (e) { if (e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(text); toast(t().copied); }
  catch (e) { const ta = el('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast(t().copied); } catch (_) {} ta.remove(); }
}
function openResult() {
  const box = el('div'), won = G.status === 'won', daily = G.mode === 'daily';
  box.innerHTML = (daily ? statsHTML() : `<h2>${won ? t().praise[Math.min(G.guesses.length - 1, 5)] : t().theWordWas}</h2><p class="fine" style="margin:0 0 10px">${t().practiceNote}</p>`)
    + `<div class="result-word">${won && !daily ? '' : G.answer}</div>`
    + (daily ? `<div class="next-in">${t().nextIn}<b id="cd">--:--:--</b></div>` : '')
    + `<div class="actions"></div>`;
  const acts = box.querySelector('.actions');
  if (daily) { const b = el('button', 'btn green', t().share); b.onclick = share; acts.appendChild(b); }
  const more = el('button', 'btn' + (daily ? '' : ' green'), daily ? t().playOn : t().nextWord);
  more.onclick = () => { closeModal(); startGame('practice'); }; acts.appendChild(more);
  const menu = el('button', 'btn ghost', t().menu); menu.onclick = () => { closeModal(); goHome(); }; acts.appendChild(menu);
  openModal(box);
  if (daily) { const tick = () => { const n = new Date(), m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1), d = Math.max(0, m - n); const p = x => String(x).padStart(2, '0'); const c = $('#cd'); if (c) c.textContent = `${p(Math.floor(d / 36e5))}:${p(Math.floor(d / 6e4) % 60)}:${p(Math.floor(d / 1e3) % 60)}`; if (d <= 0) location.reload(); }; tick(); countdownTimer = setInterval(tick, 1000); }
}
function openStats() { openModal(statsHTML()); }
function openHelp() {
  const s = (ch, st) => `<div class="tile" data-state="${st || ''}" ${ch ? 'data-filled="1"' : ''}>${ch}</div>`;
  const w1 = settings.lang === 'pl' ? ['K', 'R', 'O', 'W', 'A'] : ['W', 'E', 'A', 'R', 'Y'];
  const w2 = settings.lang === 'pl' ? ['M', 'Ó', 'Z', 'G', 'I'] : ['P', 'I', 'L', 'L', 'S'];
  const w3 = settings.lang === 'pl' ? ['Ś', 'N', 'I', 'E', 'G'] : ['V', 'A', 'G', 'U', 'E'];
  const ex = (w, i, st) => `<div class="ex">${w.map((c, k) => s(c, k === i ? st : '')).join('')}</div>`;
  openModal(`<h2>${t().howto}</h2>${t().howBody}<h3>${t().howExamples}</h3>
    ${ex(w1, 0, 'correct')}<p>${t().exG}</p>${ex(w2, 1, 'present')}<p>${t().exY}</p>${ex(w3, 3, 'absent')}<p>${t().exA}</p>${t().howTail}`);
}
function openSettings() {
  const box = el('div'), locked = G && G.guesses.length > 0 && G.status === 'playing' && !$('#game').hidden;
  const render = () => {
    box.innerHTML = `<h2>${t().settings}</h2>
      <div class="setting"><div>${t().hard}<small>${t().hardSub}</small></div><button class="switch ${settings.hard ? 'on' : ''} ${locked ? 'disabled' : ''}" data-act="hard" aria-label="${t().hard}"></button></div>
      <div class="setting"><div>${t().dark}</div><div class="mini-seg">${['auto', 'light', 'dark'].map(v => `<button data-theme="${v}" class="${settings.theme === v ? 'on' : ''}">${t()['theme' + v[0].toUpperCase() + v.slice(1)]}</button>`).join('')}</div></div>
      <div class="setting"><div>${t().contrast}<small>${t().contrastSub}</small></div><button class="switch ${settings.contrast ? 'on' : ''}" data-act="contrast" aria-label="${t().contrast}"></button></div>`;
  };
  render();
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.act === 'hard') { if (locked) return toast(t().hardLocked, 2200); settings.hard = !settings.hard; if (G) G.hardOn = settings.hard; }
    else if (b.dataset.act === 'contrast') settings.contrast = !settings.contrast;
    else if (b.dataset.theme) settings.theme = b.dataset.theme;
    else return;
    saveSettings(); applyTheme(); render();
  });
  openModal(box);
}

/* ================= NAWIGACJA ================= */
function goHome() { G = null; show('home'); renderHome(); }

$('#langSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; settings.lang = b.dataset.lang; saveSettings(); renderHome(); });
$('#lenChips').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return; const n = +b.dataset.len;
  if (!AVAILABLE_LENGTHS.includes(n)) return toast(t().soon);
  settings.len = n; saveSettings(); renderHome();
});
$('#playDaily').onclick = () => startGame('daily');
$('#playPractice').onclick = () => startGame('practice');
$('#homeSettings').onclick = openSettings;
$('#homeStats').onclick = openStats;
$('#homeHelp').onclick = openHelp;
$('#backBtn').onclick = goHome;
$('#helpBtn').onclick = openHelp;
$('#statsBtn').onclick = () => (G && G.status !== 'playing') ? openResult() : openStats();
$('#settingsBtn').onclick = openSettings;
$('#modalClose').onclick = closeModal;
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });

$('#keyboard').addEventListener('click', e => {
  const k = e.target.closest('.key'); if (!k) return; const v = k.dataset.key;
  if (v === 'ENTER') submit(); else if (v === 'BACK') backspace(); else typeLetter(v);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalOpen) return closeModal();
  if (!G || modalOpen || $('#game').hidden || e.ctrlKey || e.metaKey) return;
  if (e.key === 'Enter') { e.preventDefault(); submit(); }
  else if (e.key === 'Backspace') backspace();
  else if (e.key.length === 1) { const ch = e.key.toLocaleUpperCase(settings.lang); if (LANGS[settings.lang].alphabet.includes(ch)) typeLetter(ch); }
});
if (navigator.standalone === true) document.body.classList.add('standalone');
applyTheme(); show('home'); renderHome();
})();
