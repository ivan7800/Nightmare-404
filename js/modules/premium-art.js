(() => {
  "use strict";
  const boss = {
    elevator: "assets/art/bosses/elevator.svg",
    surgeon: "assets/art/bosses/surgeon.svg",
    stag: "assets/art/bosses/stag.svg",
    lady: "assets/art/bosses/lady.svg",
    dreamer: "assets/art/bosses/dreamer.svg"
  };
  const events = {
    "b-mirror": "assets/art/events/b-mirror.svg",
    "b-vhs": "assets/art/events/b-vhs.svg",
    "b-zero": "assets/art/events/b-zero.svg",
    "h-theater": "assets/art/events/h-theater.svg",
    "h-morgue": "assets/art/events/h-morgue.svg",
    "f-bells": "assets/art/events/f-bells.svg",
    "f-well": "assets/art/events/f-well.svg",
    "f-shrine": "assets/art/events/f-shrine.svg",
    "m-gallery": "assets/art/events/m-gallery.svg",
    "m-ballroom": "assets/art/events/m-ballroom.svg",
    "n-copies": "assets/art/events/n-copies.svg",
    "n-threshold": "assets/art/events/n-threshold.svg"
  };
  const cases = {
    block: "assets/art/cases/block404.svg",
    hospital: "assets/art/cases/hospital.svg",
    forest: "assets/art/cases/forest.svg",
    mansion: "assets/art/cases/mansion.svg",
    nexus: "assets/art/cases/nexus.svg"
  };
  const prologue = {
    signal: "assets/art/prologue/signal.svg",
    descent: "assets/art/prologue/descent.svg",
    threshold: "assets/art/prologue/threshold.svg"
  };
  const endings = {
    dawn: "assets/art/endings/dawn.svg",
    archive: "assets/art/endings/archive.svg",
    offline: "assets/art/endings/offline.svg",
    vessel: "assets/art/endings/vessel.svg"
  };
  window.N404_PREMIUM_ART = Object.freeze({ boss, events, cases, prologue, endings });
})();
