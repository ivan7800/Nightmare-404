# NIGHTMARE 404 v3.2.0 — DIRECTOR'S CUT

PWA estática/local-first de horror cósmico e investigación ambientada en Black Hollow. Esta edición evoluciona v3.1 sin convertir el proyecto en una colección de efectos: prioriza dirección de escena, ritmo, audio adaptativo, recuperación de partida y cierre de campaña.

## Qué cambia en v3.2

- Dirección ambiental diferenciada para Bloque 404, Hospital Saint Mercy, Raven Woods, Mansión Ashcroft y Nexo 404.
- Cinco jefes con presentación y fases visuales de contacto, fractura y estado crítico.
- Mezcla sonora adaptativa según cordura, Señal, peligro y combate de jefe, reutilizando los 23 OGG locales.
- Leitmotivs contextuales por escenario sin CDN ni dependencias externas.
- Preludios de capítulo reforzados, resumen visual al cerrar cada expediente y estadísticas al terminar la campaña.
- Codex visual con prólogo, expedientes, eventos, jefes y finales.
- Recuperación automática desde el snapshot local válido anterior si el guardado principal queda corrupto/incompatible.
- `prefers-reduced-motion` respetado desde la primera ejecución y opción manual de reducción de movimiento.
- PWA con caché `v3.2.0`, limpieza de cachés antiguas y aviso cuando una actualización queda preparada.

## Contenido

- 3 investigadores.
- 5 expedientes/casos.
- 30 eventos narrativos.
- 20 enemigos + 5 jefes.
- 20 objetos.
- 12 logros.
- 4 finales.

## Ejecutar localmente

```bash
python -m http.server 8080
```

Después abre `http://localhost:8080/`.

> No se promete compatibilidad completa mediante `file://`; Service Worker y PWA requieren HTTP/HTTPS.

## GitHub Pages

El proyecto está preparado para hosting estático en una subruta: usa rutas relativas, `start_url`/`scope` relativos y no requiere backend. Publica la rama `main` desde `/(root)`.

## Privacidad

No usa telemetría, cuentas ni backend. El progreso y las opciones se guardan en el navegador. Consulta `PRIVACY.md` y `SECURITY.md`.

## Verificación

Consulta `docs/V3.2-DIRECTORS-CUT-VERIFICATION.md`, `docs/QA-REPORT.md` y `docs/AUDIT-REPORT.md`.

Las pruebas automatizadas no sustituyen playtesting humano ni pruebas físicas en iPhone/iPad/Android.
