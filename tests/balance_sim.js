#!/usr/bin/env node
/**
 * balance_sim.js — Simulador Monte Carlo de equilibrio para Nightmare 404
 *
 * Réplica de la economía de js/app.js (Señal, vida, cordura, combate, eventos,
 * descansos, clima) para responder a lo que ninguna prueba de UI responde:
 * ¿se puede TERMINAR la campaña, y con qué frecuencia?
 *
 * Lee las constantes reales de `N404_DATA.balance`, así que juego y simulador
 * comparten una única fuente de verdad. Reequilibrar = editar js/data.js.
 *
 * Uso:
 *   node tests/balance_sim.js            # 3000 partidas por combinación
 *   node tests/balance_sim.js 10000
 *   node tests/balance_sim.js 3000 --ci  # sale con código 1 si está fuera de rango
 *
 * Objetivo de diseño: 30–45 % de victorias con juego competente, en los tres
 * investigadores y con cualquiera de las políticas de resolución.
 */

const path = require("path");
global.window = {};
require(path.resolve(__dirname, "../js/data.js"));
const D = global.window.N404_DATA;
const B = D.balance;
const ITEMS = D.items;
const MAX_CONSUMABLES = 6;
const KEY_KINDS = ["boss", "evidence", "passive"];
const isKey = id => KEY_KINDS.includes(ITEMS[id]?.kind);

// Criterio de aceptación. Las tres políticas NO deben converger al mismo número:
// sellar es la ruta contenida y segura; el conocimiento es la ruta arriesgada y
// corruptora. Se exige que la partida típica (mixta) caiga en la banda objetivo
// y que ninguna combinación quede fuera de lo jugable.
const MIXED_MIN = 30;
const MIXED_MAX = 45;
const CELL_MIN = 25;
const CELL_MAX = 55;

const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const shuffle = a => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = ri(0, i); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const getEnemy = id => D.enemies.find(e => e.id === id) || D.bosses.find(e => e.id === id);
const getW = id => D.weather.find(w => w.id === id) || D.weather[0];
const DROPS = ["medkit", "pills", "battery", "incense"];

