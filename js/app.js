(() => {
  "use strict";

  const DATA = window.N404_DATA;
  const SAVE_KEY = "nightmare404.save.v1";
  const PROFILE_KEY = "nightmare404.profile.v1";
  const SETTINGS_KEY = "nightmare404.settings.v1";
  const MAX_CONSUMABLES = 6;
  const KEY_KINDS = ["boss", "evidence", "passive"];
  const B = DATA.balance;
  const SUPPORTED_SAVE_VERSIONS = new Set([DATA.version, "1.0.0", "1.0.1", "1.1.0", "1.1.1"]);
  const REBALANCED_SAVE_VERSIONS = new Set(["1.0.0", "1.0.1"]);

  const VALID_IDS = {
    events: new Set(DATA.events.map(entry => entry.id)),
    enemies: new Set([...DATA.enemies, ...DATA.bosses].map(entry => entry.id)),
    items: new Set(Object.keys(DATA.items)),
    cases: new Set(DATA.cases.map(entry => entry.id)),
    achievements: new Set(DATA.achievements.map(entry => entry.id)),
    endings: new Set(["dawn", "archive", "offline", "vessel"]),
    completedCharacters: new Set(DATA.characters.map(entry => entry.id))
  };

  const screens = [...document.querySelectorAll(".screen")];
  const dialog = document.getElementById("game-dialog");
  const dialogContent = document.getElementById("dialog-content");
  const toast = document.getElementById("toast");
  const liveRegion = document.getElementById("live-region");

  let state = null;
  let currentEnemy = null;
  let combatMeta = null;
  let audioContext = null;
  let toastTimer = 0;

  const DEFAULT_SETTINGS = {
    sound: true,
    crt: true,
    reducedMotion: false,
    largeText: false,
    highContrast: false
  };

  function storageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function storageRemove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  function readJSON(key, fallback) {
    try {
      const raw = storageGet(key);
      if (raw === null) return fallback;
      const value = JSON.parse(raw);
      return value && typeof value === "object" ? value : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      showToast("No se pudo guardar en este navegador.");
      return false;
    }
  }

  function sanitizeSettings(candidate) {
    const source = candidate && typeof candidate === "object" ? candidate : {};
    return Object.fromEntries(Object.entries(DEFAULT_SETTINGS).map(([key, fallback]) => [key, typeof source[key] === "boolean" ? source[key] : fallback]));
  }

  function sanitizeIdList(values, allowed) {
    if (!Array.isArray(values)) return [];
    return [...new Set(values.filter(value => typeof value === "string" && allowed.has(value)))];
  }

  function sanitizeProfile(candidate) {
    const source = candidate && typeof candidate === "object" ? candidate : {};
    const nonNegativeInteger = value => Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;
    return {
      runs: nonNegativeInteger(source.runs),
      failures: nonNegativeInteger(source.failures),
      events: sanitizeIdList(source.events, VALID_IDS.events),
      enemies: sanitizeIdList(source.enemies, VALID_IDS.enemies),
      items: sanitizeIdList(source.items, VALID_IDS.items),
      cases: sanitizeIdList(source.cases, VALID_IDS.cases),
      endings: sanitizeIdList(source.endings, VALID_IDS.endings),
      achievements: sanitizeIdList(source.achievements, VALID_IDS.achievements),
      completedCharacters: sanitizeIdList(source.completedCharacters, VALID_IDS.completedCharacters)
    };
  }

  function settings() {
    return sanitizeSettings(readJSON(SETTINGS_KEY, {}));
  }

  function profile() {
    return sanitizeProfile(readJSON(PROFILE_KEY, {}));
  }

  function saveProfile(next) {
    writeJSON(PROFILE_KEY, sanitizeProfile(next));
  }

  function updateProfile(bucket, id) {
    const next = profile();
    if (Array.isArray(next[bucket]) && !next[bucket].includes(id)) next[bucket].push(id);
    saveProfile(next);
    updateContinueButton();
    return next;
  }

  function applySettings() {
    const value = settings();
    document.body.classList.toggle("no-crt", !value.crt);
    document.body.classList.toggle("reduce-motion", value.reducedMotion);
    document.body.classList.toggle("high-contrast", value.highContrast);
    document.documentElement.style.setProperty("--font-scale", value.largeText ? "1.12" : "1");
  }

  function showScreen(id) {
    let activeScreen = null;
    document.body.dataset.screen = id;
    screens.forEach(screen => {
      const active = screen.id === `screen-${id}`;
      screen.classList.toggle("screen--active", active);
      screen.setAttribute("aria-hidden", String(!active));
      if (active) activeScreen = screen;
    });
    window.scrollTo({ top: 0, behavior: settings().reducedMotion ? "auto" : "smooth" });
    window.requestAnimationFrame(() => {
      const heading = activeScreen?.querySelector("h1, h2");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    });
  }

  function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(values) {
    const copy = [...values];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const other = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
  }

  function getCharacter(id = state?.characterId) {
    return DATA.characters.find(character => character.id === id);
  }

  function getCase(id = state?.currentCaseId) {
    return DATA.cases.find(caseData => caseData.id === id);
  }

  function getEnemy(id) {
    return DATA.enemies.find(enemy => enemy.id === id) || DATA.bosses.find(enemy => enemy.id === id);
  }

  function getItem(id) {
    return DATA.items[id];
  }

  function getWeather(id = state?.weather) {
    return DATA.weather.find(weather => weather.id === id) || DATA.weather[0];
  }

  function getProgress(caseId = state?.currentCaseId) {
    if (!state || !caseId) return null;
    return state.caseProgress[caseId];
  }

  function saveGame() {
    if (!state) return;
    state.savedAt = new Date().toISOString();
    writeJSON(SAVE_KEY, state);
    updateContinueButton();
  }

  function eraseSave() {
    storageRemove(SAVE_KEY);
    state = null;
    currentEnemy = null;
    combatMeta = null;
    updateContinueButton();
  }

  function validSave(candidate) {
    if (!candidate || typeof candidate !== "object" || !SUPPORTED_SAVE_VERSIONS.has(candidate.version)) return false;
    if (!getCharacter(candidate.characterId) || !Array.isArray(candidate.completedCases)) return false;
    if (!candidate.caseProgress || typeof candidate.caseProgress !== "object" || Array.isArray(candidate.caseProgress)) return false;
    if (candidate.currentCaseId != null && !getCase(candidate.currentCaseId)) return false;
    if (candidate.currentCaseId && (!candidate.caseProgress[candidate.currentCaseId] || typeof candidate.caseProgress[candidate.currentCaseId] !== "object")) return false;
    for (const key of ["health", "maxHealth", "sanity", "maxSanity", "power", "signal", "day", "minutes"]) {
      if (!Number.isFinite(Number(candidate[key]))) return false;
    }
    if (candidate.pendingEventId != null) {
      const event = DATA.events.find(entry => entry.id === candidate.pendingEventId);
      if (!event || event.case !== candidate.currentCaseId) return false;
    }
    if (candidate.pendingCombat != null) {
      if (!candidate.currentCaseId || typeof candidate.pendingCombat !== "object" || !getEnemy(candidate.pendingCombat.enemyId)) return false;
      const currentCase = getCase(candidate.currentCaseId);
      const allowedEnemies = new Set([...currentCase.enemies, currentCase.boss]);
      if (!allowedEnemies.has(candidate.pendingCombat.enemyId) || !Number.isFinite(Number(candidate.pendingCombat.hp)) || Number(candidate.pendingCombat.hp) <= 0) return false;
    }
    return true;
  }

  function updateContinueButton() {
    const candidate = readJSON(SAVE_KEY, null);
    const available = validSave(candidate);
    const button = document.getElementById("continue-btn");
    const meta = document.getElementById("continue-meta");
    const summary = document.getElementById("profile-summary");
    button.disabled = !available;
    button.title = available ? "Continuar campaña guardada" : "No hay una campaña compatible guardada";
    if (meta) {
      if (available) {
        const character = getCharacter(candidate.characterId);
        const activeCase = candidate.currentCaseId ? getCase(candidate.currentCaseId) : null;
        const solved = Array.isArray(candidate.completedCases) ? candidate.completedCases.filter(id => id !== "nexus").length : 0;
        meta.textContent = `${character?.name || "Investigador"} · ${activeCase?.location || `${solved}/4 casos resueltos`}`;
      } else {
        meta.textContent = "No hay una campaña guardada";
      }
    }
    if (summary) {
      const stored = profile();
      summary.textContent = `${stored.achievements.length}/${DATA.achievements.length} logros · ${stored.endings.length}/4 finales`;
    }
  }

  function loadGame() {
    const candidate = readJSON(SAVE_KEY, null);
    if (!validSave(candidate)) {
      storageRemove(SAVE_KEY);
      updateContinueButton();
      showToast("La partida guardada no es compatible con esta versión.");
      return;
    }
    state = candidate;
    normalizeState();
    if (state.currentCaseId) {
      renderGame();
      showScreen("game");
      restoreTransientState();
    } else {
      renderMap();
      showScreen("map");
    }
  }

  function normalizeState() {
    const character = getCharacter(state.characterId);
    const numberOr = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
    const integerOr = (value, fallback = 0) => Math.floor(numberOr(value, fallback));

    // Las partidas anteriores traen las estadísticas del equilibrio viejo. Si se
    // conservaran, la campaña se jugaría con la vida y la cordura de la v1.0.x
    // contra los enemigos recalibrados. Se reajustan a la escala actual
    // conservando la proporción de vida y cordura que llevara el jugador.
    const rebalanced = REBALANCED_SAVE_VERSIONS.has(state.version);
    const previousMaxHealth = clamp(integerOr(state.maxHealth, character.health), 1, 500);
    const previousMaxSanity = clamp(integerOr(state.maxSanity, character.sanity), 1, 500);
    const healthRatio = clamp(integerOr(state.health, previousMaxHealth), 0, previousMaxHealth) / previousMaxHealth;
    const sanityRatio = clamp(integerOr(state.sanity, previousMaxSanity), 0, previousMaxSanity) / previousMaxSanity;

    state.version = DATA.version;
    state.maxHealth = rebalanced ? character.health : previousMaxHealth;
    state.maxSanity = rebalanced ? character.sanity : previousMaxSanity;
    state.power = rebalanced ? character.power : clamp(integerOr(state.power, character.power), 1, 50);
    state.health = rebalanced
      ? clamp(Math.round(healthRatio * state.maxHealth), 1, state.maxHealth)
      : clamp(integerOr(state.health, state.maxHealth), 0, state.maxHealth);
    state.sanity = rebalanced
      ? clamp(Math.round(sanityRatio * state.maxSanity), 1, state.maxSanity)
      : clamp(integerOr(state.sanity, state.maxSanity), 0, state.maxSanity);
    if (Array.isArray(state.inventory)) {
      const unique = [...new Set(state.inventory.filter(id => typeof id === "string" && getItem(id)))];
      let carried = 0;
      state.inventory = unique.filter(id => isKeyItem(id) || ++carried <= MAX_CONSUMABLES);
    } else {
      state.inventory = [];
    }
    state.log = Array.isArray(state.log) ? state.log.map(entry => String(entry).slice(0, 300)).slice(0, 18) : [];
    state.completedCases = sanitizeIdList(state.completedCases, VALID_IDS.cases);
    state.caseProgress = state.caseProgress && typeof state.caseProgress === "object" && !Array.isArray(state.caseProgress) ? state.caseProgress : {};

    for (const caseData of DATA.cases) {
      const raw = state.caseProgress[caseData.id];
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        delete state.caseProgress[caseData.id];
        continue;
      }
      const allowedEvents = new Set(caseData.events);
      state.caseProgress[caseData.id] = {
        clues: clamp(integerOr(raw.clues), 0, caseData.clueTarget + 10),
        explored: clamp(integerOr(raw.explored), 0, 999),
        rests: clamp(integerOr(raw.rests), 0, B.restCap),
        eventDeck: Array.isArray(raw.eventDeck) ? raw.eventDeck.filter(id => allowedEvents.has(id)).slice(0, caseData.events.length) : shuffle(caseData.events),
        visited: Array.isArray(raw.visited) ? raw.visited.filter(id => allowedEvents.has(id)).slice(-60) : [],
        bossDefeated: raw.bossDefeated === true,
        completed: raw.completed === true,
        noRest: raw.noRest !== false,
        resolution: typeof raw.resolution === "string" ? raw.resolution.slice(0, 80) : "",
        resolutionResult: typeof raw.resolutionResult === "string" ? raw.resolutionResult.slice(0, 500) : ""
      };
    }

    state.currentCaseId = state.currentCaseId && getCase(state.currentCaseId) && state.caseProgress[state.currentCaseId] ? state.currentCaseId : null;
    state.seals = clamp(integerOr(state.seals), 0, 99);
    state.knowledge = clamp(integerOr(state.knowledge), 0, 99);
    state.corruption = clamp(integerOr(state.corruption), 0, 99);
    state.signal = clamp(integerOr(state.signal), 0, 100);
    state.day = clamp(integerOr(state.day, 1), 1, 9999);
    state.minutes = ((integerOr(state.minutes, 22 * 60 + 30) % 1440) + 1440) % 1440;
    state.weather = getWeather(state.weather).id;
    state.campaignNoRest = state.campaignNoRest !== false;
    state.totalKills = clamp(integerOr(state.totalKills), 0, 999999);
    state.totalRests = clamp(integerOr(state.totalRests), 0, 999999);
    state.nextAttackPenalty = clamp(integerOr(state.nextAttackPenalty), 0, 12);
    state.universeShardUsed = state.universeShardUsed === true;

    const pendingEvent = DATA.events.find(event => event.id === state.pendingEventId && event.case === state.currentCaseId);
    state.pendingEventId = pendingEvent ? pendingEvent.id : null;

    if (state.pendingCombat && typeof state.pendingCombat === "object") {
      const template = getEnemy(state.pendingCombat.enemyId);
      const currentCase = getCase(state.currentCaseId);
      const allowedEnemies = currentCase ? new Set([...currentCase.enemies, currentCase.boss]) : new Set();
      const rawMeta = state.pendingCombat.meta && typeof state.pendingCombat.meta === "object" ? state.pendingCombat.meta : {};
      state.pendingCombat = template && allowedEnemies.has(template.id) ? {
        enemyId: template.id,
        hp: clamp(integerOr(state.pendingCombat.hp, template.hp), 1, template.hp),
        attackDebuff: clamp(integerOr(state.pendingCombat.attackDebuff), 0, 20),
        meta: {
          boss: rawMeta.boss === true || DATA.bosses.some(boss => boss.id === template.id),
          specialUsed: rawMeta.specialUsed === true,
          guard: clamp(integerOr(rawMeta.guard), 0, 20),
          boost: clamp(integerOr(rawMeta.boost), -12, 30)
        }
      } : null;
    } else {
      state.pendingCombat = null;
    }
    if (state.pendingCombat) state.pendingEventId = null;
    saveGame();
  }

  function syncCombatState() {
    if (!state) return;
    state.pendingCombat = currentEnemy && combatMeta ? {
      enemyId: currentEnemy.id,
      hp: currentEnemy.hp,
      attackDebuff: currentEnemy.attackDebuff,
      meta: { ...combatMeta }
    } : null;
  }

  function clearCombatState() {
    currentEnemy = null;
    combatMeta = null;
    if (state) state.pendingCombat = null;
  }

  function restoreTransientState() {
    if (!state?.currentCaseId) return;
    if (state.pendingCombat) {
      const template = getEnemy(state.pendingCombat.enemyId);
      if (template) {
        currentEnemy = {
          ...template,
          hp: state.pendingCombat.hp,
          maxHp: template.hp,
          attackDebuff: state.pendingCombat.attackDebuff
        };
        combatMeta = { ...state.pendingCombat.meta };
        renderCombat("Combate restaurado desde el guardado automático.");
        return;
      }
    }
    if (state.pendingEventId) {
      const event = DATA.events.find(entry => entry.id === state.pendingEventId);
      if (event) {
        showEvent(event);
        return;
      }
    }
    const progress = getProgress();
    if (progress?.bossDefeated && !progress.completed) {
      if (getCase().final) showFinalChoice();
      else showCaseResolution();
    }
  }

  function renderCharacterSelect() {
    document.getElementById("character-grid").innerHTML = DATA.characters.map((character, index) => `
      <button class="character-card" data-character="${character.id}" data-index="${String(index + 1).padStart(2, "0")}">
        <img src="${character.image}" alt="Retrato pixel art de ${escapeHTML(character.name)}" width="320" height="400" loading="lazy" decoding="async">
        <div class="character-card__body">
          <span class="role">${escapeHTML(character.role)}</span>
          <h3>${escapeHTML(character.name)}</h3>
          <p>${escapeHTML(character.description)}</p>
          <div class="stat-grid" aria-label="Estadísticas">
            <span>VIDA<br><b>${character.health}</b></span>
            <span>CORDURA<br><b>${character.sanity}</b></span>
            <span>FUERZA<br><b>${character.power}</b></span>
            <span>FOCO<br><b>${character.focus}</b></span>
          </div>
          <p class="passive">${escapeHTML(character.passive)}</p>
          <p class="special-line"><b>${escapeHTML(character.special)}:</b> ${escapeHTML(character.specialText)}</p>
        </div>
      </button>
    `).join("");
  }

  function startNewGame(characterId) {
    const character = getCharacter(characterId);
    if (!character) return;
    if (storageGet(SAVE_KEY) && !confirm("Hay una campaña guardada. ¿Sustituirla por una nueva?")) return;

    const startingItems = character.passiveKey === "spiritDamage"
      ? ["incense", "salt"]
      : character.passiveKey === "signalControl"
        ? ["battery", "flashlight"]
        : ["flashlight", "medkit"];

    state = {
      version: DATA.version,
      characterId: character.id,
      health: character.health,
      maxHealth: character.health,
      sanity: character.sanity,
      maxSanity: character.sanity,
      power: character.power,
      signal: B.startSignal,
      day: 1,
      minutes: 22 * 60 + 30,
      weather: "rain",
      completedCases: [],
      currentCaseId: null,
      caseProgress: {},
      inventory: startingItems,
      log: ["La Señal despierta en Black Hollow."],
      seals: 0,
      knowledge: 0,
      corruption: 0,
      totalKills: 0,
      totalRests: 0,
      campaignNoRest: true,
      nextAttackPenalty: 0,
      pendingEventId: null,
      pendingCombat: null,
      startedAt: new Date().toISOString()
    };

    const nextProfile = profile();
    nextProfile.runs += 1;
    for (const item of startingItems) if (!nextProfile.items.includes(item)) nextProfile.items.push(item);
    saveProfile(nextProfile);
    saveGame();
    renderMap();
    showScreen("map");
    showToast(`CAMPAÑA INICIADA: ${character.name}`);
  }

  function currentDaypart() {
    const minutes = ((state.minutes % 1440) + 1440) % 1440;
    if (minutes < 300) return "MADRUGADA";
    if (minutes < 480) return "AMANECER";
    if (minutes < 720) return "MAÑANA";
    if (minutes < 1020) return "TARDE";
    if (minutes < 1230) return "ATARDECER";
    return "NOCHE";
  }

  function formatTime() {
    const value = ((state.minutes % 1440) + 1440) % 1440;
    return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  }

  function advanceTime(amount, allowWeather = true) {
    const oldDay = state.day;
    state.minutes += amount;
    while (state.minutes >= 1440) {
      state.minutes -= 1440;
      state.day += 1;
    }
    if (allowWeather && (Math.random() < 0.38 || state.day !== oldDay)) changeWeather();
  }

  function changeWeather() {
    const caseData = getCase();
    const options = caseData?.weather?.length ? caseData.weather : DATA.weather.map(weather => weather.id);
    const alternatives = options.filter(id => id !== state.weather);
    if (alternatives.length) state.weather = alternatives[randomInt(0, alternatives.length - 1)];
  }

  function applySignal(amount) {
    const character = getCharacter();
    let adjusted = amount;
    if (amount > 0 && character.passiveKey === "signalControl") adjusted = Math.max(0, amount - 2);
    state.signal = clamp(state.signal + adjusted, 0, 100);
  }

  function pushLog(message) {
    if (!message) return;
    state.log.unshift(String(message));
    state.log = state.log.slice(0, 14);
  }

  function renderMap() {
    if (!state) return;
    const character = getCharacter();
    document.getElementById("map-portrait").src = character.image;
    document.getElementById("map-portrait").alt = `Retrato de ${character.name}`;
    document.getElementById("map-name").textContent = character.name;
    document.getElementById("map-role").textContent = character.role;
    document.getElementById("map-health").textContent = `${state.health}/${state.maxHealth}`;
    document.getElementById("map-sanity").textContent = `${state.sanity}/${state.maxSanity}`;
    document.getElementById("map-signal").textContent = `${state.signal}%`;
    document.getElementById("map-time").textContent = `D${state.day} · ${formatTime()}`;
    document.getElementById("map-seals").textContent = state.seals;
    document.getElementById("map-knowledge").textContent = state.knowledge;
    document.getElementById("map-cases").textContent = `${state.completedCases.filter(id => id !== "nexus").length}/4`;

    const caseGrid = document.getElementById("case-grid");
    caseGrid.innerHTML = DATA.cases.map(caseData => {
      const complete = state.completedCases.includes(caseData.id);
      const active = state.currentCaseId === caseData.id;
      const locked = Boolean(caseData.final && state.completedCases.filter(id => id !== "nexus").length < 4);
      const progress = state.caseProgress[caseData.id];
      const status = complete
        ? "MISTERIO RESUELTO"
        : locked
          ? "BLOQUEADO: RESUELVE 4 CASOS"
          : progress
            ? `${progress.clues}/${caseData.clueTarget} PISTAS · ${progress.explored} EVENTOS`
            : "SIN INVESTIGAR";
      const button = complete ? "Revisar expediente" : progress ? "Continuar investigación" : "Entrar en la anomalía";
      const glow = caseData.scene === "hospital" ? "rgba(66,155,132,.20)" : caseData.scene === "forest" ? "rgba(116,139,64,.20)" : caseData.scene === "mansion" ? "rgba(143,83,130,.20)" : caseData.scene === "nexus" ? "rgba(218,132,38,.25)" : "rgba(200,39,61,.18)";
      return `
        <article class="case-card ${complete ? "completed" : ""} ${active ? "active" : ""} ${locked ? "locked" : ""}" data-icon="${escapeHTML(caseData.icon)}" data-scene="${escapeHTML(caseData.scene)}" style="--case-glow:${glow}">
          <span class="case-card__version">EXPEDIENTE ${String(caseData.order).padStart(2, "0")} · ${escapeHTML(caseData.version)}</span>
          <h3>${escapeHTML(caseData.title)}</h3>
          <span class="case-location">${escapeHTML(caseData.location)}</span>
          <p><b>${escapeHTML(caseData.tagline)}</b></p>
          <p>${escapeHTML(caseData.description)}</p>
          <div class="case-status">
            <span>${status}</span>
            <button class="case-card__action" data-case="${caseData.id}" ${locked ? "disabled" : ""}>${button}</button>
          </div>
        </article>
      `;
    }).join("");

    const solved = state.completedCases.filter(id => id !== "nexus").length;
    document.getElementById("brief-title").textContent = solved >= 4 ? "El Nexo 404 está abierto" : solved ? `${solved} de 4 focos silenciados` : "La ciudad sigue transmitiendo";
    document.getElementById("brief-copy").textContent = solved >= 4
      ? "El icono del Universo 404 se ha convertido en un mapa. La Señal Madre espera debajo de Black Hollow."
      : "Cada anomalía contiene una parte de la frecuencia. Las decisiones de resolución alterarán el final de la campaña.";

    const currentIndex = DATA.weather.findIndex(weather => weather.id === state.weather);
    document.getElementById("weather-report").innerHTML = [0, 1, 2].map(offset => {
      const weather = DATA.weather[(currentIndex + offset) % DATA.weather.length];
      return `<div class="weather-day"><strong>${offset === 0 ? "AHORA" : `+${offset} TURNO${offset > 1 ? "S" : ""}`}</strong><span>${weather.icon} ${escapeHTML(weather.name)}</span></div>`;
    }).join("");
    saveGame();
  }

  function enterCase(caseId) {
    const caseData = getCase(caseId);
    if (!caseData || (caseData.final && state.completedCases.filter(id => id !== "nexus").length < 4)) return;
    if (state.completedCases.includes(caseId)) {
      showCaseReview(caseData);
      return;
    }
    if (!state.caseProgress[caseId]) {
      state.caseProgress[caseId] = {
        clues: 0,
        explored: 0,
        rests: 0,
        eventDeck: shuffle(caseData.events),
        visited: [],
        bossDefeated: false,
        completed: false,
        noRest: true
      };
      pushLog(caseData.intro);
    }
    clearCombatState();
    state.pendingEventId = null;
    state.currentCaseId = caseId;
    state.weather = caseData.weather[randomInt(0, caseData.weather.length - 1)];
    saveGame();
    renderGame();
    showScreen("game");
  }

  function showCaseReview(caseData) {
    const progress = state.caseProgress[caseData.id];
    openDialog(`
      <div class="dialog-body">
        <p class="event-kicker">EXPEDIENTE CERRADO</p>
        <h2 id="dialog-title">${escapeHTML(caseData.title)}</h2>
        <p>${escapeHTML(caseData.description)}</p>
        <p><b>Resolución:</b> ${escapeHTML(progress?.resolutionResult || "La anomalía fue contenida.")}</p>
        <div class="dialog-actions"><button data-close-dialog>Cerrar expediente</button></div>
      </div>
    `);
  }

  function renderGame() {
    if (!state?.currentCaseId) return;
    const character = getCharacter();
    const caseData = getCase();
    const progress = getProgress();
    const weather = getWeather();
    const ready = progress.clues >= caseData.clueTarget && progress.explored >= caseData.minExplores;

    document.getElementById("hud-portrait").src = character.image;
    document.getElementById("hud-portrait").alt = `Retrato de ${character.name}`;
    document.getElementById("hud-name").textContent = character.name;
    document.getElementById("hud-case").textContent = caseData.title;
    document.getElementById("health-value").textContent = `${state.health}/${state.maxHealth}`;
    document.getElementById("sanity-value").textContent = `${state.sanity}/${state.maxSanity}`;
    document.getElementById("health-bar").style.width = `${(state.health / state.maxHealth) * 100}%`;
    document.getElementById("sanity-bar").style.width = `${(state.sanity / state.maxSanity) * 100}%`;
    const healthMeter = document.getElementById("health-meter");
    healthMeter.setAttribute("aria-valuemax", String(state.maxHealth));
    healthMeter.setAttribute("aria-valuenow", String(state.health));
    const sanityMeter = document.getElementById("sanity-meter");
    sanityMeter.setAttribute("aria-valuemax", String(state.maxSanity));
    sanityMeter.setAttribute("aria-valuenow", String(state.sanity));
    document.getElementById("signal-value").textContent = `${state.signal}%`;
    document.body.classList.toggle("signal-danger", state.signal >= B.highSignalThreshold);
    document.getElementById("clue-value").textContent = `${Math.min(progress.clues, caseData.clueTarget)}/${caseData.clueTarget}`;
    document.getElementById("time-label").textContent = `DÍA ${state.day} · ${currentDaypart()} · ${formatTime()}`;
    document.getElementById("weather-label").textContent = `${weather.icon} ${weather.name.toUpperCase()}`;
    document.getElementById("location-title").textContent = ready ? `${caseData.location}: el foco responde` : caseData.location;
    document.getElementById("scene-description").textContent = ready
      ? `Las ${caseData.clueTarget} pistas forman un patrón. ${getEnemy(caseData.boss).name} ya sabe que estás aquí.`
      : caseData.intro;

    const art = document.getElementById("scene-art");
    art.className = `scene-art scene--${caseData.scene}`;
    art.dataset.weather = state.weather;
    document.getElementById("scene-code").textContent = caseData.final ? "404" : String(caseData.order).padStart(2, "0");

    document.getElementById("inventory-count").textContent = `${consumableCount()}/${MAX_CONSUMABLES}`;
    document.getElementById("inventory-list").innerHTML = state.inventory.length
      ? state.inventory.map(id => {
          const item = getItem(id);
          const usable = ["health", "sanity", "sanityRisk", "signal", "hybridRisk", "battery", "guard", "sedative"].includes(item.kind);
          const key = isKeyItem(id);
          return `<li title="${escapeHTML(item.description)}"${key ? ' class="key-item"' : ""}>${usable ? `<button class="inventory-button" data-use-item="${id}">${escapeHTML(item.name)}</button>` : escapeHTML(item.name)}</li>`;
        }).join("")
      : `<li class="empty">Mochila vacía</li>`;
    document.getElementById("game-log").innerHTML = state.log.map(entry => `<li>${escapeHTML(entry)}</li>`).join("");

    document.getElementById("objective-text").textContent = progress.bossDefeated
      ? "El foco ha caído. Decide cómo cerrar esta anomalía."
      : ready
        ? `Confronta a ${getEnemy(caseData.boss).name}.`
        : `${caseData.objective} Faltan ${Math.max(0, caseData.clueTarget - progress.clues)} pista(s).`;
    document.getElementById("confront-btn").disabled = !ready || progress.bossDefeated;
    document.getElementById("rest-btn").disabled = progress.rests >= B.restCap;
    saveGame();
  }

  function nextEvent(caseData, progress) {
    if (!progress.eventDeck.length) progress.eventDeck = shuffle(caseData.events);
    const eventId = progress.eventDeck.shift();
    return DATA.events.find(event => event.id === eventId);
  }

  function explore() {
    if (!canAct()) return;
    const caseData = getCase();
    const progress = getProgress();
    progress.explored += 1;
    advanceTime(randomInt(28, 44));
    applySignal(B.signalExplore + getWeather().signal);
    const event = nextEvent(caseData, progress);
    if (!event) return;
    progress.visited.push(event.id);
    state.pendingEventId = event.id;
    updateProfile("events", event.id);
    saveGame();
    showEvent(event);
  }

  function investigate() {
    if (!canAct()) return;
    const caseData = getCase();
    const progress = getProgress();
    advanceTime(randomInt(16, 28));
    applySignal(B.signalInvestigate + getWeather().signal);
    let chance = B.clueBaseChance + getWeather().clue;
    if (getCharacter().passiveKey === "extraClue") chance += 0.12;
    if (state.inventory.includes("compass")) chance += 0.12;
    if (progress.clues >= caseData.clueTarget) chance = 0;

    if (Math.random() < chance) {
      progress.clues += 1;
      pushLog("Una marca repetida conecta las evidencias del caso.");
      showToast("PISTA ENCONTRADA");
    } else if (Math.random() < B.investigateAmbushChance) {
      const enemyId = caseData.enemies[randomInt(0, caseData.enemies.length - 1)];
      pushLog("La investigación atrae algo que prefería permanecer oculto.");
      renderGame();
      startCombat(enemyId);
      return;
    } else {
      state.sanity = clamp(state.sanity - randomInt(B.investigateSanityMin, B.investigateSanityMax), 0, state.maxSanity);
      pushLog("Solo encuentras una versión de la escena que no coincide con tus recuerdos.");
    }
    renderGame();
    checkFailure();
  }

  function rest() {
    if (!canAct()) return;
    const progress = getProgress();
    if (progress.rests >= B.restCap) {
      showToast("No puedes volver a descansar en este misterio.");
      return;
    }
    progress.rests += 1;
    progress.noRest = false;
    state.campaignNoRest = false;
    state.totalRests += 1;
    advanceTime(68);
    applySignal(B.signalRest + getWeather().signal);
    state.health = clamp(state.health + B.restHealth, 0, state.maxHealth);
    state.sanity = clamp(state.sanity + B.restSanity, 0, state.maxSanity);
    pushLog("Cierras los ojos unos minutos. Algo permanece despierto por ti.");
    renderGame();
    checkFailure();
  }

  function returnToMap() {
    if (!state) return;
    saveGame();
    state.currentCaseId = null;
    renderMap();
    showScreen("map");
    showToast("Progreso de investigación guardado.");
  }

  function showEvent(event) {
    const character = getCharacter();
    state.pendingEventId = event.id;
    saveGame();
    openDialog(`
      <div class="dialog-body">
        <p class="event-kicker">EVENTO · ${escapeHTML(getCase().location)}</p>
        <h2 id="dialog-title">${escapeHTML(event.title)}</h2>
        <p>${escapeHTML(event.text)}</p>
        <div class="dialog-actions">
          ${event.choices.map((choice, index) => {
            const passiveLocked = choice.requiresPassive && choice.requiresPassive !== character.passiveKey;
            const neededItem = choice.outcome?.useItem;
            const itemLocked = neededItem && !state.inventory.includes(neededItem);
            const disabled = passiveLocked || itemLocked;
            const note = passiveLocked ? "Opción exclusiva de otro investigador." : itemLocked ? `Necesitas: ${getItem(neededItem)?.name || neededItem}.` : "";
            return `<button data-event-choice="${index}" ${disabled ? "disabled" : ""}>${index + 1}. ${escapeHTML(choice.label)}${note ? `<span class="choice-note">${escapeHTML(note)}</span>` : ""}</button>`;
          }).join("")}
        </div>
      </div>
    `);
    dialogContent.querySelectorAll("[data-event-choice]").forEach(button => {
      button.addEventListener("click", () => resolveEventChoice(event, Number(button.dataset.eventChoice)));
    });
  }

  function resolveEventChoice(event, index) {
    const choice = event.choices[index];
    if (!choice) return;
    const outcome = choice.outcome || {};
    state.pendingEventId = null;
    applyOutcome(outcome);
    closeDialog();
    renderGame();
    if (outcome.enemy) {
      startCombat(outcome.enemy);
    } else {
      checkFailure();
    }
  }

  function applyOutcome(outcome) {
    if (outcome.health) state.health = clamp(state.health + outcome.health, 0, state.maxHealth);
    if (outcome.sanity) state.sanity = clamp(state.sanity + outcome.sanity, 0, state.maxSanity);
    if (outcome.signal || outcome.doom) applySignal(Number(outcome.signal || outcome.doom));
    if (outcome.clue) {
      let found = Number(outcome.clue);
      if (getCharacter().passiveKey === "extraClue" && Math.random() < 0.18) {
        found += 1;
        showToast("LUCÍA CONECTA UNA PISTA ADICIONAL");
      }
      getProgress().clues += found;
    }
    if (outcome.item) addItem(outcome.item);
    if (outcome.useItem && state.inventory.includes(outcome.useItem)) removeItem(outcome.useItem);
    if (outcome.seals) state.seals += Number(outcome.seals);
    if (outcome.knowledge) state.knowledge += Number(outcome.knowledge);
    if (outcome.corruption) state.corruption += Number(outcome.corruption);
    if (outcome.log) pushLog(outcome.log);
    advanceTime(randomInt(5, 12), false);
    beep(118, 0.06);
  }

  function isKeyItem(id) {
    return KEY_KINDS.includes(getItem(id)?.kind);
  }

  function consumableCount(inventory = state.inventory) {
    return inventory.filter(entry => !isKeyItem(entry)).length;
  }

  function addItem(id) {
    const item = getItem(id);
    if (!item || state.inventory.includes(id)) return false;
    if (!isKeyItem(id) && consumableCount() >= MAX_CONSUMABLES) {
      pushLog(`No hay espacio para ${item.name}.`);
      showToast("MOCHILA LLENA");
      return false;
    }
    state.inventory.push(id);
    updateProfile("items", id);
    const currentProfile = profile();
    if (currentProfile.items.length >= 12) unlockAchievement("collector");
    showToast(`OBJETO: ${item.name}`);
    return true;
  }

  function removeItem(id) {
    const index = state.inventory.indexOf(id);
    if (index >= 0) state.inventory.splice(index, 1);
  }

  function useItemOutside(id) {
    if (!state?.inventory.includes(id) || currentEnemy) return;
    const item = getItem(id);
    if (!item) return;
    let used = true;
    if (item.kind === "health") state.health = clamp(state.health + item.value, 0, state.maxHealth);
    else if (item.kind === "sanity") state.sanity = clamp(state.sanity + item.value, 0, state.maxSanity);
    else if (item.kind === "sanityRisk") {
      state.sanity = clamp(state.sanity + item.value, 0, state.maxSanity);
      applySignal(8);
    } else if (item.kind === "signal") applySignal(-item.value);
    else if (item.kind === "battery") {
      applySignal(-item.value);
      state.health = clamp(state.health + 6, 0, state.maxHealth);
    } else if (item.kind === "hybridRisk") {
      state.health = clamp(state.health + item.value, 0, state.maxHealth);
      state.sanity = clamp(state.sanity + item.value, 0, state.maxSanity);
      state.corruption += 1;
    } else if (item.kind === "guard") {
      state.sanity = clamp(state.sanity + item.value, 0, state.maxSanity);
      applySignal(-4);
    } else if (item.kind === "sedative") {
      state.sanity = clamp(state.sanity + item.value, 0, state.maxSanity);
      state.nextAttackPenalty = Math.max(state.nextAttackPenalty || 0, 4);
    } else used = false;
    if (!used) {
      showToast(item.description);
      return;
    }
    removeItem(id);
    pushLog(`Usas ${item.name}.`);
    renderGame();
    checkFailure();
  }

  function confront() {
    if (!canAct()) return;
    const caseData = getCase();
    const progress = getProgress();
    if (progress.clues < caseData.clueTarget || progress.explored < caseData.minExplores || progress.bossDefeated) return;
    const boss = getEnemy(caseData.boss);
    openDialog(`
      <div class="dialog-body">
        <p class="event-kicker">CONFRONTACIÓN</p>
        <h2 id="dialog-title">${escapeHTML(boss.name)}</h2>
        <p>${escapeHTML(boss.text)}</p>
        <p>El clima es <b>${escapeHTML(getWeather().name)}</b>. La Señal marca <b>${state.signal}%</b>.</p>
        <div class="dialog-actions">
          <button id="fight-boss">Entrar en el foco</button>
          <button data-close-dialog>Todavía no</button>
        </div>
      </div>
    `);
    document.getElementById("fight-boss").addEventListener("click", () => {
      closeDialog();
      startCombat(caseData.boss, { boss: true });
    });
  }

  function startCombat(enemyId, options = {}) {
    const template = getEnemy(enemyId);
    if (!template) return;
    currentEnemy = {
      ...template,
      maxHp: template.hp,
      attackDebuff: 0
    };
    combatMeta = {
      boss: Boolean(options.boss || DATA.bosses.some(boss => boss.id === enemyId)),
      specialUsed: false,
      guard: 0,
      boost: -(state.nextAttackPenalty || 0)
    };
    state.nextAttackPenalty = 0;
    state.pendingEventId = null;

    if (combatMeta.boss && template.weakItem && state.inventory.includes(template.weakItem)) {
      const weakItem = getItem(template.weakItem);
      currentEnemy.hp -= weakItem.value;
      if (template.id === "dreamer") state.universeShardUsed = true;
      else removeItem(template.weakItem);
      pushLog(`${weakItem.name} debilita a ${template.name}.`);
      showToast(`DEBILIDAD EXPLOTADA: -${weakItem.value} PV`);
    }
    updateProfile("enemies", template.id);
    syncCombatState();
    saveGame();
    renderCombat();
  }

  function renderCombat(message = "") {
    if (!currentEnemy) return;
    syncCombatState();
    saveGame();
    const character = getCharacter();
    openDialog(`
      <div class="dialog-body">
        <p class="event-kicker">${combatMeta.boss ? "JEFE DE ANOMALÍA" : "ENCUENTRO"} · ${escapeHTML(getWeather().name)}</p>
        <div class="enemy-card">
          <div class="enemy-icon" aria-hidden="true">${escapeHTML(currentEnemy.icon)}</div>
          <div>
            <h2 id="dialog-title">${escapeHTML(currentEnemy.name)}</h2>
            <p>${escapeHTML(currentEnemy.text)}</p>
            <div class="combat-stats">
              <span>ENTIDAD: <strong>${Math.max(0, currentEnemy.hp)}/${currentEnemy.maxHp} PV</strong></span>
              <span>TÚ: <strong>${state.health}/${state.maxHealth} PV</strong></span>
              <span>CORDURA: <strong>${state.sanity}</strong></span>
              <span>SEÑAL: <strong>${state.signal}%</strong></span>
            </div>
            ${message ? `<p class="outcome">${escapeHTML(message)}</p>` : ""}
          </div>
        </div>
        <div class="dialog-actions">
          <button data-combat="attack">Atacar</button>
          <button data-combat="special" ${combatMeta.specialUsed ? "disabled" : ""}>${escapeHTML(character.special)}${combatMeta.specialUsed ? " · USADO" : ""}</button>
          <button data-combat="focus">Concentrarse</button>
          <button data-combat="item">Usar objeto</button>
          <button data-combat="flee" ${combatMeta.boss ? "disabled" : ""}>Huir</button>
        </div>
      </div>
    `);
    dialogContent.querySelectorAll("[data-combat]").forEach(button => button.addEventListener("click", () => combatAction(button.dataset.combat)));
  }

  function combatAction(action) {
    if (!currentEnemy || !state) return;
    const character = getCharacter();
    if (action === "attack") {
      let damage = state.power + randomInt(0, B.playerDamageBonusMax) + combatMeta.boost;
      combatMeta.boost = 0;
      if (character.passiveKey === "spiritDamage" && currentEnemy.type === "spirit") damage += 3;
      currentEnemy.hp -= damage;
      beep(78, 0.08);
      if (currentEnemy.hp <= 0) return winCombat(`Infliges ${damage} de daño.`);
      enemyTurn(`Infliges ${damage} de daño.`);
      return;
    }

    if (action === "special") {
      if (combatMeta.specialUsed) return;
      combatMeta.specialUsed = true;
      let message = "";
      if (character.passiveKey === "extraClue") {
        const damage = state.power + randomInt(5, 9) + combatMeta.boost;
        combatMeta.boost = 0;
        currentEnemy.hp -= damage;
        currentEnemy.attackDebuff = Math.max(currentEnemy.attackDebuff, 4);
        message = `Detectas el patrón: ${damage} de daño y reduces su próximo ataque.`;
      } else if (character.passiveKey === "spiritDamage") {
        state.sanity = clamp(state.sanity - 8, 0, state.maxSanity);
        let damage = state.power + randomInt(11, 16) + combatMeta.boost;
        combatMeta.boost = 0;
        if (currentEnemy.type === "spirit" || currentEnemy.type === "void") damage += 5;
        currentEnemy.hp -= damage;
        message = `El rito atraviesa la entidad por ${damage} de daño.`;
      } else {
        const damage = state.power + randomInt(7, 12) + combatMeta.boost;
        combatMeta.boost = 0;
        currentEnemy.hp -= damage;
        applySignal(-8);
        message = `La sobrecarga causa ${damage} de daño y reduce la Señal.`;
      }
      if (currentEnemy.hp <= 0) return winCombat(message);
      enemyTurn(message);
      return;
    }

    if (action === "focus") {
      state.sanity = clamp(state.sanity + character.focus, 0, state.maxSanity);
      combatMeta.guard = 3;
      enemyTurn(`Recuperas ${character.focus} de cordura y adoptas una guardia defensiva.`);
      return;
    }

    if (action === "item") {
      showCombatItems();
      return;
    }

    if (action === "flee") {
      const chance = character.passiveKey === "signalControl" ? 0.74 : 0.48;
      if (Math.random() < chance) {
        applySignal(7);
        pushLog(`Escapas de ${currentEnemy.name}, pero la frecuencia conserva tu rastro.`);
        clearCombatState();
        closeDialog();
        renderGame();
        checkFailure();
      } else {
        enemyTurn("La salida cambia de lugar antes de que puedas alcanzarla.");
      }
    }
  }

  function showCombatItems() {
    const usable = state.inventory.filter(id => ["health", "sanity", "sanityRisk", "signal", "hybridRisk", "battery", "guard", "boost", "ward", "sedative"].includes(getItem(id)?.kind));
    if (!usable.length) {
      renderCombat("No tienes objetos utilizables en combate.");
      return;
    }
    openDialog(`
      <div class="dialog-body">
        <p class="event-kicker">INVENTARIO DE COMBATE</p>
        <h2 id="dialog-title">Elige un objeto</h2>
        <div class="dialog-actions">
          ${usable.map(id => `<button data-combat-item="${id}"><b>${escapeHTML(getItem(id).name)}</b><span class="choice-note">${escapeHTML(getItem(id).description)}</span></button>`).join("")}
          <button id="combat-items-back">Volver al combate</button>
        </div>
      </div>
    `);
    dialogContent.querySelectorAll("[data-combat-item]").forEach(button => button.addEventListener("click", () => useCombatItem(button.dataset.combatItem)));
    document.getElementById("combat-items-back").addEventListener("click", () => renderCombat());
  }

  function useCombatItem(id) {
    if (!state.inventory.includes(id)) return;
    const item = getItem(id);
    let message = `Usas ${item.name}.`;
    if (item.kind === "health") state.health = clamp(state.health + item.value, 0, state.maxHealth);
    else if (item.kind === "sanity") state.sanity = clamp(state.sanity + item.value, 0, state.maxSanity);
    else if (item.kind === "sanityRisk") {
      state.sanity = clamp(state.sanity + item.value, 0, state.maxSanity);
      applySignal(8);
    } else if (item.kind === "signal") applySignal(-item.value);
    else if (item.kind === "battery") {
      applySignal(-item.value);
      state.health = clamp(state.health + 6, 0, state.maxHealth);
    } else if (item.kind === "hybridRisk") {
      state.health = clamp(state.health + item.value, 0, state.maxHealth);
      state.sanity = clamp(state.sanity + item.value, 0, state.maxSanity);
      state.corruption += 1;
    } else if (item.kind === "guard") {
      state.sanity = clamp(state.sanity + item.value, 0, state.maxSanity);
      combatMeta.guard = 8;
    } else if (item.kind === "sedative") {
      state.sanity = clamp(state.sanity + item.value, 0, state.maxSanity);
      combatMeta.boost -= 4;
      message += " Tu próximo ataque pierde 4 puntos de potencia.";
    } else if (item.kind === "boost") combatMeta.boost += item.value;
    else if (item.kind === "ward") {
      const damage = currentEnemy.type === "void" || currentEnemy.type === "spirit" ? item.value : Math.ceil(item.value / 2);
      currentEnemy.hp -= damage;
      message += ` La barrera causa ${damage} de daño.`;
    }
    removeItem(id);
    if (currentEnemy.hp <= 0) return winCombat(message);
    enemyTurn(message);
  }

  function enemyTurn(prefix) {
    const weather = getWeather();
    let damage = currentEnemy.attack + weather.enemy + randomInt(-2, 2) - combatMeta.guard - currentEnemy.attackDebuff;
    damage = Math.max(1, damage);
    let sanityDamage = Math.max(1, currentEnemy.sanity + (state.signal >= B.highSignalThreshold ? B.highSignalSanityPenalty : 0));
    if (state.inventory.includes("silverMirror") && currentEnemy.type === "spirit") {
      const reflected = 3;
      currentEnemy.hp -= reflected;
      prefix += ` El espejo refleja ${reflected} de daño.`;
    }
    state.health = clamp(state.health - damage, 0, state.maxHealth);
    state.sanity = clamp(state.sanity - sanityDamage, 0, state.maxSanity);
    applySignal(B.signalCombatRound + weather.signal);
    combatMeta.guard = 0;
    currentEnemy.attackDebuff = 0;
    advanceTime(randomInt(4, 8), false);
    if (currentEnemy.hp <= 0) return winCombat(prefix);
    if (checkFailure(true)) return;
    renderCombat(`${prefix} ${currentEnemy.name} responde: -${damage} vida, -${sanityDamage} cordura.`);
  }

  function winCombat(message) {
    const defeated = currentEnemy;
    const wasBoss = combatMeta.boss;
    state.totalKills += 1;
    unlockAchievement("first-blood");
    if (wasBoss && state.health >= 45) unlockAchievement("survivor");
    pushLog(`Derrotas a ${defeated.name}.`);
    clearCombatState();
    closeDialog();
    if (wasBoss) {
      const progress = getProgress();
      progress.bossDefeated = true;
      renderGame();
      if (getCase().final) showFinalChoice();
      else showCaseResolution();
    } else {
      if (Math.random() < B.dropChance) addRandomConsumable();
      renderGame();
      showToast(message || "ENTIDAD DERROTADA");
      checkFailure();
    }
  }

  function addRandomConsumable() {
    const pool = ["medkit", "pills", "battery", "incense"];
    addItem(pool[randomInt(0, pool.length - 1)]);
  }

  function showCaseResolution() {
    const caseData = getCase();
    const resolution = caseData.resolution;
    openDialog(`
      <div class="dialog-body">
        <p class="event-kicker">MISTERIO RESUELTO</p>
        <h2 id="dialog-title">${escapeHTML(resolution.title)}</h2>
        <p>${escapeHTML(resolution.text)}</p>
        <div class="dialog-actions">
          ${resolution.choices.map((choice, index) => {
            const signal = Number(choice.signal || 0);
            const notes = [choice.seals ? "+1 Sello" : "+1 Conocimiento"];
            if (choice.corruption) notes.push("+1 Corrupción");
            if (signal) notes.push(`${signal > 0 ? "+" : ""}${signal}% Señal`);
            if (choice.item) notes.push(getItem(choice.item)?.name || choice.item);
            return `<button data-resolution="${index}">${escapeHTML(choice.label)}<span class="choice-note">${escapeHTML(notes.join(" · "))}</span></button>`;
          }).join("")}
        </div>
      </div>
    `);
    dialogContent.querySelectorAll("[data-resolution]").forEach(button => button.addEventListener("click", () => resolveCase(Number(button.dataset.resolution))));
  }

  function resolveCase(index) {
    const caseData = getCase();
    const progress = getProgress();
    const choice = caseData.resolution.choices[index];
    if (!choice) return;
    state.seals += Number(choice.seals || 0);
    state.knowledge += Number(choice.knowledge || 0);
    state.corruption += Number(choice.corruption || 0);
    applySignal(Number(choice.signal || 0));
    if (state.signal >= 100) {
      closeDialog();
      checkFailure();
      return;
    }
    if (choice.item) addItem(choice.item);
    progress.completed = true;
    progress.resolution = choice.id;
    progress.resolutionResult = choice.result;
    if (!state.completedCases.includes(caseData.id)) state.completedCases.push(caseData.id);
    updateProfile("cases", caseData.id);
    if (caseData.id === "block404") unlockAchievement("case-one");
    if (state.completedCases.filter(id => id !== "nexus").length >= 4) unlockAchievement("all-cases");
    if (progress.noRest) unlockAchievement("no-rest");
    if (state.signal < 35) unlockAchievement("low-signal");

    if (B.chapterRestore) {
      state.health = state.maxHealth;
      state.sanity = state.maxSanity;
      state.signal = Math.min(state.signal, B.chapterSignalCap);
    } else {
      state.health = clamp(state.health + Math.ceil(state.maxHealth * 0.18), 0, state.maxHealth);
      state.sanity = clamp(state.sanity + Math.ceil(state.maxSanity * 0.18), 0, state.maxSanity);
    }
    advanceTime(95);
    const finishedTitle = caseData.title;
    state.currentCaseId = null;
    saveGame();

    openDialog(`
      <div class="dialog-body ending good">
        <div class="ending-icon" aria-hidden="true">${escapeHTML(caseData.icon)}</div>
        <p class="event-kicker">EXPEDIENTE CERRADO</p>
        <h2 id="dialog-title">${escapeHTML(finishedTitle)}</h2>
        <p>${escapeHTML(choice.result)}</p>
        <p><b>Estado de campaña:</b> ${state.seals} sello(s), ${state.knowledge} conocimiento, ${state.signal}% de Señal.</p>
        <div class="dialog-actions"><button id="resolution-map">Volver al mapa</button></div>
      </div>
    `);
    document.getElementById("resolution-map").addEventListener("click", () => {
      closeDialog();
      renderMap();
      showScreen("map");
    });
  }

  function showFinalChoice() {
    const hasOffline = state.seals >= 2 && state.knowledge >= 2 && (state.inventory.includes("universeShard") || state.universeShardUsed);
    const hasDawn = state.seals >= 3;
    const hasArchive = state.knowledge >= 3;
    openDialog(`
      <div class="dialog-body">
        <p class="event-kicker">DECISIÓN FINAL</p>
        <h2 id="dialog-title">El Soñador abre los ojos</h2>
        <p>Black Hollow existe dentro de una transmisión que intenta convertirse en realidad. Tus cuatro decisiones han creado ${state.seals} sello(s) y ${state.knowledge} fragmento(s) de conocimiento.</p>
        <div class="dialog-actions">
          <button data-ending="dawn" ${hasDawn ? "" : "disabled"}>Cerrar la Señal y despertar la ciudad<span class="choice-note">Requiere 3 sellos. ${hasDawn ? "Disponible." : `Tienes ${state.seals}.`}</span></button>
          <button data-ending="archive" ${hasArchive ? "" : "disabled"}>Comprender la Señal y conservar el archivo<span class="choice-note">Requiere 3 conocimientos. ${hasArchive ? "Disponible." : `Tienes ${state.knowledge}.`}</span></button>
          <button data-ending="offline" ${hasOffline ? "" : "disabled"}>Desconectar el Universo 404 desde ambos lados<span class="choice-note">Final secreto: 2 sellos, 2 conocimientos y el Fragmento Universo 404.</span></button>
          <button data-ending="vessel">Tomar el control de la transmisión<span class="choice-note">Siempre disponible. La Señal necesita un nuevo anfitrión.</span></button>
        </div>
      </div>
    `);
    dialogContent.querySelectorAll("[data-ending]").forEach(button => button.addEventListener("click", () => finishCampaign(button.dataset.ending)));
  }

  function finishCampaign(endingId) {
    if (!state || getCase()?.id !== "nexus" || !getProgress()?.bossDefeated) return;
    const requirementsMet = endingId === "vessel"
      || (endingId === "dawn" && state.seals >= 3)
      || (endingId === "archive" && state.knowledge >= 3)
      || (endingId === "offline" && state.seals >= 2 && state.knowledge >= 2 && (state.inventory.includes("universeShard") || state.universeShardUsed));
    if (!requirementsMet) {
      showToast("Ese desenlace todavía no está disponible.");
      return;
    }
    const character = getCharacter();
    const endings = {
      dawn: {
        title: "Amanecer 404",
        className: "good",
        icon: "☼",
        text: "Los cuatro sellos se cierran a la vez. Black Hollow despierta bajo un cielo sin interferencias. Nadie recuerda las anomalías, salvo tú y las cicatrices que dejaron.",
        achievement: "final-dawn"
      },
      archive: {
        title: "El Archivista",
        className: "good",
        icon: "▤",
        text: "No destruyes la Señal: la traduces. El Soñador queda encerrado en un archivo que cambia cada vez que se abre. La ciudad sobrevive, pero tú permaneces vigilando la última página.",
        achievement: "final-archive"
      },
      offline: {
        title: "Universo desconectado",
        className: "secret",
        icon: "◉",
        text: "Encajas el fragmento azul y naranja entre conocimiento y contención. El Universo 404 se apaga como un monitor antiguo. La pesadilla pierde la dirección de Black Hollow y también la tuya.",
        achievement: "final-offline"
      },
      vessel: {
        title: "El Recipiente",
        className: "dark",
        icon: "404",
        text: "Aceptas la frecuencia completa. El Soñador deja de necesitar un cuerpo porque ahora tiene el tuyo. En el menú principal aparece una nueva opción: «Transmitir».",
        achievement: "final-vessel"
      }
    };
    const ending = endings[endingId];
    if (!ending) return;

    updateProfile("endings", endingId);
    updateProfile("completedCharacters", character.id);
    unlockAchievement(ending.achievement);
    if (profile().completedCharacters.length >= DATA.characters.length) unlockAchievement("three-voices");

    const progress = getProgress();
    progress.completed = true;
    progress.resolution = endingId;
    if (!state.completedCases.includes("nexus")) state.completedCases.push("nexus");
    updateProfile("cases", "nexus");
    storageRemove(SAVE_KEY);

    const epilogue = character.id === "lucia"
      ? "Lucía publica el reportaje bajo un titular imposible. Algunas copias solo muestran una página en blanco."
      : character.id === "gabriel"
        ? "Gabriel conserva el rosario. Por primera vez, ninguna cuenta está caliente."
        : "Noa comprueba la red. PISO_404 ha desaparecido, aunque su dispositivo aún recibe un único paquete cada madrugada.";

    openDialog(`
      <div class="dialog-body ending ${ending.className}">
        <div class="ending-icon" aria-hidden="true">${escapeHTML(ending.icon)}</div>
        <p class="event-kicker">FINAL · ${escapeHTML(character.name)}</p>
        <h2 id="dialog-title">${escapeHTML(ending.title)}</h2>
        <p>${escapeHTML(ending.text)}</p>
        <p>${escapeHTML(epilogue)}</p>
        <p><b>CAMPAÑA COMPLETADA</b></p>
        <div class="dialog-actions"><button id="ending-menu">Volver al menú principal</button></div>
      </div>
    `);
    document.getElementById("ending-menu").addEventListener("click", () => {
      closeDialog();
      state = null;
      updateContinueButton();
      showScreen("menu");
    });
  }

  function canAct() {
    return Boolean(state && state.currentCaseId && !currentEnemy && !checkFailure());
  }

  function checkFailure() {
    if (!state) return false;
    let reason = "";
    let title = "La pesadilla te reclama";
    if (state.health <= 0) reason = "Tu cuerpo queda donde la anomalía necesitaba una nueva puerta.";
    else if (state.sanity <= 0) reason = "Aceptas la versión de la realidad que la Señal escribió para ti.";
    else if (state.signal >= 100) {
      title = "Señal completa";
      reason = "La interfaz desaparece. Black Hollow deja de ser una ciudad y se convierte en una emisión contigo dentro.";
    }
    if (!reason) return false;

    clearCombatState();
    state.pendingEventId = null;
    const nextProfile = profile();
    nextProfile.failures += 1;
    saveProfile(nextProfile);
    storageRemove(SAVE_KEY);
    openDialog(`
      <div class="dialog-body ending dark">
        <div class="ending-icon" aria-hidden="true">✕</div>
        <p class="event-kicker">PARTIDA TERMINADA</p>
        <h2 id="dialog-title">${escapeHTML(title)}</h2>
        <p>${escapeHTML(reason)}</p>
        <div class="dialog-actions"><button id="failure-menu">Volver al menú</button></div>
      </div>
    `);
    document.getElementById("failure-menu").addEventListener("click", () => {
      closeDialog();
      state = null;
      updateContinueButton();
      showScreen("menu");
    });
    return true;
  }

  function pauseGame(fromMap = false) {
    if (!state) return;
    openDialog(`
      <div class="dialog-body">
        <p class="event-kicker">PAUSA</p>
        <h2 id="dialog-title">La Señal sigue escuchando</h2>
        <div class="dialog-actions">
          <button id="resume-game">Continuar</button>
          ${fromMap ? "" : '<button id="pause-map">Guardar y volver al mapa</button>'}
          <button id="save-exit">Guardar y volver al menú principal</button>
          <button id="abandon-run">Abandonar campaña</button>
        </div>
      </div>
    `);
    document.getElementById("resume-game").addEventListener("click", closeDialog);
    document.getElementById("pause-map")?.addEventListener("click", () => {
      closeDialog();
      returnToMap();
    });
    document.getElementById("save-exit").addEventListener("click", () => {
      saveGame();
      closeDialog();
      showScreen("menu");
      showToast("CAMPAÑA GUARDADA");
    });
    document.getElementById("abandon-run").addEventListener("click", () => {
      if (!confirm("¿Eliminar definitivamente esta campaña?")) return;
      eraseSave();
      closeDialog();
      showScreen("menu");
      showToast("CAMPAÑA ELIMINADA");
    });
  }

  function unlockAchievement(id) {
    const achievement = DATA.achievements.find(entry => entry.id === id);
    if (!achievement) return;
    const nextProfile = profile();
    if (nextProfile.achievements.includes(id)) return;
    nextProfile.achievements.push(id);
    saveProfile(nextProfile);
    showToast(`LOGRO: ${achievement.name}`);
  }

  function openDialog(html) {
    dialogContent.innerHTML = html;
    if (!dialog.open) dialog.showModal();
  }

  function closeDialog() {
    if (dialog.open) dialog.close();
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    liveRegion.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function beep(frequency = 140, duration = 0.05) {
    if (!settings().sound || !("AudioContext" in window || "webkitAudioContext" in window)) return;
    try {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      audioContext ||= new AudioClass();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "square";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.025, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch {
      // El sonido es opcional.
    }
  }

  function renderInfo(kind) {
    const storedProfile = profile();
    const title = document.getElementById("info-title");
    const eyebrow = document.getElementById("info-eyebrow");
    const content = document.getElementById("info-content");

    if (kind === "archive") {
      eyebrow.textContent = "ARCHIVO DE BLACK HOLLOW";
      title.textContent = "Evidencias recuperadas";
      const caseCards = DATA.cases.map(caseData => `
        <article class="info-card ${storedProfile.cases.includes(caseData.id) ? "unlocked" : "locked"}">
          <h3>${storedProfile.cases.includes(caseData.id) ? escapeHTML(caseData.title) : "████████"}</h3>
          <p>${storedProfile.cases.includes(caseData.id) ? escapeHTML(caseData.description) : "Misterio no resuelto."}</p>
        </article>
      `).join("");
      const eventCards = DATA.events.map(event => `
        <article class="info-card ${storedProfile.events.includes(event.id) ? "" : "locked"}">
          <h3>${storedProfile.events.includes(event.id) ? escapeHTML(event.title) : "Entrada desconocida"}</h3>
          <p>${storedProfile.events.includes(event.id) ? escapeHTML(event.text) : "Datos insuficientes."}</p>
        </article>
      `).join("");
      const enemyCards = [...DATA.enemies, ...DATA.bosses].map(enemy => `
        <article class="info-card ${storedProfile.enemies.includes(enemy.id) ? "" : "locked"}">
          <h3>${storedProfile.enemies.includes(enemy.id) ? escapeHTML(enemy.name) : "Entidad desconocida"}</h3>
          <p>${storedProfile.enemies.includes(enemy.id) ? escapeHTML(enemy.text) : "Sin imagen ni clasificación."}</p>
        </article>
      `).join("");
      const itemCards = Object.values(DATA.items).map(item => `
        <article class="info-card ${storedProfile.items.includes(item.id) ? "" : "locked"}">
          <h3>${storedProfile.items.includes(item.id) ? escapeHTML(item.name) : "Objeto sin catalogar"}</h3>
          <p>${storedProfile.items.includes(item.id) ? escapeHTML(item.description) : "Todavía no recuperado."}</p>
        </article>
      `).join("");
      content.innerHTML = `
        <p>Casos ${storedProfile.cases.length}/${DATA.cases.length} · Eventos ${storedProfile.events.length}/${DATA.events.length} · Entidades ${storedProfile.enemies.length}/${DATA.enemies.length + DATA.bosses.length} · Objetos ${storedProfile.items.length}/${Object.keys(DATA.items).length}</p>
        <h3>Misterios</h3><div class="info-grid">${caseCards}</div>
        <h3>Eventos</h3><div class="info-grid">${eventCards}</div>
        <h3>Entidades</h3><div class="info-grid">${enemyCards}</div>
        <h3>Objetos</h3><div class="info-grid">${itemCards}</div>
      `;
    } else if (kind === "achievements") {
      eyebrow.textContent = "PROGRESO";
      title.textContent = "Logros y finales";
      const endingNames = {
        dawn: "Amanecer 404",
        archive: "El Archivista",
        offline: "Universo desconectado",
        vessel: "El Recipiente"
      };
      content.innerHTML = `
        <p>Campañas iniciadas: <strong>${storedProfile.runs}</strong> · Derrotas: <strong>${storedProfile.failures}</strong> · Investigadores que completaron la historia: <strong>${storedProfile.completedCharacters.length}/3</strong></p>
        <h3>Logros</h3>
        <div class="info-grid">${DATA.achievements.map(achievement => `
          <article class="info-card ${storedProfile.achievements.includes(achievement.id) ? "unlocked" : "locked"}">
            <h3>${storedProfile.achievements.includes(achievement.id) ? "✓" : "?"} ${escapeHTML(achievement.name)}</h3>
            <p>${escapeHTML(achievement.description)}</p>
          </article>
        `).join("")}</div>
        <h3>Finales</h3>
        <div class="info-grid">${Object.entries(endingNames).map(([id, name]) => `
          <article class="info-card ${storedProfile.endings.includes(id) ? "unlocked" : "locked"}">
            <h3>${storedProfile.endings.includes(id) ? escapeHTML(name) : "Final no descubierto"}</h3>
            <p>${storedProfile.endings.includes(id) ? "Registrado en el Archivo 404." : "Tus decisiones todavía no han creado este desenlace."}</p>
          </article>
        `).join("")}</div>
      `;
    } else if (kind === "credits") {
      eyebrow.textContent = "UNIVERSO 404";
      title.textContent = "Créditos";
      content.innerHTML = `
        <div class="info-grid">
          <article class="info-card unlocked"><h3>Nightmare 404 Remastered v2.0.0</h3><p>Concepto, universo y dirección: I. Roig.</p><p>Juego de terror psicológico original preparado para navegador y GitHub Pages.</p></article>
          <article class="info-card"><h3>Contenido</h3><p>Bloque 404, Hospital Saint Mercy, Bosque Raven Woods, Mansión Ashcroft y Nexo 404.</p><p>30 eventos narrativos, 20 enemigos, 5 jefes y 4 finales principales.</p></article>
          <article class="info-card"><h3>Identidad visual</h3><p>Icono Universo 404 aportado por el autor e integrado como símbolo central de la historia.</p><p>Dirección visual remasterizada: terror cinematográfico, expediente analógico, CRT y señal degradada.</p></article>
          <article class="info-card"><h3>Tecnología</h3><p>HTML5, CSS3, JavaScript, LocalStorage y Service Worker.</p><p>Sin librerías, rastreadores ni dependencias externas.</p></article>
          <article class="info-card"><h3>Controles</h3><p>Ratón o pantalla táctil. Durante la investigación: teclas 1–4, M para mapa y Escape para pausa.</p></article>
          <article class="info-card"><h3>Aviso</h3><p>Ficción de terror con escenas de tensión, hospitales, criaturas y pérdida de cordura.</p></article>
        </div>
      `;
    } else if (kind === "settings") {
      const value = settings();
      eyebrow.textContent = "SISTEMA";
      title.textContent = "Opciones y datos";
      content.innerHTML = `
        <form class="settings-form" id="settings-form">
          <label class="setting-row"><span>Sonido de interfaz</span><input name="sound" type="checkbox" ${value.sound ? "checked" : ""}></label>
          <label class="setting-row"><span>Efectos CRT, ruido y viñeta</span><input name="crt" type="checkbox" ${value.crt ? "checked" : ""}></label>
          <label class="setting-row"><span>Reducir movimiento</span><input name="reducedMotion" type="checkbox" ${value.reducedMotion ? "checked" : ""}></label>
          <label class="setting-row"><span>Texto grande</span><input name="largeText" type="checkbox" ${value.largeText ? "checked" : ""}></label>
          <label class="setting-row"><span>Contraste reforzado</span><input name="highContrast" type="checkbox" ${value.highContrast ? "checked" : ""}></label>
          <button type="submit" class="ghost-button">Guardar opciones</button>
        </form>
        <h3>Copias de seguridad</h3>
        <div class="data-actions">
          <button type="button" class="ghost-button" id="export-data">Exportar datos</button>
          <button type="button" class="ghost-button" id="import-data">Importar datos</button>
          <textarea id="data-transfer" spellcheck="false" aria-label="Datos exportados o importados" placeholder="Los datos aparecerán aquí."></textarea>
          <button type="button" class="ghost-button" id="reset-progress">Borrar todo el progreso</button>
        </div>
      `;
      document.getElementById("settings-form").addEventListener("submit", event => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        writeJSON(SETTINGS_KEY, {
          sound: form.has("sound"),
          crt: form.has("crt"),
          reducedMotion: form.has("reducedMotion"),
          largeText: form.has("largeText"),
          highContrast: form.has("highContrast")
        });
        applySettings();
        showToast("OPCIONES GUARDADAS");
      });
      document.getElementById("export-data").addEventListener("click", () => {
        document.getElementById("data-transfer").value = JSON.stringify({
          format: "nightmare404-backup-v1",
          save: readJSON(SAVE_KEY, null),
          profile: profile(),
          settings: settings()
        }, null, 2);
        showToast("DATOS EXPORTADOS AL CUADRO DE TEXTO");
      });
      document.getElementById("import-data").addEventListener("click", () => {
        try {
          const raw = document.getElementById("data-transfer").value;
          if (raw.length > 1_000_000) throw new Error("La copia supera el límite de 1 MB");
          const payload = JSON.parse(raw);
          if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Contenido no válido");
          if (payload.format !== "nightmare404-backup-v1") throw new Error("Formato desconocido");
          if (payload.save && !validSave(payload.save)) throw new Error("Partida incompatible");
          if (payload.save) writeJSON(SAVE_KEY, payload.save); else storageRemove(SAVE_KEY);
          if (payload.profile) writeJSON(PROFILE_KEY, sanitizeProfile(payload.profile));
          if (payload.settings) writeJSON(SETTINGS_KEY, sanitizeSettings(payload.settings));
          applySettings();
          updateContinueButton();
          showToast("DATOS IMPORTADOS");
        } catch (error) {
          showToast(`IMPORTACIÓN FALLIDA: ${error.message}`);
        }
      });
      document.getElementById("reset-progress").addEventListener("click", () => {
        if (!confirm("¿Borrar campaña, archivo, logros, finales y opciones?")) return;
        storageRemove(SAVE_KEY);
        storageRemove(PROFILE_KEY);
        storageRemove(SETTINGS_KEY);
        state = null;
        clearCombatState();
        applySettings();
        updateContinueButton();
        renderInfo("settings");
        showToast("PROGRESO ELIMINADO");
      });
    }
    showScreen("info");
  }

  function handleMenuAction(action) {
    beep(160, 0.04);
    if (action === "new-game") {
      renderCharacterSelect();
      showScreen("character");
    } else if (action === "continue") {
      loadGame();
    } else if (["archive", "achievements", "settings", "credits"].includes(action)) {
      renderInfo(action);
    }
  }

  document.addEventListener("click", event => {
    const menu = event.target.closest("[data-action]");
    if (menu) handleMenuAction(menu.dataset.action);

    const back = event.target.closest("[data-back]");
    if (back) showScreen(back.dataset.back);

    const character = event.target.closest("[data-character]");
    if (character) startNewGame(character.dataset.character);

    const caseButton = event.target.closest("[data-case]");
    if (caseButton) enterCase(caseButton.dataset.case);

    const gameAction = event.target.closest("[data-game-action]");
    if (gameAction) {
      const action = gameAction.dataset.gameAction;
      if (action === "explore") explore();
      else if (action === "investigate") investigate();
      else if (action === "rest") rest();
      else if (action === "confront") confront();
      else if (action === "return") returnToMap();
    }

    const item = event.target.closest("[data-use-item]");
    if (item) useItemOutside(item.dataset.useItem);

    if (event.target.closest("[data-close-dialog]")) closeDialog();
  });

  document.getElementById("pause-btn").addEventListener("click", () => pauseGame(false));
  document.getElementById("map-pause").addEventListener("click", () => pauseGame(true));

  document.addEventListener("keydown", event => {
    const inGame = document.getElementById("screen-game").classList.contains("screen--active");
    if (!inGame || dialog.open) return;
    if (event.key === "1") explore();
    else if (event.key === "2") investigate();
    else if (event.key === "3") rest();
    else if (event.key === "4") confront();
    else if (event.key.toLowerCase() === "m") returnToMap();
    else if (event.key === "Escape") pauseGame(false);
  });

  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    if (dialogContent.querySelector("#combat-items-back")) {
      renderCombat();
      return;
    }
    if (dialogContent.querySelector("#resume-game, [data-close-dialog]")) closeDialog();
  });

  function registerServiceWorker() {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(error => {
        console.warn("No se pudo registrar el Service Worker de Nightmare 404.", error);
      }));
    }
  }

  function updateMenuSignal() {
    const node = document.getElementById("menu-signal");
    if (!node) return;
    const values = ["ESTABLE", "INTERMITENTE", "04:04", "OBSERVADA"];
    const next = values[randomInt(0, values.length - 1)];
    node.textContent = next;
    node.style.color = next === "ESTABLE" ? "var(--green)" : "var(--red)";
  }

  document.body.dataset.screen = "menu";
  applySettings();
  updateContinueButton();
  registerServiceWorker();
  window.setInterval(updateMenuSignal, 7000);
})();
