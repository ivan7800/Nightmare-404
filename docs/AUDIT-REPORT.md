# Informe final — Nightmare 404 Remastered v2.0.0

## 1. Resumen ejecutivo

La v1.1.1 era estable y publicable, pero su interfaz seguía transmitiendo sensación de prototipo: paneles estrechos, cinco tarjetas compitiendo en una sola fila, jerarquía tipográfica débil y una ilustración principal desaprovechada. La v2.0.0 mantiene el motor, los datos, el equilibrio y el guardado, pero sustituye la capa visual completa por una dirección de terror cinematográfico y expediente analógico.

La entrega contiene **31 archivos y 982.318 bytes**. No usa framework, backend, CDN, analítica ni dependencias externas de ejecución. Supera validación estática, sintaxis, Service Worker, 12 escenarios funcionales, 25 comprobaciones responsive/accesibilidad y 36.000 campañas simuladas.

**Estado:** release candidate profesional para GitHub Pages. **Puntuación global: 9,3/10.** No se concede 9,5 porque faltan despliegue HTTPS real, Lighthouse, dispositivos físicos, audio/arte específico por escenario y playtesting humano amplio.

## 2. Problemas críticos encontrados

No se detectaron nuevos bloqueos críticos en el motor heredado. El riesgo crítico de cachés compartidas ya estaba corregido en v1.1.1 y se conserva: el Service Worker solo elimina cachés con el prefijo `nightmare-404-`.

Durante la remasterización se mantuvo como criterio crítico no romper guardados, eventos pendientes, combates, resoluciones ni compatibilidad con subcarpetas de GitHub Pages. Las pruebas confirman que esos flujos permanecen operativos.

## 3. Problemas altos encontrados

### A-01 — Primera impresión de prototipo

La pantalla principal separaba un menú convencional de una ilustración que ya contenía una composición visual potente. El resultado duplicaba lenguaje gráfico y reducía el impacto.

**Corrección:** portada cinematográfica única, arte recortado sin el menú dibujado, interfaz superpuesta con gradientes, identidad `Remastered`, resumen de partida y estadísticas de progreso.

### A-02 — Mapa comprimido en cinco columnas

Los casos eran difíciles de escanear y el Nexo tenía el mismo peso que los focos principales.

**Corrección:** cuatro expedientes de gran formato y Nexo de ancho completo, código de expediente, color por anomalía, estados más claros y jerarquía de bloqueo/completado.

### A-03 — HUD y acciones sin suficiente jerarquía

Las acciones mostraban nombre y tecla, pero no explicaban el coste mental de la decisión. El panel lateral parecía una lista administrativa.

**Corrección:** botones con atajo, acción y microdescripción; HUD horizontal más legible; objetivo destacado; inventario y registro convertidos en panel de misión.

### A-04 — Experiencia móvil perdía información

Una regla heredada ocultaba el indicador de Señal en móvil, aunque es una condición de derrota.

**Corrección:** grid móvil reorganizado para conservar vida, cordura, Señal, pistas y pausa.

## 4. Problemas medios y bajos

- Jerarquía tipográfica inconsistente entre pantallas.
- Diálogos correctos pero poco dramáticos.
- Archivo y opciones con apariencia de formulario genérico.
- Créditos con versión obsoleta.
- Contenedor duplicado en la decisión final.
- `toast` oculto parcialmente visible.
- Botón de opciones a 43,999 px por redondeo.
- Página 404 sin identidad y con redirección relativa susceptible de resolver mal una ruta profunda.
- Menú sin resumen de la partida guardada ni progreso global.

## 5. Correcciones realizadas

- Versión sincronizada como `2.0.0` en datos, HTML, caché, PWA y documentación.
- Compatibilidad explícita con guardados v1.1.1.
- Rediseño completo de `index.html` y `css/styles.css` sin alterar la lógica central.
- Nuevos recursos locales `menu-hero.webp` y `ambient-bg.webp`.
- Portada, personajes, mapa, juego, archivo, opciones, diálogos y finales remasterizados.
- Menú con detalle del investigador/caso guardado y resumen de logros/finales.
- Señal alta reforzada mediante estado visual.
- Nexo diferenciado como expediente final.
- Página 404 rediseñada y retorno calculado para GitHub Pages o dominio propio.
- Service Worker actualizado a 17 recursos precacheados.
- Prueba de cachés actualizada para varias versiones antiguas.

## 6. Mejoras UX/UI aplicadas

- Composición de portada basada en arte, no en cajas independientes.
- Escala tipográfica editorial y códigos monoespaciados para la capa de sistema.
- Paneles de cristal oscuro con bordes suaves en lugar de marcos repetitivos rígidos.
- Estados hover/foco más claros y movimiento contenido.
- Investigadores presentados como elecciones narrativas, con retratos dominantes y habilidades agrupadas.
- Casos convertidos en expedientes legibles con identidad cromática individual.
- Diálogos con barrido de señal, mejor jerarquía y opciones más claras.
- Archivo, logros y ajustes integrados en el mismo lenguaje visual.

