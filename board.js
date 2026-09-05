/* ============================================================
   PIPS OUT! — erelijst
   Blijft op het toestel zelf staan (localStorage). Geen account,
   geen server, geen onderhoud: wie op deze gsm of laptop speelt,
   staat in deze lijst.
   ============================================================ */
window.PipsBoard = (() => {
'use strict';

const KEY   = 'ttcw_board';
const LIMIT = 20;
const KEEP  = 60;   // hoeveel er echt bewaard blijven

/* ---------- namen: kort, zonder rommel ---------- */
function cleanName(raw){
  return String(raw || '')
    .split('').filter(c => c >= ' ').join('')   // stuurtekens eruit
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 16);
}

/* ---------- kan die score wel bij dat blad horen? ----------
   Ruim genomen: een perfecte doorloop met alles goud en maximale
   combo blijft hier ver onder. Vangt tikfouten en kapotte data op. */
const MAX_SCORE = 999999;
const plausible = (score, level) =>
  Number.isFinite(score) && Number.isFinite(level) &&
  score >= 0 && level >= 1 &&
  score <= Math.min(MAX_SCORE, 60000 * level);

function read(){
  try {
    const rows = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(rows) ? rows.filter(r => r && plausible(r.score, r.level)) : [];
  } catch (_){ return []; }
}
function write(rows){
  try { localStorage.setItem(KEY, JSON.stringify(rows.slice(0, KEEP))); }
  catch (_){ /* privémodus: dan maar niet */ }
}

/* ---------- alleen de beste score per naam in de lijst ---------- */
function bestPerName(rows){
  const seen = new Map();
  for (const r of rows){
    const k = cleanName(r.name).toLowerCase();
    if (!k) continue;
    if (!seen.has(k) || seen.get(k).score < r.score) seen.set(k, r);
  }
  return [...seen.values()].sort((a, b) => b.score - a.score).slice(0, LIMIT);
}

return {
  cleanName,
  plausible,

  /* De lijst zoals ze getoond wordt. */
  top(){ return bestPerName(read()); },

  /* Zet een score erbij. Geeft terug wat genoteerd is en op welke
     plaats, of null als de score niet bij dat blad kan horen. */
  submit(name, score, level){
    const e = {
      name: cleanName(name) || 'Anoniem',
      score: Math.round(score),
      level: Math.round(level),
      ts: Date.now()
    };
    if (!plausible(e.score, e.level)) return null;

    const rows = read();
    rows.push(e);
    rows.sort((a, b) => b.score - a.score);
    write(rows);

    const list = bestPerName(rows);
    return { entry: e, rank: list.findIndex(r => r.ts === e.ts) + 1 };
  },

  /* Voor als er ooit onzin in staat. */
  clear(){ try { localStorage.removeItem(KEY); } catch (_){} }
};

})();