function run(charId, policy) {
  const ch = D.characters.find(c => c.id === charId);
  const S = {
    hp: ch.health, maxHp: ch.health, san: ch.sanity, maxSan: ch.sanity,
    pow: ch.power, pk: ch.passiveKey, signal: B.startSignal, seals: 0, know: 0,
    inv: ch.passiveKey === "spiritDamage" ? ["incense", "salt"]
      : ch.passiveKey === "signalControl" ? ["battery", "flashlight"]
        : ["flashlight", "medkit"],
    weather: "rain", nextPen: 0, dead: null, caseIndex: 0, combats: 0, won: false
  };
  let curCase = null;

  const sig = n => {
    let a = n;
    if (n > 0 && S.pk === "signalControl") a = Math.max(0, n - 2);
    S.signal = clamp(S.signal + a, 0, 100);
  };
  const drift = () => {
    if (Math.random() >= 0.38) return;
    const alt = curCase.weather.filter(x => x !== S.weather);
    if (alt.length) S.weather = alt[ri(0, alt.length - 1)];
  };
  const fail = () => (S.hp <= 0 ? "vida" : S.san <= 0 ? "cordura" : S.signal >= 100 ? "señal" : null);

  const addItem = id => {
    if (!ITEMS[id] || S.inv.includes(id)) return;
    if (!isKey(id) && S.inv.filter(x => !isKey(x)).length >= MAX_CONSUMABLES) return;
    S.inv.push(id);
  };
  const rm = id => { const i = S.inv.indexOf(id); if (i >= 0) S.inv.splice(i, 1); };

  const heal = () => {
    if (S.hp < S.maxHp * 0.45) {
      const it = S.inv.find(i => ITEMS[i].kind === "health");
      if (it) { S.hp = clamp(S.hp + ITEMS[it].value, 0, S.maxHp); rm(it); return; }
      const hy = S.inv.find(i => ITEMS[i].kind === "hybridRisk");
      if (hy) {
        S.hp = clamp(S.hp + ITEMS[hy].value, 0, S.maxHp);
        S.san = clamp(S.san + ITEMS[hy].value, 0, S.maxSan);
        rm(hy); return;
      }
    }
    if (S.san < S.maxSan * 0.35) {
      const it = S.inv.find(i => ["sanity", "guard"].includes(ITEMS[i].kind));
      if (it) { S.san = clamp(S.san + ITEMS[it].value, 0, S.maxSan); if (ITEMS[it].kind === "guard") sig(-4); rm(it); return; }
    }
    if (S.signal > 72) {
      const it = S.inv.find(i => ["signal", "battery"].includes(ITEMS[i].kind));
      if (it) { sig(-ITEMS[it].value); if (ITEMS[it].kind === "battery") S.hp = clamp(S.hp + 6, 0, S.maxHp); rm(it); }
    }
  };

  function combat(enemyId, isBoss) {
    S.combats++;
    const t = getEnemy(enemyId);
    let ehp = t.hp, debuff = 0, guard = 0, boost = -S.nextPen, specUsed = false;
    S.nextPen = 0;
    if (isBoss && t.weakItem && S.inv.includes(t.weakItem)) {
      ehp -= ITEMS[t.weakItem].value;
      if (t.id !== "dreamer") rm(t.weakItem);
    }
    for (let turn = 0; turn < 80; turn++) {
      let acted = false;
      if (S.hp < S.maxHp * 0.35) {
        const it = S.inv.find(i => ["health", "hybridRisk"].includes(ITEMS[i].kind));
        if (it) {
          S.hp = clamp(S.hp + ITEMS[it].value, 0, S.maxHp);
          if (ITEMS[it].kind === "hybridRisk") S.san = clamp(S.san + ITEMS[it].value, 0, S.maxSan);
          rm(it); acted = true;
        }
      }
      if (!acted && isBoss && turn === 0) {
        const wd = S.inv.find(i => ITEMS[i].kind === "ward");
        if (wd) {
          ehp -= (t.type === "void" || t.type === "spirit") ? ITEMS[wd].value : Math.ceil(ITEMS[wd].value / 2);
          rm(wd); acted = true;
        } else {
          const bo = S.inv.find(i => ITEMS[i].kind === "boost");
          if (bo) { boost += ITEMS[bo].value; rm(bo); acted = true; }
        }
      }
      if (!acted && S.san < 22) {
        const it = S.inv.find(i => ["sanity", "guard", "sedative"].includes(ITEMS[i].kind));
        if (it) {
          S.san = clamp(S.san + ITEMS[it].value, 0, S.maxSan);
          if (ITEMS[it].kind === "guard") guard = 8;
          if (ITEMS[it].kind === "sedative") boost -= 4;
          rm(it); acted = true;
        }
      }
      if (!acted && !specUsed && isBoss) {
        specUsed = true; acted = true;
        if (S.pk === "extraClue") { ehp -= S.pow + ri(5, 9) + boost; boost = 0; debuff = 4; }
        else if (S.pk === "spiritDamage") {
          S.san = clamp(S.san - 8, 0, S.maxSan);
          let d = S.pow + ri(11, 16) + boost; boost = 0;
          if (t.type === "spirit" || t.type === "void") d += 5;
          ehp -= d;
        } else { ehp -= S.pow + ri(7, 12) + boost; boost = 0; sig(-8); }
      }
      if (!acted) {
        let d = S.pow + ri(0, B.playerDamageBonusMax) + boost; boost = 0;
        if (S.pk === "spiritDamage" && t.type === "spirit") d += 3;
        ehp -= d;
      }
      if (ehp <= 0) return true;

      const w = getW(S.weather);
      const dmg = Math.max(1, t.attack + w.enemy + ri(-2, 2) - guard - debuff);
      const sd = Math.max(1, t.sanity + (S.signal >= B.highSignalThreshold ? B.highSignalSanityPenalty : 0));
      if (S.inv.includes("silverMirror") && t.type === "spirit") ehp -= 3;
      S.hp = clamp(S.hp - dmg, 0, S.maxHp);
      S.san = clamp(S.san - sd, 0, S.maxSan);
      sig(B.signalCombatRound + w.signal);
      guard = 0; debuff = 0;
      if (ehp <= 0) return true;
      if (fail()) { S.dead = fail(); return false; }
    }
    return true;
  }

  function doEvent(ev, prog) {
    let best = null, bestScore = -1e9;
    for (const c of ev.choices) {
      if (c.requiresPassive && c.requiresPassive !== S.pk) continue;
      const o = c.outcome || {};
      if (o.useItem && !S.inv.includes(o.useItem)) continue;
      const sc = (o.clue || 0) * 12 - (o.signal || o.doom || 0) * 1.5
        + (o.health || 0) * 0.35 + (o.sanity || 0) * 0.35 - (o.enemy ? 14 : 0)
        + (o.item ? (["boss", "health"].includes(ITEMS[o.item]?.kind) ? 20 : 6) : 0);
      if (sc > bestScore) { bestScore = sc; best = c; }
    }
    if (!best) best = ev.choices[0];
    const o = best.outcome || {};
    if (o.health) S.hp = clamp(S.hp + o.health, 0, S.maxHp);
    if (o.sanity) S.san = clamp(S.san + o.sanity, 0, S.maxSan);
    if (o.signal || o.doom) sig(Number(o.signal || o.doom));
    if (o.clue) {
      let f = Number(o.clue);
      if (S.pk === "extraClue" && Math.random() < 0.18) f++;
      prog.clues += f;
    }
    if (o.item) addItem(o.item);
    if (o.useItem) rm(o.useItem);
    if (o.seals) S.seals += o.seals;
    if (o.knowledge) S.know += o.knowledge;
    if (o.enemy) {
      if (!combat(o.enemy, false)) return false;
      if (Math.random() < B.dropChance) addItem(DROPS[ri(0, DROPS.length - 1)]);
    }
    return !fail();
  }

  for (const cs of D.cases) {
    S.caseIndex++;
    curCase = cs;
    S.weather = cs.weather[ri(0, cs.weather.length - 1)];
    const prog = { clues: 0, explored: 0, rests: 0, deck: shuffle(cs.events) };
    let loops = 0;

    while ((prog.explored < cs.minExplores || prog.clues < cs.clueTarget) && loops++ < 500) {
      heal();
      if ((S.hp < S.maxHp * 0.35 || S.san < S.maxSan * 0.3) && prog.rests < B.restCap) {
        prog.rests++;
        drift();
        sig(B.signalRest + getW(S.weather).signal);
        S.hp = clamp(S.hp + B.restHealth, 0, S.maxHp);
        S.san = clamp(S.san + B.restSanity, 0, S.maxSan);
        if (fail()) { S.dead = fail(); return S; }
        continue;
      }
      if (prog.explored < cs.minExplores) {
        prog.explored++;
        drift();
        sig(B.signalExplore + getW(S.weather).signal);
        if (!prog.deck.length) prog.deck = shuffle(cs.events);
        const ev = D.events.find(e => e.id === prog.deck.shift());
        if (ev && !doEvent(ev, prog)) { S.dead = S.dead || fail(); return S; }
      } else {
        drift();
        sig(B.signalInvestigate + getW(S.weather).signal);
        let chance = B.clueBaseChance + getW(S.weather).clue;
        if (S.pk === "extraClue") chance += 0.12;
        if (S.inv.includes("compass")) chance += 0.12;
        if (Math.random() < chance) prog.clues++;
        else if (Math.random() < B.investigateAmbushChance) {
          if (!combat(cs.enemies[ri(0, cs.enemies.length - 1)], false)) return S;
          if (Math.random() < B.dropChance) addItem(DROPS[ri(0, DROPS.length - 1)]);
        } else S.san = clamp(S.san - ri(B.investigateSanityMin, B.investigateSanityMax), 0, S.maxSan);
      }
      if (fail()) { S.dead = fail(); return S; }
    }

    heal();
    if (!combat(cs.boss, true)) { S.dead = S.dead || fail(); return S; }
    if (cs.final) { S.won = true; return S; }

    const rc = cs.resolution.choices;
    const pick = policy === "seals" ? rc.find(c => c.seals)
      : policy === "know" ? rc.find(c => c.knowledge)
        : rc[ri(0, rc.length - 1)];
    S.seals += pick.seals || 0;
    S.know += pick.knowledge || 0;
    sig(pick.signal || 0);
    if (S.signal >= 100) { S.dead = "señal (resolución)"; return S; }
    if (pick.item) addItem(pick.item);
    if (B.chapterRestore) {
      S.hp = S.maxHp;
      S.san = S.maxSan;
      S.signal = Math.min(S.signal, B.chapterSignalCap);
    } else {
      S.hp = clamp(S.hp + Math.ceil(S.maxHp * 0.18), 0, S.maxHp);
      S.san = clamp(S.san + Math.ceil(S.maxSan * 0.18), 0, S.maxSan);
    }
  }
  return S;
}

