# Historial de cambios

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
