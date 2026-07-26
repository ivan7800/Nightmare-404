# Historial de cambios

## 2.0.0 — Remastered

### Dirección visual y experiencia

- Portada cinematográfica a pantalla completa con arte recortado para evitar menús duplicados, jerarquía editorial y resumen de campaña guardada.
- Rediseño completo de selección de investigador, mapa de anomalías, HUD, escena, inventario, registro, acciones, archivo, opciones y diálogos.
- Mapa reorganizado como expedientes de gran formato; los cuatro focos principales y el Nexo dejan de competir en cinco columnas estrechas.
- Acciones principales con nombre, atajo y explicación breve; mejor lectura táctil y menor ambigüedad.
- Estados de Señal alta, clima, foco activo, casos completados y contenido bloqueado reforzados visualmente.
- Nuevos fondos locales `menu-hero.webp` y `ambient-bg.webp`, sin dependencias ni llamadas externas.

### Compatibilidad y PWA

- Migración directa de partidas 1.1.1 a 2.0.0 sin recalibrar estadísticas.
- Caché PWA actualizada a `nightmare-404-v2.0.0` con los nuevos recursos visuales.
- Nombre, descripción y colores de instalación actualizados a la edición Remastered.

### Calidad

- Corregido un contenedor duplicado en la decisión final del Nexo.
- Créditos y textos de versión sincronizados.
- Resumen de logros/finales y detalle de la partida guardada visibles desde el menú principal.

## 1.1.1 — auditoría profesional y endurecimiento PWA

### PWA y GitHub Pages

- La limpieza del Service Worker queda limitada al prefijo `nightmare-404-`. La versión anterior borraba todas las cachés del mismo origen y podía afectar a otras apps publicadas bajo el mismo dominio de GitHub Pages.
- Añadida prueba `tests/sw_smoke.js` sin dependencias para verificar precaché, activación y preservación de cachés ajenas.
- Caché actualizada a `nightmare-404-v1.1.1` y escritura de respuestas controlada de forma fiable.
- Manifiesto ampliado y metadatos PWA/iOS reforzados.

### Compatibilidad de partidas

- Las partidas `1.1.0` se aceptan y migran a `1.1.1`.
- La recalibración de estadísticas solo se aplica a partidas `1.0.0` y `1.0.1`; un parche compatible ya no vuelve a reequilibrar ni altera estadísticas válidas.

### QA y accesibilidad

- Corregidos dos falsos negativos de `ui_smoke.py`: versión migrada y vida del jefe estaban fijadas a datos antiguos.
- La prueba responsive ahora incrusta y ejecuta el CSS real; antes podía aprobar sobre una página sin estilos.
- Ampliación a 25 comprobaciones responsive y de accesibilidad entre 320 y 1440 px.
- Objetivos táctiles mínimos de 44 px en inventario, acciones y botones secundarios.
- Enlace de salto con destino enfocable, soporte de safe areas y tipos explícitos en botones estáticos.

### Rendimiento y presentación

- Iconos PWA optimizados con reducción visualmente fiel: el proyecto pasa de 1.325.808 a aproximadamente 829.760 bytes, un 37 % menos.
- Dimensiones intrínsecas, decodificación de imágenes y precarga de la imagen principal para reducir cambios de diseño y mejorar la carga inicial.
- Página `404.html` simplificada, accesible y sin script de redirección.

### Documentación

- README, auditoría, QA, equilibrio e instrucciones de GitHub Pages sincronizados con v1.1.1.

## 1.1.0 — edición reequilibrada

La v1.0.1 era técnicamente correcta pero **imposible de terminar**: 0 victorias en
36.000 campañas simuladas. Esta versión recalibra la economía completa.
Detalle en [docs/BALANCE-REPORT.md](docs/BALANCE-REPORT.md).

### Equilibrio

- Bloque `balance` centralizado en `js/data.js` con 17 constantes; `js/app.js` deja de tener números mágicos y el simulador lee la misma fuente.
- El caso pasa a comportarse como capítulo: al cerrarlo se restauran vida y cordura y la Señal se recorta a 36.
- Coste de Señal del clima reducido a la mitad; investigar y descansar cuestan menos.
- Los cinco jefes bajan entre un 15 y un 36 % de PV y entre un 23 y un 28 % de ataque; los 20 enemigos comunes bajan en proporción.
- Descanso +14/+12 → +22/+20. Consumibles tras combate 25 % → 45 %. Botiquín, píldoras, linterna, incienso, sal e hilo negro revalorizados.
- Estadísticas de los tres investigadores reajustadas; la pasiva de pista de Lucía pasa de +0,18 a +0,12.

