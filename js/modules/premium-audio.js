(() => {
  "use strict";
  const FILES = Object.freeze({
    uiClick: "assets/audio/kenney-click-002.ogg",
    uiConfirm: "assets/audio/kenney-click-005.ogg",
    step: "assets/audio/fx-step.ogg",
    door: "assets/audio/fx-door.ogg",
    impact: "assets/audio/fx-impact.ogg",
    whisper: "assets/audio/fx-whisper.ogg",
    bell: "assets/audio/fx-bell.ogg",
    water: "assets/audio/fx-water.ogg",
    rain: "assets/audio/ambience-rain.ogg",
    hospital: "assets/audio/ambience-hospital.ogg",
    forest: "assets/audio/ambience-forest.ogg",
    mansion: "assets/audio/ambience-mansion.ogg",
    nexus: "assets/audio/ambience-nexus.ogg",
    ritual: "assets/audio/music-ritual.ogg",
    menu: "assets/audio/ambience-menu.ogg",
    anomalyStinger: "assets/audio/stinger-anomaly.ogg",
    clearStinger: "assets/audio/stinger-case-clear.ogg",
    intro: "assets/audio/intro.ogg",
    caseBlock: "assets/audio/case-block.ogg",
    caseHospital: "assets/audio/case-hospital.ogg",
    caseForest: "assets/audio/case-forest.ogg",
    caseMansion: "assets/audio/case-mansion.ogg",
    caseNexus: "assets/audio/case-nexus.ogg"
  });
  const sceneAmbient = Object.freeze({ menu: "menu", block: "rain", hospital: "hospital", forest: "forest", mansion: "mansion", nexus: "nexus" });
  let ambient = null;
  let music = null;

  function makeAudio(key, { loop = false, volume = .35 } = {}) {
    const src = FILES[key];
    if (!src || typeof Audio !== "function") return null;
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.loop = loop;
    audio.volume = Math.max(0, Math.min(1, volume));
    return audio;
  }

  function play(key, volume = .35) {
    const audio = makeAudio(key, { volume });
    if (!audio) return;
    audio.play().catch(() => {});
  }

  function stopNode(node) {
    if (!node) return null;
    try { node.pause(); node.currentTime = 0; } catch {}
    return null;
  }

  function startAmbient(scene, volume = .26) {
    const key = sceneAmbient[scene] || "rain";
    if (ambient?.dataset?.key === key) {
      ambient.volume = Math.max(0, Math.min(1, volume));
      return;
    }
    ambient = stopNode(ambient);
    ambient = makeAudio(key, { loop: true, volume });
    if (!ambient) return;
    ambient.dataset.key = key;
    ambient.play().catch(() => {});
  }

  function stopAmbient() { ambient = stopNode(ambient); }

  function startMusic(volume = .16) {
    if (!music) music = makeAudio("ritual", { loop: true, volume });
    if (!music) return;
    music.volume = Math.max(0, Math.min(1, volume));
    music.play().catch(() => {});
  }

  function stopMusic() { music = stopNode(music); }

  function setMix({ ambientVolume, musicVolume } = {}) {
    if (ambient && Number.isFinite(ambientVolume)) ambient.volume = Math.max(0, Math.min(1, ambientVolume));
    if (music && Number.isFinite(musicVolume)) music.volume = Math.max(0, Math.min(1, musicVolume));
  }


  function playSequence(keys, volume = .28, gap = 180) {
    const list = Array.isArray(keys) ? keys.filter(Boolean) : [keys];
    list.forEach((key, index) => window.setTimeout(() => play(key, Math.max(.04, volume - index * .025)), index * gap));
  }

  function previewScene(scene, volume = .2, duration = 7000) {
    startAmbient(scene, volume);
    const timer = window.setTimeout(() => stopAmbient(), Math.max(1000, duration));
    return () => { window.clearTimeout(timer); stopAmbient(); };
  }

  window.N404_PREMIUM_AUDIO = Object.freeze({ FILES, play, playSequence, previewScene, startAmbient, stopAmbient, startMusic, stopMusic, setMix });
})();
