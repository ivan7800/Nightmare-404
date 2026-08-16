(() => {
  "use strict";
  const cases = Object.freeze({
    block404: { art: "assets/art/cases/block404.svg", scene: "block", label: "UMBRAL HABITADO", transmission: "A las 04:04, el ascensor aprende una planta que no existe." },
    hospital: { art: "assets/art/cases/hospital.svg", scene: "hospital", label: "PABELLÓN PROFANO", transmission: "La Sala 13 continúa operando incluso después de que el edificio pierde corriente." },
    forest: { art: "assets/art/cases/forest.svg", scene: "forest", label: "BOSQUE DE LOS NOMBRES", transmission: "Las raíces repiten apellidos de excursionistas que todavía no han desaparecido." },
    mansion: { art: "assets/art/cases/mansion.svg", scene: "mansion", label: "CASA HEREDADA", transmission: "Los retratos de Ashcroft muestran generaciones que aún no han nacido." },
    nexus: { art: "assets/art/cases/nexus.svg", scene: "nexus", label: "ABISMO PRIMORDIAL", transmission: "Bajo Black Hollow, la Señal no transmite. Respira." }
  });
  window.N404_NOCTURNE = Object.freeze({ cases });
})();
