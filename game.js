/* ============================================================
   PIPS OUT!  -  TTC Wielsbeke-Spotit
   Pop alle noppen van je rubber voor de klok af is.
   Geen frameworks, geen assets, geen server. Enkel noppen.
   ============================================================ */
(() => {
'use strict';

/* ---------- logische canvasmaat ---------- */
const W = 440, H = 520;
const CX = 220, CY = 196;                // middelpunt van het blad
const RX = 148, RY = 155;               // rubbervlak: een blad is iets hoger dan breed
const HTOP = CY + RY - 34, HBOT = 498;  // handvat: van onder het blad tot de knop

const cv  = document.getElementById('game');
const ctx = cv.getContext('2d');

/* ---------- DOM ---------- */
const $ = id => document.getElementById(id);
const el = {
  timerFill: $('timerFill'), scoreDigits: $('scoreDigits'), hearts: $('hearts'),
  levelTag: $('levelTag'), tickText: $('tickText'), mute: $('mute'),
  title: $('screen-title'), how: $('screen-how'), clear: $('screen-clear'), over: $('screen-over'),
  clearPips: $('clearPips'), clearBonus: $('clearBonus'), clearTotal: $('clearTotal'),
  clearQuip: $('clearQuip'), overQuip: $('overQuip'),
  finalScore: $('finalScore'), bestTitle: $('bestTitle'), bestOver: $('bestOver')
};

/* ============================================================
   TEKST (het belangrijkste deel van deze game)
   ============================================================ */
const HEADLINES = [
  'Bestuur bevestigt: noppen zijn geen politiek statement, maar een levensstijl.',
  'Lokale speler pakt uit met korte noppen, tegenstander pakt uit met excuses.',
  'Materiaalcommissie kocht 400 rubbers. Niemand weet waarom.',
  'Trainer verbiedt anti-topspin. Ledenvergadering ontploft.',
  'Speler wint met noppen en wordt onmiddellijk verdacht van hekserij.',
  'Nieuw clubreglement: wie klaagt over noppen, plooit de tafels op.',
  'Kantine meldt recordverkoop tijdens interne noppendiscussie.',
  'Bestuurslid: "Onze videogame is puur toeval, echt waar."',
  'Sponsor Spotit vraagt zich af waarin het precies geïnvesteerd heeft.',
  'Jeugdspeler popt volledige rubber leeg tijdens studie-uur.'
];

const CLEAR_QUIPS = [
  'Rubber volledig kaal. De materiaalcommissie huilt.',
  'Dat blad speelt nooit meer topspin. Missie geslaagd.',
  'Nog eentje en je mag mee naar het bestuur.',
  'De tegenstander weet niet meer wat er terugkomt. Jij ook niet.',
  'Officieel gepromoveerd tot noppenspeler. Er is geen weg terug.',
  'Volgende week gewoon met de blote plank spelen zeker?',
  'Trainer kijkt weg. Trainer zegt niets. Trainer weet het.',
  'Zuiver blokwerk. Zuiver kaal. Zuivere kunst.'
];

const OVER_QUIPS = [
  'De klok won. De noppen winnen altijd op termijn.',
  'Je rubber is op, je eer ligt onder de tafel.',
  'Terug naar de gladde rubbers, verrader.',
  'Het bestuur neemt dit mee naar de volgende vergadering.',
  'Zelfs de scheids keek beschaamd weg.',
  'Volgende keer minder nadenken, meer poppen.'
];

const pick = a => a[(Math.random() * a.length) | 0];

/* ============================================================
   RUBBERS
   De kleuren die je echt in de winkel vindt bij korte noppen:
   klassiek rood/zwart, en sinds de ITTF-regels van 2021 ook
   blauw, groen, roze en paars (Dr. Neubauer, Victas, Sanwei...).
   ------------------------------------------------------------
   rubber : [glans, basis, schaduw]  van het rubbervlak
   pip    : [top, midden, onderkant] van een nop
   hole   : [diep, midden, rand]     van een gepopt gat
   dead   : [top, midden, onderkant] van de anti-topspin nop
   crumb  : kleur van de rubberkruimels
   ============================================================ */
const RUBBERS = [
  { id:'red',    name:'Rood',   rubber:['#e0413f','#c8242a','#8d1519'],
    pip:['#f0716a','#d94a44','#8b1a1f'], hole:['#3d080b','#5f1014','#a01c22'],
    dead:['#454b55','#23272e','#0c0e12'], crumb:'#e2504a' },

  { id:'black',  name:'Zwart',  rubber:['#3a3f47','#23272d','#0e1114'],
    pip:['#5a616b','#3a4048','#14171b'], hole:['#050607','#0e1114','#2b3038'],
    dead:['#f0e4d0','#c9b795','#7c6a48'], crumb:'#454c56' },

  { id:'green',  name:'Groen',  rubber:['#3fbf62','#1f9445','#0c5a29'],
    pip:['#72dc8c','#2ba552','#0b5a2a'], hole:['#03260f','#0a4020','#1a7a3c'],
    dead:['#454b55','#23272e','#0c0e12'], crumb:'#3fbf62' },

  { id:'blue',   name:'Blauw',  rubber:['#3f8fe0','#1f63b8','#0d3a75'],
    pip:['#74b6f0','#2b78cf','#0d3f7d'], hole:['#03152e','#0a2a52','#1a56a0'],
    dead:['#454b55','#23272e','#0c0e12'], crumb:'#3f8fe0' },

  { id:'pink',   name:'Roze',   rubber:['#ff86b8','#ec4f92','#a51f5c'],
    pip:['#ffa9cd','#e85f9c','#a02258'], hole:['#3a0620','#5e0f38','#a81f65'],
    dead:['#454b55','#23272e','#0c0e12'], crumb:'#ff86b8' },

  { id:'violet', name:'Paars',  rubber:['#a273e8','#7742c4','#48227c'],
    pip:['#bb95f2','#8250d1','#472080'], hole:['#1c0733','#301052','#5e2497'],
    dead:['#454b55','#23272e','#0c0e12'], crumb:'#a273e8' }
];

let RB = RUBBERS.find(r => r.id === localStorage.getItem('ttcw_rubber')) || RUBBERS[0];

function setRubber(r){
  RB = r;
  localStorage.setItem('ttcw_rubber', r.id);
  document.documentElement.style.setProperty('--rubber-mid', r.pip[1]);
  const nm = $('rubberName'); if (nm) nm.textContent = r.name;
  document.querySelectorAll('.sw').forEach(s => {
    s.setAttribute('aria-checked', String(s.dataset.id === r.id));
  });
}

function buildSwatches(){
  const box = $('swatches');
  box.setAttribute('role', 'radiogroup');
  for (const r of RUBBERS){
    const b = document.createElement('button');
    b.className = 'sw';
    b.dataset.id = r.id;
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.title = r.name;
    b.setAttribute('aria-label', 'Rubber ' + r.name);
    b.style.background = 'linear-gradient(' + r.rubber[0] + ',' + r.rubber[1] + ' 55%,' + r.rubber[2] + ')';
    b.onclick = () => { Snd.init(); Snd.pop(4); setRubber(r); };
    box.appendChild(b);
  }
  setRubber(RB);
}

/* ============================================================
   GELUID  (volledig gesynthetiseerd, nul bestanden)
   ============================================================ */
const Snd = {
  ac: null, on: true, noise: null,
  init(){
    if (this.ac) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ac = new AC();
    const len = this.ac.sampleRate * 0.25;
    this.noise = this.ac.createBuffer(1, len, this.ac.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  },
  env(node, vol, dur){
    const g = this.ac.createGain();
    g.gain.setValueAtTime(vol, this.ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ac.currentTime + dur);
    node.connect(g); g.connect(this.ac.destination);
    return g;
  },
  burst(vol, dur, freq, q){
    const s = this.ac.createBufferSource(); s.buffer = this.noise;
    const f = this.ac.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q || 1.2;
    s.connect(f); this.env(f, vol, dur); s.start(); s.stop(this.ac.currentTime + dur);
  },
  pop(step){
    if (!this.on) return; this.init(); if (!this.ac) return;
    const t = this.ac.currentTime;
    const o = this.ac.createOscillator();
    o.type = 'triangle';
    const base = 300 + Math.min(step, 22) * 26;
    o.frequency.setValueAtTime(base, t);
    o.frequency.exponentialRampToValueAtTime(90, t + 0.085);
    this.env(o, 0.16, 0.09); o.start(); o.stop(t + 0.1);
    this.burst(0.1, 0.05, 1800 + Math.min(step, 22) * 90, 2);
  },
  gold(){
    if (!this.on) return; this.init(); if (!this.ac) return;
    [660, 880, 1320].forEach((f, i) => {
      const o = this.ac.createOscillator(); o.type = 'square';
      o.frequency.value = f;
      const t = this.ac.currentTime + i * 0.06;
      const g = this.ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g); g.connect(this.ac.destination);
      o.start(t); o.stop(t + 0.18);
    });
  },
  boom(){ if (!this.on) return; this.init(); if (!this.ac) return; this.burst(0.3, 0.32, 240, 0.6); },
  bad(){
    if (!this.on) return; this.init(); if (!this.ac) return;
    const t = this.ac.currentTime;
    const o = this.ac.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(200, t);
    o.frequency.exponentialRampToValueAtTime(55, t + 0.3);
    this.env(o, 0.18, 0.32); o.start(); o.stop(t + 0.34);
  },
  fanfare(){
    if (!this.on) return; this.init(); if (!this.ac) return;
    [523, 659, 784, 1047].forEach((f, i) => {
      const o = this.ac.createOscillator(); o.type = 'square'; o.frequency.value = f;
      const t = this.ac.currentTime + i * 0.09;
      const g = this.ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.1, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o.connect(g); g.connect(this.ac.destination);
      o.start(t); o.stop(t + 0.32);
    });
  },
  dead(){
    if (!this.on) return; this.init(); if (!this.ac) return;
    [392, 330, 262, 196].forEach((f, i) => {
      const o = this.ac.createOscillator(); o.type = 'square'; o.frequency.value = f;
      const t = this.ac.currentTime + i * 0.16;
      const g = this.ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.1, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
      o.connect(g); g.connect(this.ac.destination);
      o.start(t); o.stop(t + 0.44);
    });
  }
};

/* ============================================================
   SPELSTAAT
   ============================================================ */
const G = {
  screen: 'title',      // title | how | play | clear | over
  level: 1, score: 0, lives: 3,
  time: 0, timeMax: 0,
  pips: [], target: 0, popped: 0,
  combo: 0, comboT: 0, chain: [],
  parts: [], texts: [], rings: [],
  shake: 0, flash: 0, flashCol: '255,60,60',
  levelPips: 0, levelScore: 0,
  best: +(localStorage.getItem('ttcw_best') || 0)
};

/* ---------- moeilijkheidscurve ---------- */
const PIP_SIZES = [20, 16.5, 14, 12.5, 11.2, 10.2, 9.5, 9, 8.5];
function levelCfg(lv){
  const pipR = PIP_SIZES[Math.min(lv - 1, PIP_SIZES.length - 1)];
  const gap  = Math.max(2.8, pipR * 0.28);
  return {
    pipR, gap,
    goldP: 0.05,
    bombP: lv >= 2 ? 0.05 : 0,
    deadP: lv >= 2 ? Math.min(0.12, 0.03 + lv * 0.012) : 0,
    tpp: Math.max(0.30, 0.55 - lv * 0.022)
  };
}

/* ---------- blad opbouwen (hexagonaal noppenraster) ---------- */
function buildLevel(lv){
  const c = levelCfg(lv);
  const d = c.pipR * 2 + c.gap;
  const rowH = d * Math.sqrt(3) / 2;
  const pips = [];
  const rows = Math.ceil(RY / rowH) + 1;
  const cols = Math.ceil(RX / d) + 1;
  const ax = RX - c.pipR - 4, ay = RY - c.pipR - 4;   // noppen blijven op het rubber

  for (let j = -rows; j <= rows; j++){
    const y = CY + j * rowH;
    const off = (Math.abs(j) % 2) ? d / 2 : 0;
    for (let i = -cols; i <= cols; i++){
      const x = CX + i * d + off;
      const nx = (x - CX) / ax, ny = (y - CY) / ay;
      if (nx * nx + ny * ny > 1) continue;
      pips.push({ x, y, r: c.pipR, type: 'normal', popped: false, t: 0, seed: Math.random() });
    }
  }

  // speciale noppen uitdelen (nooit op de allereerste rij van level 1)
  for (const p of pips){
    const q = Math.random();
    if (q < c.deadP)                       p.type = 'dead';
    else if (q < c.deadP + c.bombP)        p.type = 'bomb';
    else if (q < c.deadP + c.bombP + c.goldP) p.type = 'gold';
  }

  G.pips   = pips;
  G.target = pips.filter(p => p.type !== 'dead').length;
  G.popped = 0;
  G.chain  = [];
  G.levelPips = 0;
  G.levelScore = 0;
  G.timeMax = Math.max(16, Math.round(G.target * c.tpp));
  G.time = G.timeMax;
  G.combo = 0; G.comboT = 0;

  el.levelTag.textContent = 'BLAD ' + lv + '  ·  ' + G.target + ' NOPPEN';
  el.levelTag.classList.remove('hidden');
}

/* ============================================================
   POPPEN
   ============================================================ */
function popPip(p, chained){
  if (p.popped || G.screen !== 'play') return;
  p.popped = true; p.t = 0;

  if (p.type === 'dead' && !chained){
    // Anti-topspin: nooit aanraken.
    G.time = Math.max(0, G.time - 3);
    G.combo = 0; G.comboT = 0;
    G.shake = 14; G.flash = 1; G.flashCol = '255,60,60';
    burst(p, RB.dead[1], 14);
    addText(p.x, p.y - 24, '-3 SEC', '#ff6b6b');
    Snd.bad();
    return;
  }

  const mult = comboMult();
  let pts = Math.round(20 * mult * (1 + (G.level - 1) * 0.2));

  if (p.type !== 'dead'){
    G.popped++; G.levelPips++;
    G.combo++; G.comboT = 0.75;
  }

  switch (p.type){
    case 'gold':
      G.time = Math.min(G.timeMax, G.time + 3);
      pts *= 3;
      burst(p, '#ffd23f', 16);
      addText(p.x, p.y - 24, '+3 SEC', '#ffd23f');
      Snd.gold();
      break;
    case 'bomb':
      burst(p, '#ff8b2e', 20);
      G.shake = Math.max(G.shake, 9);
      Snd.boom();
      // buren met een rimpeltje meesleuren
      for (const n of G.pips){
        if (n.popped) continue;
        const dist = Math.hypot(n.x - p.x, n.y - p.y);
        if (dist < p.r * 3.5) G.chain.push({ p: n, t: 0.02 + dist * 0.0022 });
      }
      break;
    case 'dead':
      burst(p, RB.dead[1], 10);
      pts = 0;
      break;
    default:
      burst(p, RB.crumb, 9);
      Snd.pop(G.combo);
  }

  if (pts){
    G.score += pts;
    G.levelScore += pts;
    bumpScore();
    if (mult >= 2 && p.type === 'normal' && G.combo % 5 === 0)
      addText(p.x, p.y - 22, 'x' + mult, '#ffd23f');
  }
  G.rings.push({ x: p.x, y: p.y, r: p.r, life: 1 });

  if (G.popped >= G.target) levelClear();
}

const comboMult = () => Math.min(8, 1 + Math.floor(G.combo / 5));

function burst(p, col, n){
  for (let i = 0; i < n; i++){
    const a = Math.random() * Math.PI * 2, s = 40 + Math.random() * 170;
    G.parts.push({
      x: p.x, y: p.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60,
      life: 0.45 + Math.random() * 0.4, max: 0.85,
      size: 1.5 + Math.random() * (p.r * 0.22), col
    });
  }
}
function addText(x, y, t, col){ G.texts.push({ x, y, t, col, life: 0.9 }); }

function bumpScore(){
  el.scoreDigits.textContent = String(Math.min(999999, G.score)).padStart(6, '0');
  el.scoreDigits.classList.remove('bump');
  void el.scoreDigits.offsetWidth;
  el.scoreDigits.classList.add('bump');
}

/* ---------- treffer zoeken ---------- */
function hitAt(x, y){
  for (const p of G.pips){
    if (p.popped) continue;
    if (Math.hypot(p.x - x, p.y - y) <= p.r * 0.95) return p;
  }
  return null;
}

/* ============================================================
   SCHERMEN
   ============================================================ */
function show(name){
  G.screen = name;
  for (const k of ['title', 'how', 'clear', 'over']) el[k].classList.add('hidden');
  if (el[name]) el[name].classList.remove('hidden');
  el.levelTag.classList.toggle('hidden', name !== 'play');
}

function startGame(){
  G.level = 1; G.score = 0; G.lives = 3;
  G.parts = []; G.texts = []; G.rings = [];
  bumpScore(); drawHearts();
  buildLevel(1);
  show('play');
}

function levelClear(){
  if (G.screen !== 'play') return;   // nooit twee keer bonus tellen
  const bonus = Math.round(G.time * 50) + G.level * 100;
  G.score += bonus; bumpScore();
  el.clearPips.textContent  = G.levelPips + ' st.  →  ' + G.levelScore;
  el.clearBonus.textContent = bonus;
  el.clearTotal.textContent = String(G.score).padStart(6, '0');
  el.clearQuip.textContent  = pick(CLEAR_QUIPS);
  Snd.fanfare();
  show('clear');
}

function nextLevel(){
  G.level++;
  G.parts = []; G.texts = []; G.rings = [];
  buildLevel(G.level);
  show('play');
}

function loseLife(){
  G.lives--;
  drawHearts();
  G.shake = 20; G.flash = 1; G.flashCol = '255,60,60';
  if (G.lives <= 0){ gameOver(); return; }
  Snd.bad();
  // tweede adem: bord blijft staan, klok komt gedeeltelijk terug
  G.time = Math.max(8, G.timeMax * 0.6);
  G.combo = 0;
  addText(CX, CY, 'NOG EEN KANS', '#ffd23f');
}

function gameOver(){
  if (G.score > G.best){
    G.best = G.score;
    localStorage.setItem('ttcw_best', String(G.best));
  }
  el.finalScore.textContent = String(Math.min(999999, G.score)).padStart(6, '0');
  el.overQuip.textContent = pick(OVER_QUIPS);
  el.bestOver.textContent = G.best;
  el.bestTitle.textContent = G.best;
  Snd.dead();
  show('over');
}

function drawHearts(){
  el.hearts.innerHTML = '';
  for (let i = 0; i < 3; i++){
    const h = document.createElement('div');
    h.className = 'heart' + (i < G.lives ? '' : ' gone');
    el.hearts.appendChild(h);
  }
}

/* ============================================================
   UPDATE
   ============================================================ */
function update(dt){
  // deeltjes
  for (let i = G.parts.length - 1; i >= 0; i--){
    const q = G.parts[i];
    q.vy += 620 * dt; q.x += q.vx * dt; q.y += q.vy * dt;
    q.life -= dt;
    if (q.life <= 0) G.parts.splice(i, 1);
  }
  for (let i = G.texts.length - 1; i >= 0; i--){
    const t = G.texts[i]; t.y -= 34 * dt; t.life -= dt;
    if (t.life <= 0) G.texts.splice(i, 1);
  }
  for (let i = G.rings.length - 1; i >= 0; i--){
    G.rings[i].life -= dt * 3.4;
    if (G.rings[i].life <= 0) G.rings.splice(i, 1);
  }
  for (const p of G.pips) if (p.popped && p.t < 1) p.t = Math.min(1, p.t + dt * 6);

  G.shake = Math.max(0, G.shake - dt * 60);
  G.flash = Math.max(0, G.flash - dt * 3.5);

  if (G.screen !== 'play') return;

  // kettingreactie van lijmnoppen
  for (let i = G.chain.length - 1; i >= 0; i--){
    G.chain[i].t -= dt;
    if (G.chain[i].t <= 0){
      const p = G.chain[i].p;
      G.chain.splice(i, 1);
      popPip(p, true);
    }
  }

  if (G.comboT > 0){
    G.comboT -= dt;
    if (G.comboT <= 0) G.combo = 0;
  }

  G.time -= dt;
  const frac = Math.max(0, G.time / G.timeMax);
  el.timerFill.style.width = (frac * 100) + '%';
  el.timerFill.className = 'bar-fill' + (frac < 0.18 ? ' crit' : frac < 0.4 ? ' warn' : '');
  if (G.time <= 0){ G.time = 0; loseLife(); }
}

/* ============================================================
   RENDER
   ============================================================ */
function roundRect(x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ---------- silhouet van het handvat: schouders, taille, knop ---------- */
function handlePath(){
  const t = HTOP, b = HBOT;
  ctx.beginPath();
  ctx.moveTo(CX - 47, t);
  ctx.bezierCurveTo(CX - 45, t + 36, CX - 28, t + 42, CX - 27, t + 74);   // schouder naar taille
  ctx.bezierCurveTo(CX - 26, t + 110, CX - 36, t + 116, CX - 37, b - 16); // taille naar knop
  ctx.quadraticCurveTo(CX - 37, b, CX - 21, b);
  ctx.lineTo(CX + 21, b);
  ctx.quadraticCurveTo(CX + 37, b, CX + 37, b - 16);
  ctx.bezierCurveTo(CX + 36, t + 116, CX + 26, t + 110, CX + 27, t + 74);
  ctx.bezierCurveTo(CX + 28, t + 42, CX + 45, t + 36, CX + 47, t);
  ctx.closePath();
}

function drawHandle(){
  ctx.save();

  // slagschaduw
  ctx.save(); ctx.translate(0, 5); handlePath();
  ctx.fillStyle = 'rgba(18,9,2,.6)'; ctx.fill(); ctx.restore();

  // hout, met licht van linksboven
  handlePath();
  const g = ctx.createLinearGradient(CX - 42, 0, CX + 42, 0);
  g.addColorStop(0,   '#71441b');
  g.addColorStop(.16, '#ad7436');
  g.addColorStop(.40, '#dda765');
  g.addColorStop(.62, '#c08c4a');
  g.addColorStop(.86, '#87551f');
  g.addColorStop(1,   '#5f3a13');
  ctx.fillStyle = g; ctx.fill();

  ctx.save(); handlePath(); ctx.clip();

  // de bladkern loopt als een lat door het handvat, met een schaal aan elke kant
  ctx.fillStyle = 'rgba(255,232,190,.14)';
  ctx.fillRect(CX - 10, HTOP, 20, HBOT - HTOP);
  ctx.fillStyle = 'rgba(74,42,14,.55)';
  ctx.fillRect(CX - 12, HTOP, 2.5, HBOT - HTOP);
  ctx.fillRect(CX + 9.5, HTOP, 2.5, HBOT - HTOP);

  // houtnerf
  ctx.strokeStyle = 'rgba(58,31,11,.15)'; ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++){
    const x = CX - 36 + i * 9.5;
    ctx.beginPath(); ctx.moveTo(x, HTOP);
    ctx.quadraticCurveTo(x + 5, (HTOP + HBOT) / 2, x, HBOT); ctx.stroke();
  }

  // schaduw van het blad op de schouders
  const sh = ctx.createLinearGradient(0, HTOP, 0, HTOP + 66);
  sh.addColorStop(0, 'rgba(0,0,0,.6)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh; ctx.fillRect(CX - 52, HTOP, 104, 66);
  ctx.restore();

  handlePath();
  ctx.strokeStyle = 'rgba(46,24,7,.7)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}

function drawBlade(){
  ctx.save();

  // schaduw onder het blad
  ctx.beginPath(); ctx.ellipse(CX, CY + 7, RX + 12, RY + 12, 0, 0, 7);
  ctx.fillStyle = 'rgba(18,9,2,.5)'; ctx.fill();

  // hout van het blad
  ctx.beginPath(); ctx.ellipse(CX, CY, RX + 12, RY + 12, 0, 0, 7);
  const w = ctx.createLinearGradient(CX - RX, CY - RY, CX + RX, CY + RY);
  w.addColorStop(0, '#e8c084'); w.addColorStop(.5, '#c69553'); w.addColorStop(1, '#9a6a2c');
  ctx.fillStyle = w; ctx.fill();
  ctx.strokeStyle = 'rgba(60,33,12,.55)'; ctx.lineWidth = 2; ctx.stroke();

  // spons: het witte randje tussen hout en rubber
  ctx.beginPath(); ctx.ellipse(CX, CY, RX + 5, RY + 5, 0, 0, 7);
  ctx.fillStyle = '#efe3d6'; ctx.fill();

  // rubber
  const g = ctx.createRadialGradient(CX - 58, CY - 72, 20, CX, CY, RX + 10);
  g.addColorStop(0, RB.rubber[0]); g.addColorStop(.55, RB.rubber[1]); g.addColorStop(1, RB.rubber[2]);
  ctx.beginPath(); ctx.ellipse(CX, CY, RX, RY, 0, 0, 7);
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1.5; ctx.stroke();

  ctx.restore();
}

function pipColors(p){
  switch (p.type){
    case 'gold': return ['#ffe988', '#ffd23f', '#a97f00'];
    case 'bomb': return ['#ffc27a', '#ff8b2e', '#a34c00'];
    case 'dead': return RB.dead;
    default:     return RB.pip;
  }
}

function drawPip(p, tms){
  const [hi, mid, lo] = pipColors(p);
  const r = p.r * 0.86;

  if (p.popped){
    // gat in het rubber
    const t = p.t;
    if (t < 1){
      const s = 1 + t * 0.9;
      ctx.globalAlpha = 1 - t;
      ctx.beginPath(); ctx.arc(p.x, p.y, r * s, 0, 7);
      ctx.strokeStyle = hi; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.globalAlpha = 1;
    }
    const g = ctx.createRadialGradient(p.x, p.y - r * 0.25, r * 0.15, p.x, p.y, r * 1.05);
    g.addColorStop(0, RB.hole[0]); g.addColorStop(.75, RB.hole[1]); g.addColorStop(1, RB.hole[2]);
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fillStyle = g; ctx.fill();
    return;
  }

  // schaduw eronder
  ctx.beginPath(); ctx.arc(p.x, p.y + r * 0.22, r, 0, 7);
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fill();

  // nop
  const g = ctx.createLinearGradient(p.x, p.y - r, p.x, p.y + r);
  g.addColorStop(0, hi); g.addColorStop(.55, mid); g.addColorStop(1, lo);
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fillStyle = g; ctx.fill();

  // glans
  ctx.beginPath();
  ctx.ellipse(p.x - r * 0.3, p.y - r * 0.34, r * 0.34, r * 0.24, -0.6, 0, 7);
  ctx.fillStyle = 'rgba(255,255,255,.42)'; ctx.fill();

  if (p.type === 'gold'){
    const tw = 0.5 + 0.5 * Math.sin(tms * 0.006 + p.seed * 9);
    ctx.globalAlpha = 0.35 + tw * 0.55;
    ctx.strokeStyle = '#fff8d0'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.98, 0, 7); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (p.type === 'bomb'){
    ctx.strokeStyle = 'rgba(90,30,0,.75)'; ctx.lineWidth = Math.max(1.4, r * 0.16);
    ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.52, 0, 7); ctx.stroke();
  }
  if (p.type === 'dead'){
    ctx.strokeStyle = 'rgba(180,190,205,.35)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.62, 0, 7); ctx.stroke();
  }
}

function render(tms){
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  if (G.shake > 0.2){
    ctx.translate((Math.random() - .5) * G.shake, (Math.random() - .5) * G.shake);
  }

  drawHandle();
  drawBlade();
  for (const p of G.pips) drawPip(p, tms);

  // spiegeling over het rubber
  ctx.save();
  ctx.beginPath(); ctx.ellipse(CX, CY, RX, RY, 0, 0, 7); ctx.clip();
  const sh = ctx.createLinearGradient(CX - RX, CY - RY, CX + RX * .4, CY + RY * .6);
  sh.addColorStop(0, 'rgba(255,255,255,.16)');
  sh.addColorStop(.45, 'rgba(255,255,255,.03)');
  sh.addColorStop(1, 'rgba(0,0,0,.22)');
  ctx.fillStyle = sh; ctx.fillRect(CX - RX, CY - RY, RX * 2, RY * 2);
  ctx.restore();

  // ringen
  for (const q of G.rings){
    ctx.globalAlpha = q.life * 0.6;
    ctx.strokeStyle = '#ffd9d9'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (1 + (1 - q.life) * 1.6), 0, 7); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // deeltjes
  for (const q of G.parts){
    ctx.globalAlpha = Math.max(0, q.life / q.max);
    ctx.fillStyle = q.col;
    ctx.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size, q.size);
  }
  ctx.globalAlpha = 1;

  // zwevende tekst
  ctx.textAlign = 'center';
  ctx.font = '11px "Press Start 2P", monospace';
  for (const t of G.texts){
    ctx.globalAlpha = Math.min(1, t.life * 1.6);
    ctx.fillStyle = '#000'; ctx.fillText(t.t, t.x + 2, t.y + 2);
    ctx.fillStyle = t.col;  ctx.fillText(t.t, t.x, t.y);
  }
  ctx.globalAlpha = 1;

  // combo-teller
  if (G.screen === 'play' && G.combo >= 5){
    const m = comboMult();
    const bx = 104, by = 434;             // links naast het handvat
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.fillStyle = '#04162c'; ctx.fillText('x' + m, bx + 2, by + 2);
    ctx.fillStyle = m >= 5 ? '#ffd23f' : '#fff'; ctx.fillText('x' + m, bx, by);
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#04162c'; ctx.fillText('COMBO', bx + 1, by + 17);
    ctx.fillStyle = '#bcd8f5'; ctx.fillText('COMBO', bx, by + 16);
  }

  ctx.restore();

  if (G.flash > 0.01){
    ctx.fillStyle = 'rgba(' + G.flashCol + ',' + (G.flash * 0.32) + ')';
    ctx.fillRect(0, 0, W, H);
  }
}

/* ============================================================
   LOOP
   ============================================================ */
let last = performance.now();
function frame(now){
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  render(now);
  requestAnimationFrame(frame);
}

/* ============================================================
   INPUT
   ============================================================ */
let down = false;
function toLocal(e){
  const r = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
}
function tryPop(e){
  if (G.screen !== 'play') return;
  const { x, y } = toLocal(e);
  const p = hitAt(x, y);
  if (p) popPip(p, false);
}
cv.addEventListener('pointerdown', e => {
  down = true;
  try { cv.setPointerCapture(e.pointerId); } catch (_){}
  Snd.init();
  tryPop(e);
  e.preventDefault();
});
cv.addEventListener('pointermove', e => { if (down) tryPop(e); });
const up = () => { down = false; };
cv.addEventListener('pointerup', up);
cv.addEventListener('pointercancel', up);
cv.addEventListener('contextmenu', e => e.preventDefault());

/* ---------- knoppen ---------- */
$('btnStart').onclick = () => { Snd.init(); startGame(); };
$('btnHow').onclick   = () => show('how');
$('btnBack').onclick  = () => show('title');
$('btnNext').onclick  = () => nextLevel();
$('btnRetry').onclick = () => startGame();
$('btnShare').onclick = async () => {
  const txt = 'Ik heb ' + G.score + ' punten en blad ' + G.level +
              ' gehaald in PIPS OUT!, de officiele videogame van TTC Wielsbeke-Spotit. ' +
              'Mijn rubber is kaal. ' + location.href;
  try {
    if (navigator.share) await navigator.share({ text: txt });
    else { await navigator.clipboard.writeText(txt); alert('Gekopieerd! Plak maar in de clubgroep.'); }
  } catch (_){ /* gebruiker brak af */ }
};
el.mute.onclick = () => {
  Snd.on = !Snd.on;
  el.mute.classList.toggle('off', !Snd.on);
};

/* ---------- toetsenbord ---------- */
addEventListener('keydown', e => {
  if (e.code !== 'Space' && e.code !== 'Enter') return;
  e.preventDefault();
  if (G.screen === 'title') startGame();
  else if (G.screen === 'clear') nextLevel();
  else if (G.screen === 'over') startGame();
});

/* ============================================================
   OPSTART
   ============================================================ */
function resize(){
  const rect = cv.getBoundingClientRect();
  if (!rect.width) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width  = Math.round(rect.width * dpr);
  cv.height = Math.round(rect.width * dpr * H / W);
  ctx.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0);
  ctx.imageSmoothingEnabled = true;
}
addEventListener('resize', resize);
if (window.ResizeObserver) new ResizeObserver(resize).observe(cv);

/* ---------- nieuwsticker die effectief voorbijschuift ---------- */
let tickI = 0;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

function tick(){
  const t = el.tickText;
  t.textContent = HEADLINES[tickI++ % HEADLINES.length];

  if (REDUCED || !t.animate){ setTimeout(tick, 7000); return; }

  const win = t.parentElement.clientWidth;
  const txt = t.scrollWidth;
  if (!win){ setTimeout(tick, 1200); return; }   // ticker verborgen (kleine schermen)

  const a = t.animate(
    [{ transform: 'translateX(' + win + 'px)' }, { transform: 'translateX(' + (-txt) + 'px)' }],
    { duration: (win + txt) / 58 * 1000, easing: 'linear' }
  );
  a.onfinish = tick;
}

// decoratief blad achter het titelscherm
buildSwatches();
buildLevel(1);
show('title');
el.bestTitle.textContent = G.best;
drawHearts();
bumpScore();
resize();
tick();
requestAnimationFrame(frame);

})();