### Contenido

- La rama de resolución de conocimiento reparte ahora valor de combate y curación en lugar de solo gestión de Señal. `descend` no otorgaba ningún objeto y ahora da `salt`.
- `universeShard` es alcanzable también desde el evento `n-threshold`: las dos rutas pueden enfrentarse al Soñador con su debilidad.
- Coste de Señal simetrizado entre ramas: sellar −2, conocimiento 0.
- `bell` y `ashcroftSeal` siguen obteniéndose por evento; no se pierde contenido.

### Inventario

- Los objetos clave (jefe, evidencia y brújula) dejan de competir por hueco con los consumibles. Había 9 objetos clave y solo 8 huecos compartidos: una partida avanzada podía quedar bloqueada de forma permanente, incapaz de recoger un botiquín nunca más.
- El tope pasa a ser de 6 consumibles; los objetos clave son ilimitados y se distinguen en la lista.

### Compatibilidad de guardado

- Se aceptan de nuevo las partidas de la v1.0.1, que el cambio de versión había dejado sin cargar.
- Al migrar desde la v1.0.x se adoptan las estadísticas del equilibrio nuevo en lugar de conservar las viejas, respetando la proporción de vida y cordura que llevara el jugador. Sin esto, una partida antigua se jugaría con la vida de la v1.0.x contra enemigos recalibrados.

### Interfaz

- Las opciones de resolución muestran ahora el coste de Señal y el objeto que otorgan. Antes el coste llegaba a +11 y era invisible, y podía terminar una campaña sin previo aviso.

### Pruebas

- `tests/balance_sim.js`: simulador Monte Carlo con criterio de aceptación y modo `--ci`.
- `tests/dom_smoke.js`: 30 comprobaciones sobre el juego real en jsdom, sin navegador ni servidor, incluidas las regresiones de inventario y de migración de guardado.
- Resultado verificado: partida típica 37,6–41,2 % de victorias, estable a N = 1.500, 2.500 y 4.000.

## 1.0.1 — edición auditada

### Fiabilidad y datos

- Validación profunda y normalización de partidas importadas y guardadas.
- Compatibilidad de migración con partidas `1.0.0`.
- Guardado y restauración de eventos pendientes, combates y resolución posterior a un jefe.
- Protección frente a errores o bloqueo de `localStorage`.
- Revalidación interna de los requisitos de los finales.

### Seguridad y privacidad

- Saneado de perfiles, ajustes, identificadores y valores numéricos importados.
- Eliminado el riesgo de ejecutar HTML persistente introducido mediante una copia manipulada.
- Añadidas política CSP y política de referencia restrictiva.
- El proyecto continúa sin telemetría, servicios externos ni secretos.

### Juego y contenido

- El sedante ya puede utilizarse fuera y dentro del combate con su penalización real.
- La brújula pasa a ser obtenible en Raven Woods.
- Corregida la cifra de eventos mostrada en los créditos.
- Guardado automático reforzado durante los turnos de combate.

### PWA, accesibilidad y rendimiento

- Service Worker actualizado con caché versionada, navegación `network-first`, fallback offline y limpieza de cachés antiguas.
- Medidores de vida y cordura expuestos como barras de progreso accesibles.
- Gestión de `aria-hidden`, foco al cambiar de pantalla y comportamiento de Escape en diálogos.
- Contraste del rojo principal elevado de 3,49:1 a 5,11:1 sobre el panel oscuro.
- Icono Universo 404 optimizado de 930 KiB a 123 KiB sin alterar su uso visual.

### Pruebas

- Validador estático ampliado para contenido, referencias, PWA, HTML, versiones y contraste.
- 11 escenarios de interfaz automatizados en Chromium.
- 20 comprobaciones responsive entre 320 y 1440 px.

## 1.0.0

- Campaña completa de Black Hollow.
- Añadidos Hospital Saint Mercy, Raven Woods y Mansión Ashcroft.
- Añadido el capítulo final Nexo 404 y The Dreamer.
- Incorporados clima dinámico y ciclo día/noche.
- Ampliación a 30 eventos, 20 enemigos, 5 jefes y 20 objetos.
- Cuatro finales, incluido uno secreto.
- Habilidades activas y decisiones exclusivas para los tres investigadores.
- Mapa de campaña, expedientes, archivo, logros y progreso persistente.
- Exportación e importación de datos.
- Mejoras de accesibilidad, diseño adaptable y PWA.

## 0.1.0

- Primera alpha jugable: Bloque 404, tres personajes, diez eventos, cinco enemigos, un jefe y dos finales locales.
