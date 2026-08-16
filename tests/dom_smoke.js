#!/usr/bin/env node
/**
 * dom_smoke.js — arranca index.html + js/data.js + js/app.js reales en jsdom y
 * juega una campaña por la interfaz, sin navegador ni servidor.
 *
 * Cubre el hueco de ui_smoke.py cuando no hay Chromium disponible.
 *   npm install jsdom
 *   node tests/dom_smoke.js
 */

const fs = require("fs");
const path = require("path");
let JSDOM;
try {
  ({ JSDOM } = require("jsdom"));
} catch {
  console.error("NO EJECUTABLE: instala jsdom con `npm install jsdom`.");
  process.exit(2);
}

const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

const checks = [];
const check = (name, ok, detail = "") => {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "  OK  " : " FALLO"} ${name}${detail ? " · " + detail : ""}`);
};

function boot(seed) {
  const dom = new JSDOM(html, { runScripts: "outside-only", pretendToBeVisual: true, url: "https://example.test/" });
  const { window } = dom;

  // dialog no está implementado en jsdom
  const proto = window.HTMLDialogElement ? window.HTMLDialogElement.prototype : null;
  if (proto) {
    proto.showModal = function () { this.open = true; };
    proto.close = function () { this.open = false; this.dispatchEvent(new window.Event("close")); };
  }
  window.confirm = () => true;
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));

  if (seed) for (const [k, v] of Object.entries(seed)) window.localStorage.setItem(k, v);

  for (const file of ["js/data.js", "js/app.js"]) {
    window.eval(fs.readFileSync(path.join(ROOT, file), "utf8"));
  }
  return window;
}

const window = boot();

const D = window.N404_DATA;
const doc = window.document;
const $ = sel => doc.querySelector(sel);
const active = () => doc.querySelector(".screen--active")?.id;
const clickAll = sel => doc.querySelectorAll(sel).forEach(n => n.click());
const clickFirst = sel => { const n = doc.querySelector(sel); if (n) { n.click(); return true; } return false; };

check("data.js y app.js se evalúan sin excepción", Boolean(D), `v${D?.version}`);
check("bloque de equilibrio presente", Boolean(D.balance && D.balance.chapterSignalCap), JSON.stringify(D.balance.chapterSignalCap));
check("pantalla inicial es el menú", active() === "screen-menu", active());

// nueva campaña
$("[data-action='new-game']").click();
check("selector de personaje se muestra", active() === "screen-character", active());
check("tres investigadores renderizados", doc.querySelectorAll("[data-character]").length === 3);

doc.querySelector("[data-character='lucia']").click();
check("mapa tras elegir investigador", active() === "screen-map", active());
check("estadísticas de mapa pobladas", $("#map-health").textContent.includes("/"), $("#map-health").textContent);
check("Nexo bloqueado al inicio", doc.querySelector("[data-case='nexus']").disabled === true);

// entrar en el primer caso
doc.querySelector("[data-case='block404']").click();
check("pantalla de juego", active() === "screen-game", active());

// jugar hasta poder confrontar
const dialog = $("#game-dialog");
const resolveDialog = () => {
  if (!dialog.open) return false;
  // combate
  if (doc.querySelector("[data-combat='attack']")) { doc.querySelector("[data-combat='attack']").click(); return true; }
  // evento
  const choice = doc.querySelector("[data-event-choice]:not([disabled])");
  if (choice) { choice.click(); return true; }
  // resolución de caso
  const res = doc.querySelector("[data-resolution]");
  if (res) { res.click(); return true; }
  // final
  const end = doc.querySelector("[data-ending]:not([disabled])");
  if (end) { end.click(); return true; }
  const anyBtn = dialog.querySelector("button");
  if (anyBtn) { anyBtn.click(); return true; }
  return false;
};

const MAX_STEPS = Number(process.env.MAX_STEPS || 400);
let steps = 0, sawEvent = false, sawCombat = false, sawResolutionNote = false;
while (steps++ < MAX_STEPS) {
  if (dialog.open) {
    if (doc.querySelector("[data-event-choice]")) sawEvent = true;
    if (doc.querySelector("[data-combat='attack']")) sawCombat = true;
    const note = doc.querySelector("[data-resolution] .choice-note");
    if (note && /Señal/.test(note.textContent)) sawResolutionNote = true;
    if (!resolveDialog()) break;
    continue;
  }
  if (active() !== "screen-game") break;
  const confront = $("[data-game-action='confront']");
  if (confront && !confront.disabled) { confront.click(); continue; }
  const explore = $("[data-game-action='explore']");
  const investigate = $("[data-game-action='investigate']");
  if (explore && !explore.disabled) explore.click();
  else if (investigate && !investigate.disabled) investigate.click();
  else break;
}

check("los eventos narrativos se muestran", sawEvent);
check("el combate por turnos se ejecuta", sawCombat);
check("la resolución expone el coste de Señal", sawResolutionNote);

// persistencia
const raw = window.localStorage.getItem("nightmare404.save.v1");
check("la partida se guarda en localStorage", Boolean(raw));
if (raw) {
  const save = JSON.parse(raw);
  check("el guardado usa la versión actual", save.version === D.version, save.version);
  check("la Señal se mantiene dentro de rango", save.signal >= 0 && save.signal <= 100, `${save.signal}%`);
  check("la vida se mantiene dentro de rango", save.health >= 0 && save.health <= save.maxHealth, `${save.health}/${save.maxHealth}`);
}

// tope de descansos coherente con el dato
check("restCap del dato es un entero positivo", Number.isInteger(D.balance.restCap) && D.balance.restCap >= 1, String(D.balance.restCap));

window.close();

// ---------------------------------------------------------------------------
// Regresión: los objetos clave no deben competir por hueco con los consumibles.
// Hay 9 objetos clave y el tope de consumibles es 6; con el modelo anterior
// (8 huecos compartidos) una partida avanzada quedaba bloqueada para siempre.
// ---------------------------------------------------------------------------
const KEY_KINDS = ["boss", "evidence", "passive"];
const keyItems = Object.entries(D.items).filter(([, i]) => KEY_KINDS.includes(i.kind)).map(([id]) => id);
const consumables = ["medkit", "pills", "battery", "incense", "sedative", "ritualInk"];

const seededSave = {
  version: D.version,
  characterId: "lucia",
  health: 60, maxHealth: 88, sanity: 60, maxSanity: 96, power: 9,
  signal: 30, day: 2, minutes: 600, weather: "rain",
  completedCases: [], currentCaseId: "block404",
  caseProgress: { block404: { clues: 1, explored: 1, rests: 0, eventDeck: [], visited: [], bossDefeated: false, completed: false, noRest: true } },
  inventory: [...keyItems, ...consumables],
  log: [], seals: 0, knowledge: 0, corruption: 0,
  totalKills: 0, totalRests: 0, campaignNoRest: true,
  nextAttackPenalty: 0, pendingEventId: null, pendingCombat: null
};

const w2 = boot({ "nightmare404.save.v1": JSON.stringify(seededSave) });
const d2 = w2.document;
const continueBtn = d2.getElementById("continue-btn");
check("un guardado cargado con 9 objetos clave es válido", continueBtn.disabled === false);
continueBtn.click();

const restored = JSON.parse(w2.localStorage.getItem("nightmare404.save.v1"));
const keptKeys = restored.inventory.filter(id => KEY_KINDS.includes(D.items[id]?.kind));
const keptConsumables = restored.inventory.filter(id => !KEY_KINDS.includes(D.items[id]?.kind));

check("se conservan los 9 objetos clave tras normalizar", keptKeys.length === keyItems.length, `${keptKeys.length}/${keyItems.length}`);
check("los consumibles se limitan al tope", keptConsumables.length <= 6, `${keptConsumables.length}/6`);
check("con la mochila llena de objetos clave siguen quedando huecos", keptConsumables.length > 0, `${keptConsumables.length} consumibles`);
check("el contador de inventario cuenta solo consumibles",
  /^\d+\/6$/.test(d2.getElementById("inventory-count").textContent),
  d2.getElementById("inventory-count").textContent);
check("los objetos clave se marcan en la lista", d2.querySelectorAll("#inventory-list .key-item").length === keyItems.length,
  `${d2.querySelectorAll("#inventory-list .key-item").length} marcados`);
w2.close();

// ---------------------------------------------------------------------------
// Regresión: una partida de la v1.0.1 debe seguir siendo válida y adoptar las
// estadísticas del equilibrio nuevo, no jugarse con las viejas.
// ---------------------------------------------------------------------------
const gabriel = D.characters.find(c => c.id === "gabriel");
const legacySave = {
  ...seededSave,
  version: "1.0.1",
  characterId: "gabriel",
  // escala antigua: Matías tenía 118 de vida y 94 de cordura, al 50 %
  health: 59, maxHealth: 118, sanity: 47, maxSanity: 94, power: 11,
  inventory: ["medkit", "fuse"]
};

const w3 = boot({ "nightmare404.save.v1": JSON.stringify(legacySave) });
const d3 = w3.document;
check("una partida de la v1.0.1 sigue siendo válida", d3.getElementById("continue-btn").disabled === false);
d3.getElementById("continue-btn").click();
const migrated = JSON.parse(w3.localStorage.getItem("nightmare404.save.v1"));
check("la partida migrada adopta la versión actual", migrated.version === D.version, migrated.version);
check("adopta la vida máxima del equilibrio nuevo", migrated.maxHealth === gabriel.health, `${migrated.maxHealth} (esperado ${gabriel.health})`);
check("adopta la cordura máxima del equilibrio nuevo", migrated.maxSanity === gabriel.sanity, `${migrated.maxSanity} (esperado ${gabriel.sanity})`);
check("adopta la fuerza del equilibrio nuevo", migrated.power === gabriel.power, `${migrated.power} (esperado ${gabriel.power})`);
check("conserva la proporción de vida del jugador", Math.abs(migrated.health / migrated.maxHealth - 0.5) < 0.02, `${migrated.health}/${migrated.maxHealth}`);
check("la migración nunca deja al jugador muerto", migrated.health > 0 && migrated.sanity > 0, `${migrated.health} vida, ${migrated.sanity} cordura`);
w3.close();

const failed = checks.filter(c => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} comprobaciones superadas`);
if (failed.length) {
  console.log("Fallos: " + failed.map(f => f.name).join(", "));
  process.exit(1);
}
