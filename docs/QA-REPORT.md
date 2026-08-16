# NIGHTMARE 404 v3.2.0 — QA REPORT

## Automatizado ejecutado en esta release

- `python3 tests/validate.py` — PASS.
- `python3 tests/ui_smoke.py` — PASS, 12 escenarios.
- `python3 tests/layout_release.py` — PASS, 25 comprobaciones.
- `python3 tests/layout_smoke.py` — PASS, 30 comprobaciones responsive/accesibilidad.
- `node tests/sw_smoke.js` — PASS, 77 recursos precacheados; cachés ajenas preservadas.
- `node tests/balance_sim.js 500 --ci` — PASS; partida mixta 37,6–41,4 %, todas las vías 27,6–50,4 %.
- `node --check` sobre `app.js`, `premium-audio.js` y `nocturne-ui.js` — PASS.

## No ejecutado

- `tests/dom_smoke.js`: requiere `jsdom`, no instalado en el entorno de esta ejecución.
- Safari/iPhone/iPad/Android físicos: no disponibles en este entorno.
- Playtesting humano completo de campañas largas: pendiente.

## Criterio

Los resultados anteriores prueban flujos automatizados y layout en Chromium headless, no equivalen a certificación multiplataforma física.