## 7. Mejoras móviles aplicadas

- Portada apilada con arte arriba e interfaz debajo.
- Tarjetas de personaje verticales y contenido sin columnas estrechas.
- Expedientes en una sola columna, con CTA de ancho completo.
- HUD en dos columnas conservando todos los datos críticos.
- Acciones apiladas con mínimo táctil superior a 44 px.
- Safe areas preservadas para notch y barra de inicio.
- Sin overflow horizontal entre 320 y 1440 px en los flujos probados.

## 8. Mejoras de seguridad aplicadas

- CSP, `no-referrer`, saneado de importaciones y límite de 1 MB conservados.
- Sin HTML externo, scripts remotos, telemetría ni secretos.
- Migración de partidas limitada a versiones conocidas.
- Service Worker mantiene aislamiento por prefijo y origen.
- Página 404 calcula únicamente la raíz del proyecto; no procesa parámetros ni contenido del usuario.

## 9. Mejoras de rendimiento aplicadas

- Los dos nuevos fondos suman aproximadamente 135 KB.
- Proyecto completo por debajo de 1 MB.
- Hero precargado y en WebP.
- Fondo ambiental comprimido a 6,5 KB.
- Sin fuentes web, librerías o audio descargable.
- Efectos respetan `prefers-reduced-motion` y pueden desactivarse mediante la opción CRT.

Riesgo pendiente: `backdrop-filter`, lluvia y ruido pueden consumir GPU en dispositivos antiguos; debe medirse en hardware real.

## 10. Verificación final

| Comprobación | Resultado |
|---|---:|
| Validación estática | Superada |
| Sintaxis `data.js`, `app.js`, `sw.js` | Correcta |
| Datos y referencias | Correctos |
| Service Worker | 17 recursos; cachés ajenas preservadas |
| Escenarios funcionales Chromium | 12/12 |
| Responsive/accesibilidad básica | 25/25 |
| Equilibrio Monte Carlo | Aceptado, 36.000 campañas |
| Partida mixta | 37,7–42,4 % de victorias |
| Recursos de producción externos | Ninguno |
| Tamaño del proyecto | 982.318 bytes |
| Compatibilidad de rutas GitHub Pages | Correcta |

Se generaron y revisaron capturas de menú, selección, mapa y juego a 1440 × 1000 y 390 × 844 px. No se observaron recortes, solapamientos estructurales ni pérdida de jerarquía. La instalación PWA real no puede declararse validada hasta publicar bajo HTTPS.

## 11. Riesgos pendientes

- Lighthouse y Core Web Vitals en la URL pública.
- Instalación, actualización de v1.1.1 a v2.0.0 y offline real.
- Safari/iOS, Firefox y Android físicos.
- Rendimiento GPU en móviles antiguos.
- Ausencia de música y paisaje sonoro ambiental continuado.
- Los escenarios se representan con arte CSS procedural; un producto comercial necesitaría ilustración única por caso, evento principal y jefe.
- Falta telemetría voluntaria o playtesting estructurado para conocer abandono y dificultad real.

## 12. Qué faltaría para un 10/10 real

1. Cinco ilustraciones originales de escenario, cinco retratos de jefe y arte para eventos principales.
2. Paisaje sonoro propio con control separado de música, ambiente y efectos.
3. Transiciones narrativas y prólogo/epílogo con puesta en escena específica.
4. Lighthouse estable por encima de 95 en el despliegue público.
5. Matriz de navegadores y dispositivos físicos.
6. Test visual de regresión en CI.
7. Playtesting humano y ajustes basados en sesiones completas.
8. Página de producto, capturas promocionales, tráiler, soporte y política de privacidad pública.

## 13. Puntuación por categorías

- **CTO / arquitectura:** 9,4/10
- **UX/UI:** 9,2/10
- **QA / estabilidad:** 9,4/10
- **Seguridad:** 9,6/10
- **Rendimiento:** 9,2/10
- **Accesibilidad:** 9,4/10
- **GitHub Pages:** 9,6/10
- **Valor como producto:** 9,3/10
- **Potencial comercial:** 8,9/10

## 14. Puntuación global final

# **9,3/10**

La v2.0.0 ya presenta una primera impresión coherente con un juego web terminado y no con una demo técnica. La distancia hasta 9,5–10 no está en añadir más cajas o efectos, sino en producción audiovisual específica, validación pública y evidencia de uso real.

## Archivos modificados o añadidos

- `404.html`
- `CHANGELOG.md`
- `README.md`
- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/data.js`
- `manifest.webmanifest`
- `sw.js`
- `tests/sw_smoke.js`
- `docs/AUDIT-REPORT.md`
- `docs/QA-REPORT.md`
- `docs/BALANCE-REPORT.md`
- `assets/images/menu-hero.webp` — nuevo
- `assets/images/ambient-bg.webp` — nuevo
