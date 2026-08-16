# NIGHTMARE 404 v3.6.0 — QA REPORT

## Automatizado ejecutado en esta release

- `python3 tests/validate.py` — PASS; 3 investigadores, 5 casos, 30 eventos, 20 enemigos, 5 jefes, 20 objetos y 12 logros.
- `python3 tests/ui_smoke.py` — PASS, 12 escenarios.
- `python3 tests/layout_release.py` — PASS, 25 comprobaciones.
- `python3 tests/layout_smoke.py` — PASS, 30 comprobaciones responsive/accesibilidad.
- `node tests/sw_smoke.js` — PASS, 78 recursos precacheados; cachés ajenas preservadas.
- `node tests/balance_sim.js` — PASS; equilibrio dentro de los objetivos definidos por el simulador.
- `node --check` sobre el JavaScript principal — PASS.
- Barrido de rutas y marcadores de release — sin `TODO/FIXME`, enlaces `#` decorativos ni rutas locales absolutas detectadas.
- Referencias locales HTML/CSS y recursos del Service Worker — sin recursos reales faltantes detectados.

## No ejecutado

- `tests/dom_smoke.js`: requiere `jsdom`, no instalado en el entorno de esta ejecución.
- Safari/iPhone/iPad/Android físicos: no disponibles en este entorno.
- Playtesting humano completo de campañas largas: pendiente.

## Criterio

Los resultados anteriores prueban flujos automatizados y layout en Chromium headless. No equivalen a certificación multiplataforma física ni justifican por sí solos una puntuación objetiva de 10/10.
