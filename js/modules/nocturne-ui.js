(() => {
  "use strict";
  const cases = Object.freeze({
    block404: { art: "assets/art/cases/block404.svg", scene: "block", label: "UMBRAL HABITADO", chapter: "CAPÍTULO I · EL PISO QUE SOBRA", direction: "Ascensor, reflejos, lluvia vertical y sombras entre plantas.", transmission: "A las 04:04, el ascensor aprende una planta que no existe." },
    hospital: { art: "assets/art/cases/hospital.svg", scene: "hospital", label: "PABELLÓN PROFANO", chapter: "CAPÍTULO II · SALA 13", direction: "Fluorescentes inestables, persianas clínicas y siluetas detrás del vidrio.", transmission: "La Sala 13 continúa operando incluso después de que el edificio pierde corriente." },
    forest: { art: "assets/art/cases/forest.svg", scene: "forest", label: "BOSQUE DE LOS NOMBRES", chapter: "CAPÍTULO III · RAÍCES CON MEMORIA", direction: "Niebla por estratos, ramas desplazadas y presencias que nunca ocupan el centro.", transmission: "Las raíces repiten apellidos de excursionistas que todavía no han desaparecido." },
    mansion: { art: "assets/art/cases/mansion.svg", scene: "mansion", label: "CASA HEREDADA", chapter: "CAPÍTULO IV · LA CASA RECUERDA", direction: "Velas respirando, marcos torcidos y ventanas con tormentas que no están fuera.", transmission: "Los retratos de Ashcroft muestran generaciones que aún no han nacido." },
    nexus: { art: "assets/art/cases/nexus.svg", scene: "nexus", label: "ABISMO PRIMORDIAL", chapter: "CAPÍTULO V · DONDE RESPIRA LA SEÑAL", direction: "Geometría imposible, pulsaciones radiales, duplicación cromática y profundidad falsa.", transmission: "Bajo Black Hollow, la Señal no transmite. Respira." }
  });
  const bossPhases = Object.freeze({
    calm: "PRESENCIA",
    engaged: "CONTACTO",
    wounded: "FRACTURA",
    critical: "FASE CRÍTICA"
  });
  window.N404_NOCTURNE = Object.freeze({ cases, bossPhases });
})();