module.exports = { run, D, B };

if (require.main === module) {
  const N = Number(process.argv[2]) || 3000;
  const CI = process.argv.includes("--ci");

  console.log(`Nightmare 404 v${D.version} — simulación de equilibrio · ${N} partidas por combinación`);
  console.log(`Objetivo: partida mixta ${MIXED_MIN}–${MIXED_MAX} %; ninguna combinación fuera de ${CELL_MIN}–${CELL_MAX} %\n`);

  const rates = [];
  for (const policy of ["seals", "know", "random"]) {
    console.log(`--- resoluciones: ${policy} ---`);
    for (const c of D.characters.map(x => x.id)) {
      let win = 0;
      const causes = {}, reached = [];
      for (let i = 0; i < N; i++) {
        const r = run(c, policy);
        if (r.won) win++;
        else { causes[r.dead || "?"] = (causes[r.dead || "?"] || 0) + 1; reached.push(r.caseIndex); }
      }
      const rate = win / N * 100;
      rates.push({ policy, rate });
      const avg = a => (a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : "-");
      console.log(`  ${c.padEnd(8)} victorias ${rate.toFixed(1).padStart(5)} %  causas ${JSON.stringify(causes)}  caso medio si pierde ${avg(reached)}/5`);
    }
    console.log("");
  }

  const all = rates.map(r => r.rate);
  const mixed = rates.filter(r => r.policy === "random").map(r => r.rate);
  const cellsOk = Math.min(...all) >= CELL_MIN && Math.max(...all) <= CELL_MAX;
  const mixedOk = Math.min(...mixed) >= MIXED_MIN && Math.max(...mixed) <= MIXED_MAX;

  console.log(`Partida mixta:  ${Math.min(...mixed).toFixed(1)} % – ${Math.max(...mixed).toFixed(1)} %  · ${mixedOk ? "OK" : "FUERA DE BANDA"}`);
  console.log(`Todas las vías: ${Math.min(...all).toFixed(1)} % – ${Math.max(...all).toFixed(1)} %  · ${cellsOk ? "OK" : "FUERA DE BANDA"}`);
  console.log(cellsOk && mixedOk ? "\nEQUILIBRIO ACEPTADO" : "\nEQUILIBRIO RECHAZADO");
  if (CI && !(cellsOk && mixedOk)) process.exit(1);

}
