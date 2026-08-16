# NIGHTMARE 404 v3.1.0 — QA REPORT

## Evidencia final

- `python tests/validate.py` → ✅ VERIFICADO
- `node --check` sobre `app.js`, `data.js`, módulos y `sw.js` → ✅ VERIFICADO
- `python tests/ui_smoke.py` → ✅ 12 escenarios funcionales
- `python tests/layout_release.py` → ✅ 25 comprobaciones entre 320 y 1440 px
- `node tests/sw_smoke.js` → ✅ 77 entradas de precaché; cachés ajenas preservadas
- `node tests/balance_sim.js --ci` → ✅ equilibrio aceptado
- Decodificación de audio OGG → ✅ 23/23
- Recursos CORE servidos por HTTP local → ✅ 76/76 rutas explícitas + raíz

## Limitaciones

- `tests/layout_smoke.py` completo sufrió inestabilidad EPIPE/timeout del driver Playwright en este entorno. Se sustituyó como evidencia de release por `layout_release.py`, que valida las cinco anchuras objetivo con Chromium y reduced motion.
- Safari iPhone/iPad físicos → ⏳ NO EJECUTADO.
- Android físico → ⏳ NO EJECUTADO.
- Instalación PWA real bajo HTTPS → ⏳ NO EJECUTADO.
