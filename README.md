# Nightmare 404 — Remastered v2.0.0

Juego web estático y PWA de terror psicológico, investigación y supervivencia ambientado en **Black Hollow**. La campaña completa funciona sin backend, sin CDN y sin dependencias externas de ejecución, por lo que puede publicarse directamente en GitHub Pages.

## Estado de esta entrega

**Release candidate profesional.** La edición Remastered v2.0.0 conserva el motor, el equilibrio y la campaña completa, pero sustituye la presentación anterior por una dirección visual cinematográfica: portada inmersiva, mapa tipo expediente, HUD renovado, acciones jerarquizadas y diálogos más contundentes. Sigue funcionando sin backend, CDN ni dependencias externas.

Consulta:

- [Informe final de auditoría](docs/AUDIT-REPORT.md)
- [Informe de QA](docs/QA-REPORT.md)
- [Informe de equilibrio](docs/BALANCE-REPORT.md)
- [Historial de cambios](CHANGELOG.md)

## Contenido

- 3 investigadores con estadísticas, pasivas, habilidad activa y decisiones exclusivas.
- 5 misterios: Bloque 404, Hospital Saint Mercy, Raven Woods, Mansión Ashcroft y Nexo 404.
- 30 eventos narrativos, 20 enemigos comunes, 5 jefes y 20 objetos.
- Clima dinámico y ciclo de día/noche.
- 4 finales de campaña, incluido uno secreto, y 12 logros.
- Combate por turnos, inventario, archivo, progreso y expedientes.
- Guardado automático durante exploración, eventos, decisiones y combate.
- Exportación e importación validada de copias de seguridad.
- PWA con shell offline después de la primera carga correcta.
- Interfaz responsive, teclado, táctil, movimiento reducido, texto grande y contraste reforzado.
- Sin analítica, telemetría, cookies de terceros ni envío de datos.

## Cómo jugar

1. Elige a Lucía Vega, Gabriel Rojas o Noa Sanz.
2. Investiga las cuatro anomalías principales en el orden que prefieras.
3. Gestiona vida, cordura, Señal, inventario y tiempo mientras reúnes pistas.
4. Derrota al jefe y decide cómo cerrar cada anomalía.
5. Entra en el Nexo 404; las resoluciones anteriores determinan los desenlaces disponibles.

### Controles

- Ratón o pantalla táctil: todos los menús y acciones.
- `1`, `2`, `3`, `4`: explorar, investigar, recuperarse y confrontar.
- `M`: volver al mapa.
- `Escape`: pausa; las decisiones obligatorias no se descartan.

## Ejecutar localmente

`index.html` puede abrir la lógica principal directamente. Para probar la instalación PWA y el Service Worker es obligatorio usar HTTP o HTTPS:

```bash
cd Nightmare-404-v2.0.0-Remastered
python -m http.server 8080
```

Abre `http://localhost:8080`.

## Publicar en GitHub Pages

1. Crea un repositorio, por ejemplo `Nightmare-404`.
2. Sube **el contenido de esta carpeta** a la raíz del repositorio. `index.html` debe quedar en la raíz, no dentro de otra carpeta adicional.
3. En GitHub entra en **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Elige la rama `main`, la carpeta `/(root)` y guarda.
6. Espera a que GitHub termine el despliegue.

La URL habitual será:

```text
https://TU-USUARIO.github.io/Nightmare-404/
```

Todas las rutas, el manifiesto y el Service Worker son relativos y compatibles con una subcarpeta de GitHub Pages. `.nojekyll` evita procesamientos innecesarios de Jekyll.

### Publicación mediante Git

```bash
git init
git add .
git commit -m "Release Nightmare 404 Remastered v2.0.0"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/Nightmare-404.git
git push -u origin main
```

## Validación

Pruebas sin dependencias adicionales:

```bash
python tests/validate.py
node --check js/data.js
node --check js/app.js
node --check sw.js
node tests/sw_smoke.js
node tests/balance_sim.js 4000 --ci
```

Pruebas con Chromium y Playwright:

```bash
python -m pip install playwright
python -m playwright install chromium
python tests/ui_smoke.py
python tests/layout_smoke.py
```

También puede indicarse un Chromium ya instalado:

```bash
CHROMIUM_PATH=/ruta/a/chromium python tests/ui_smoke.py
```

Prueba opcional con jsdom:

```bash
npm install jsdom
node tests/dom_smoke.js
```

### Resultado verificado de v2.0.0

- Validación estática: superada.
- Sintaxis JavaScript: superada en `data.js`, `app.js` y `sw.js`.
- Service Worker: 17 recursos precacheados y cachés de otras apps preservadas.
- Equilibrio: aceptado en 36.000 campañas simuladas; partida mixta entre 37,7 % y 42,4 % de victorias en la ejecución final.
- Interfaz: 12 escenarios funcionales superados en Chromium.
- Responsive y accesibilidad básica: 25 comprobaciones superadas entre 320 y 1440 px, con CSS real cargado.
- Controles visibles: sin desbordamiento horizontal, sin IDs duplicados, sin controles sin nombre y sin objetivos táctiles menores de 44 px en los flujos comprobados.

## Estructura

```text
Nightmare-404-v2.0.0-Remastered/
├── index.html
├── 404.html
├── manifest.webmanifest
├── sw.js
├── css/styles.css
├── js/{data.js,app.js}
├── assets/{icons,images}/
├── docs/{AUDIT-REPORT.md,QA-REPORT.md,BALANCE-REPORT.md}
└── tests/{validate.py,balance_sim.js,dom_smoke.js,ui_smoke.py,layout_smoke.py,sw_smoke.js}
```

## Datos, privacidad y seguridad

El progreso se almacena únicamente en `localStorage`. La aplicación no envía datos fuera del dispositivo. Las copias importadas tienen límite de tamaño, formato controlado y saneado de identificadores, números, perfil y opciones. La política CSP restringe scripts, estilos, imágenes, conexiones, workers y formularios al propio origen.

El Service Worker solo elimina cachés cuyo nombre comienza por `nightmare-404-`; no borra cachés de otras aplicaciones alojadas en el mismo dominio de GitHub Pages.

## Limitaciones conocidas

- Borrar los datos del sitio elimina el progreso no exportado.
- La instalación y caché PWA no funcionan desde `file://`.
- El equilibrio está verificado por simulación, no por sesiones humanas extensivas.
- Falta una ejecución de Lighthouse y medición de Core Web Vitals en el despliegue público.
- Falta validar instalación, actualización y modo offline en Chrome/Edge, Firefox, Safari, iOS y Android reales.
- No incluye música ambiental para evitar licencias y mantener el paquete ligero.

## Licencia

Consulta `LICENSE`. El código está bajo MIT. El icono, arte, personajes, historia, nombres y demás activos creativos quedan excluidos de esa licencia.
