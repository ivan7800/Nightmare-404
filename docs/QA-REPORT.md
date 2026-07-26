# Informe de QA — Nightmare 404 Remastered v2.0.0

## Resultado

**Aprobado como release candidate**, sin errores críticos reproducibles en las pruebas automatizadas ejecutadas. El rediseño conserva los doce flujos funcionales de la versión auditada y supera las comprobaciones responsive después de corregir un objetivo táctil que quedaba en 43,999 px por redondeo del navegador.

## Entorno de prueba

- Python 3.13.5.
- Node.js 22.16.0.
- Chromium 144 mediante Playwright.
- Resoluciones automatizadas: 320, 375, 680, 920 y 1440 px.
- Revisión visual adicional mediante capturas a 1440 × 1000 y 390 × 844 px.

La política del entorno bloqueó la navegación directa a `localhost`, dominios de prueba y `file://`. Las pruebas cargaron el HTML, CSS, JavaScript e imágenes reales dentro de Chromium; el Service Worker se verificó de forma aislada. Instalación y offline completos siguen pendientes en un origen HTTPS público.

## Batería ejecutada

| Prueba | Resultado | Cobertura |
|---|---:|---|
| `python tests/validate.py` | Superada | Datos, IDs, rutas, manifest, iconos, versiones, CSP, contraste, caché y documentación |
| `node --check js/data.js` | Superada | Sintaxis de datos |
| `node --check js/app.js` | Superada | Sintaxis de aplicación |
| `node --check sw.js` | Superada | Sintaxis del Service Worker |
| `node tests/sw_smoke.js` | Superada | 17 recursos precacheados y preservación de cachés ajenas |
| `node tests/balance_sim.js 4000 --ci` | Superada | 36.000 campañas simuladas |
| `python tests/ui_smoke.py` | 12/12 | Guardado, reanudación, eventos, combate, importación, saneado, objetos, migraciones, pausa y resolución |
| `python tests/layout_smoke.py` | 25/25 | Responsive, overflow, objetivos táctiles, nombres accesibles, IDs y contenido oculto |
| `node tests/dom_smoke.js` | No ejecutada | Requiere instalar `jsdom`; permanece como prueba opcional |

## Regresiones detectadas y corregidas durante v2.0.0

1. El botón “Guardar opciones” medía 43,999 px en 375 px de ancho por redondeo subpíxel. Se elevó el mínimo a 46 px.
2. El indicador de Señal desaparecía en el HUD móvil por una regla heredada. El nuevo grid muestra vida, cordura, Señal, pistas y pausa.
3. El `toast` oculto podía dejar visible un pequeño borde en la parte inferior. Ahora queda completamente fuera del viewport.
4. La decisión final del Nexo contenía un `div.dialog-actions` duplicado. Se corrigió el marcado.
5. Las partidas v1.1.1 no estaban declaradas todavía como origen de migración a v2.0.0. Se añadió compatibilidad sin recalibrar estadísticas.
6. La prueba del Service Worker esperaba una sola caché antigua; se actualizó para comprobar la eliminación segura de v1.0.1 y v1.1.1.

## Flujos funcionales comprobados

- Continuar deshabilitado sin partida válida.
- Nueva campaña, tres investigadores y cinco expedientes.
- Bloqueo inicial del Nexo.
- Evento pendiente persistido y restaurado.
- Decisiones obligatorias no cerrables con Escape.
- Combate pendiente restaurado con vida y estado interno.
- Final del Nexo restaurado tras derrotar al jefe.
- Importación inválida rechazada.
- Payload manipulado saneado sin ejecución de HTML.
- Uso del sedante y persistencia de penalización.
- Migración desde v1.0.0 con recalibración.
- Migración desde v1.1.0 sin recalibración.
- Exportación/importación, pausa y resolución de caso.

## Responsive y accesibilidad comprobada

- Sin overflow horizontal en los flujos medidos.
- Sin controles recortados.
- Sin objetivos táctiles visibles menores de 44 × 44 px.
- Sin controles visibles sin nombre accesible.
- Sin IDs duplicados.
- Sin controles visibles dentro de secciones `aria-hidden="true"`.
- Enlace “Saltar al contenido” como primer foco de teclado.
- Foco trasladado al encabezado al cambiar de pantalla.
- Diálogos nativos y acciones alcanzables mediante teclado.
- Vista móvil conserva Señal y pistas, datos críticos para jugar.

## Riesgos pendientes

- Instalación, actualización y modo offline en GitHub Pages real.
- Lighthouse y Core Web Vitals públicos.
- Safari/iOS, Firefox y Android físicos.
- Perfil de GPU de lluvia, ruido y desenfoque en móviles antiguos.
- Sesiones humanas completas para medir ritmo, comprensión y atractivo visual.
