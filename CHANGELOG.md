# Historial de cambios

## 3.6.0 — Definitive Edition

### Codex / galería / archivo
- Archivo 404 reorganizado con navegación interna entre Archivo, Codex visual, Progreso y Transmisiones.
- Nuevos encabezados editoriales, métricas de descubrimiento y secciones premium.
- Galería rematada como Codex visual con jerarquía propia para prólogo, expedientes, eventos, jefes y finales.
- Progreso y finales convertidos en un registro de campaña más visual.
- Sala de transmisiones reforzada con estado de recuperación y presentación premium.

### Polish global de release
- Pase final de foco, contraste, scroll, reduced motion, estados bloqueados y consistencia táctil.
- Eliminada una ambigüedad de selectores detectada por QA durante el pase del Codex.
- Barrido sin TODO/FIXME, rutas locales absolutas ni enlaces decorativos falsos.
- Service Worker actualizado a v3.6.0 y documentación de release reconciliada.

## 3.5.0 — Full Experience Premium Pass

### Selección de personaje
- Pase premium total del reclutamiento con panel de briefing, dossier lateral y tarjetas de personaje mucho más ricas.
- Mejora de jerarquía, rasgos, CTA y presentación editorial de cada investigador.

### Pantalla de juego / HUD / combate
- Nuevo panel táctico superior durante la investigación con amenaza, postura y ventana operativa.
- Side panel reforzado con telemetría, mandato del umbral y tags de misión dinámicos.
- HUD, escena y barra de acciones refinados para acercarlos al nivel visual del resto del producto.
- Combate con mejor lectura visual: fase, ventaja y guardia, además de un acabado más premium en la interfaz del enfrentamiento.

## 3.4.0 — Map / Cases Premium Pass

### Mapa y expedientes
- Pase premium del mapa de campaña y de las tarjetas de casos para alinearlos con la portada y el menú ultra premium.
- Nuevo panel del incidente con presión, doctrina y protocolo de campaña.
- Nueva columna lateral de dossier operativo y recomendaciones de ruta.
- Tarjetas de caso más grandes, con mejor jerarquía, métricas de pistas/eventos y presencia visual reforzada.
- Presentación del Nexo y del flujo de campaña con un acabado más cercano a videojuego indie premium.

## 3.3.0 — Ultra Menu Pass

### Menú principal
- Menú principal rehecho en clave más premium para alinearlo con la nueva portada final.
- Nuevo bloque editorial con transmisión recuperada, métricas de campaña y estado de release.
- Nuevo panel lateral de campaña con dossier, chips temáticos y recomendaciones de experiencia.
- Estructura del menú reorganizada para parecer más videojuego indie premium y menos PWA convencional.
- Ajustes responsive del menú en escritorio, tablet y móvil.

## 3.2.2 — Final Hero Pass

### Pantalla principal
- Nueva portada principal cinematográfica integrada en la app como splash inicial.
- Emblema Universo 404 incorporado dentro de la composición final.
- CTA de entrada preservado como control real y accesible.
- Ajuste específico de PWA/caché a `nightmare-404-v3.2.2` para forzar actualización limpia del asset principal.

## 3.2.1 — Polish Pass

### Confort visual y ritmo
- Reducción aproximada del 35–45 % en frecuencia/intensidad de flashes narrativos.
- Cooldown de anomalías aumentado de 9 a 15 segundos y probabilidades reducidas por estado de cordura.
- Hospital, tormenta, mansión, Nexo y estados de cordura crítica usan transiciones más suaves y espaciadas.
- Fase crítica de jefes conserva tensión sin parpadeo estroboscópico rápido.
- Las animaciones ambientales lentas (niebla, ramas, velas, respiración y geometría) se conservan.
- `prefers-reduced-motion` y el ajuste manual siguen anulando los estímulos narrativos intensos.

## 3.2.0 — Director's Cut

### Dirección artística y narrativa
- Movimiento ambiental específico para cada una de las cinco localizaciones.
- Preludios convertidos en tarjetas de capítulo con dirección de escena.
- Resumen visual de expediente y estadísticas finales de campaña.
- Galería reposicionada como Codex visual.

### Jefes
- Estados visuales de contacto, fractura y fase crítica según PV restantes.
- Cambios de fase sincronizados con leitmotivs contextuales.

### Audio
- Mezcla adaptativa según cordura, Señal, peligro y combate de jefe.
- Leitmotivs por escenario reutilizando los 23 OGG locales existentes.
- Sin nuevas dependencias ni audio remoto.

### Persistencia / PWA / accesibilidad
- Snapshot de recuperación local del guardado válido anterior.
- Compatibilidad explícita con guardados v3.1.0.
- Detección inicial de `prefers-reduced-motion` y neutralización de las nuevas animaciones.
- Caché del Service Worker actualizada a `nightmare-404-v3.2.0`.
- Aviso de actualización preparada cuando se instala un nuevo worker.

## 3.1.0 — Nocturne Edition

### UX / dirección artística
- Prelude de expediente con arte de localización, emblema, transmisión y confirmación de descenso.
- Cinco emblemas de caso.
- Galería ampliada a eventos ilustrados y portadas de expediente.
- Sala de transmisiones con desbloqueo progresivo.

### Audio
- Stingers locales para prólogo, anomalía y cierre.
- Cinco cues de entrada de caso e intro dedicados.
- Previsualización temporal de ambientes desde la Sala de transmisiones.

### Técnica
- Módulo `js/modules/nocturne-ui.js` para metadatos visuales.
- Compatibilidad explícita con guardados v3.0.0.
