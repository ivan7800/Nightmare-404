# Informe de equilibrio — Nightmare 404 Remastered v2.0.0

**Fecha:** 26 de julio de 2026
**Alcance:** recalibración de Señal, daño, curación y recompensas
**Método:** simulación Monte Carlo sobre la lógica real del juego
**Estado:** equilibrio aceptado

## 1. Resumen

La v1.0.1 era técnicamente sólida y **matemáticamente imposible de terminar**. En 36.000 campañas simuladas con cuatro estrategias distintas y los tres investigadores, el número de victorias fue **cero**. El caso medio alcanzado era 1,9 de 5.

La v2.0.0 conserva sin cambios el equilibrio introducido en v1.1.0. La ejecución final de 36.000 campañas sitúa la partida mixta en **37,7 – 42,4 %** de victorias, con una curva de dificultad coherente entre las dos ramas de resolución.

| Métrica | v1.0.1 | v2.0.0 |
|---|---|---|
| Victorias, partida mixta | 0 % | 37,7 – 42,4 % |
| Victorias, todas las vías | 0 % | 30,3 – 51,3 % |
| Caso medio alcanzado al perder | 1,9 / 5 | 3,8 – 4,6 / 5 |
| Campañas simuladas | 36.000 | 36.000 |

## 2. Diagnóstico de la v1.0.1

### 2.1 La Señal era insostenible

La Señal empieza en 7 y mata a 100: un presupuesto de 93 puntos para toda la campaña. El coste medido de **un solo caso**, sin contar mitigaciones:

| Investigador | Bloque 404 | Hospital | Raven Woods | Mansión | Nexo | Total |
|---|---|---|---|---|---|---|
| Lucía | +76 | +65 | +92 | +90 | +133 | **+456** |
| Gabriel | +94 | +76 | +115 | +105 | +153 | **+543** |
| Noa | +43 | +31 | +63 | +58 | +92 | **+287** |

Contra un presupuesto de 93 y unos 50 puntos de mitigación disponible (resoluciones de sello, objetos, especial de Noa). El primer caso ya consumía casi toda la campaña.

### 2.2 La economía de vida era peor

| Investigador | Daño recibido en campaña | Vida máxima | Curación total disponible |
|---|---|---|---|
| Lucía | 811 | 88 | ~204 |
| Gabriel | 670 | 118 | ~228 |
| Noa | 779 | 80 | ~200 |

Un déficit de unos 600 puntos. Solo el primer caso infligía ~104 de daño a personajes de 80–88 de vida con dos descansos de +14.

### 2.3 Por qué no bastaba ajustar parámetros

Se probaron ocho variantes de parcheo (reducir el coste de Señal, alivio al cerrar caso, subir drops, restaurar vida entre capítulos). **Ninguna superó el 1 % de victorias.** El problema no era el calibrado sino dos defectos estructurales:

- **Brecha entre ramas de resolución de 48 puntos.** La rama de conocimiento solo premiaba con objetos de gestión de Señal. Una vez corregida la Señal, esos premios dejaban de valer nada mientras la rama de sello repartía debilidades de jefe. La resolución `descend` no otorgaba **ningún** objeto.
- **El Nexo concentraba el 80 % de las derrotas.** El Soñador tenía 118 PV y 18 de ataque, y su debilidad (`universeShard`) solo se obtenía por la rama de sello. Quien jugara la ruta de conocimiento se enfrentaba al jefe final sin herramienta.

## 3. Cambios aplicados

### 3.1 Bloque de equilibrio centralizado

Se añadió `N404_DATA.balance` a `js/data.js` con 17 constantes, y `js/app.js` se refactorizó para leerlas en lugar de tener números mágicos repartidos por el archivo. El simulador lee el mismo bloque, de modo que juego y pruebas comparten una única fuente de verdad: reequilibrar es editar datos, no código.

```
startSignal 7          signalExplore 3        signalInvestigate 1
signalRest 2           signalCombatRound 1    restHealth 22
restSanity 20          restCap 2              dropChance 0,45
chapterRestore true    chapterSignalCap 36    clueBaseChance 0,40
investigateAmbushChance 0,22                  playerDamageBonusMax 5
investigateSanityMin/Max 2 / 5                highSignalThreshold 80
highSignalSanityPenalty 2
```

### 3.2 Estructura: el caso como capítulo

Al cerrar un caso se restauran vida y cordura al máximo y la Señal se recorta a 36. La campaña pasa de ser un desgaste continuo de cinco casos a cinco capítulos con presupuesto propio. Es el cambio que hace el conjunto equilibrable.

### 3.3 Señal

- Coste del clima reducido a la mitad (`eclipse` 4→2, `storm` 3→2, `fog` 2→1, `ash` 2→1)
- Investigar 2→1, descansar 5→2, explorar se mantiene en 3
- Umbral de penalización por Señal alta 75→80

### 3.4 Combate

| Jefe | PV antes → después | Ataque antes → después | Cordura antes → después |
|---|---|---|---|
| El Ascensor Hambriento | 68 → 58 | 13 → 10 | 9 → 6 |
| El Cirujano de los Ecos | 76 → 62 | 14 → 11 | 9 → 7 |
| El Ciervo de Ceniza | 82 → 66 | 15 → 12 | 10 → 7 |
| Lady Ashcroft | 88 → 70 | 16 → 13 | 11 → 8 |
| The Dreamer | 118 → 76 | 18 → 13 | 13 → 10 |

Los 20 enemigos comunes bajan PV, ataque y daño a cordura en proporción similar.

### 3.5 Personajes

| | Vida | Cordura | Fuerza |
|---|---|---|---|
| Lucía | 88 → 88 | 112 → 96 | 8 → 9 |
| Gabriel | 118 → 96 | 94 → 86 | 11 → 10 |
| Noa | 80 → 92 | 104 → 104 | 9 → 9 |

La pasiva de pista de Lucía baja de +0,18 a +0,12: componía demasiada ventaja al reducir investigaciones, emboscadas y daño a la vez.

### 3.6 Recompensas simétricas

La rama de conocimiento pasa a repartir valor de combate y curación en vez de solo gestión de Señal:

| Caso | Rama de sello | Rama de conocimiento |
|---|---|---|
| Bloque 404 | `universeShard` | `salt` *(antes: nada)* |
| Hospital | `ritualInk` | `blackThread` |
| Raven Woods | `silverMirror` | `medkit` *(antes: `bell`)* |
| Mansión | `portraitKey` | `incense` *(antes: `ashcroftSeal`)* |

`bell` y `ashcroftSeal` siguen obteniéndose por evento en sus casos, así que no se pierde contenido. El coste de Señal se simetriza: sello −2, conocimiento 0.

`universeShard` pasa a ser alcanzable también desde el evento `n-threshold` del Nexo, a cambio de un combate duro. Las dos rutas pueden llegar al jefe final con su debilidad.

### 3.7 Curación y objetos

Descanso +14/+12 → **+22/+20**. Botiquín 24 → 30, píldoras 18 → 22, linterna 12 → 16, incienso 10 → 16, sal 12 → 20, hilo negro 14 → 26. Probabilidad de consumible tras combate 25 % → **45 %**. Debilidades de jefe rebajadas (`universeShard` 22 → 16, `silverMirror` 18 → 14) para que la rama de sello no domine.

### 3.8 Inventario: los objetos clave dejan de bloquear la mochila

Existían **9 objetos clave** (5 debilidades de jefe, 3 evidencias y la brújula) para
**8 huecos compartidos**. Una partida avanzada podía llenar la mochila de objetos
que el juego nunca permite descartar y quedar incapaz de recoger un consumible
durante el resto de la campaña, sin ningún aviso. Con los drops subidos al 45 %
el efecto se agravaba.

Los objetos clave pasan a no contar para el tope, que queda en **6 consumibles**.
El contador de la interfaz refleja solo consumibles y los objetos clave se
distinguen en la lista. El equilibrio medido no varía (partida mixta 35,5–39,3 %),
lo que confirma que el tope no era el factor limitante: era una trampa, no una
palanca de dificultad.

### 3.9 Compatibilidad de partidas guardadas

El salto de versión dejó fuera las partidas de la v1.0.1, que es la versión ya
publicada. Además, `normalizeState()` conservaba `maxHealth`, `maxSanity` y
`power` del guardado, de modo que una partida antigua se habría jugado con las
estadísticas del equilibrio viejo contra los enemigos recalibrados.

Ahora se aceptan los guardados `1.0.0` y `1.0.1`, y al detectar un cambio de
versión se adoptan las estadísticas actuales del investigador conservando la
proporción de vida y cordura que llevara el jugador. La migración nunca deja la
partida en estado de derrota.

### 3.10 Corrección de interfaz

Las opciones de resolución mostraban sello, conocimiento y corrupción pero **nunca el coste de Señal**, que llegaba a +11 y podía terminar una campaña sin previo aviso. Ahora cada opción muestra los cuatro valores y el objeto que otorga.

## 4. Resultados verificados

4.000 campañas por combinación, 36.000 en total:

| Vía | Lucía | Gabriel | Noa |
|---|---|---|---|
| Sellar (contención) | 50,6 % | 46,8 % | 43,0 % |
| Conocimiento (archivo) | 29,3 % | 31,9 % | 32,4 % |
| Mixta (partida típica) | 41,2 % | 38,8 % | 37,6 % |

La diferencia entre ramas es intencionada y ahora proporcionada: sellar es la ruta contenida, el conocimiento es la arriesgada y corruptora. La brecha bajó de 48 a unos 12 puntos.

Las causas de derrota están repartidas: Lucía muere de Señal y de vida en proporciones parecidas, Gabriel sobre todo de Señal, Noa sobre todo de vida. Cada investigador tiene una presión distinta, que era el objetivo de diseño original.

## 5. Criterio de aceptación

`tests/balance_sim.js --ci` falla con código 1 si:

- la partida mixta cae fuera de 30–45 %
- cualquier combinación de investigador y vía cae fuera de 25–55 %

No se exige que las tres vías converjan al mismo número: eso aplanaría una diferencia de diseño deliberada.

Verificado estable a N = 1.500, 2.500 y 4.000 (mixta 36,8 – 41,2 % en las tres muestras).

## 6. Pruebas ejecutadas

| Prueba | Resultado |
|---|---|
| `python3 tests/validate.py` | Superada |
| `node --check` en `data.js`, `app.js`, `sw.js`, `balance_sim.js`, `dom_smoke.js` | Superada |
| `node tests/balance_sim.js 4000 --ci` | Superada, código 0 |
| `node tests/dom_smoke.js` | 30/30 superadas, código 0 |
| `python3 tests/ui_smoke.py` | **No ejecutable**: el entorno no permite descargar Chromium |
| `python3 tests/layout_smoke.py` | **No ejecutable**: misma causa |

`tests/dom_smoke.js` se escribió para cubrir ese hueco: arranca `index.html`, `js/data.js` y `js/app.js` reales en jsdom y juega por la interfaz sin navegador ni servidor. Verifica navegación, renderizado de investigadores, bloqueo del Nexo, eventos,
combate por turnos, la nueva nota de Señal en las resoluciones, y que el guardado
conserve versión y rangos correctos. Incluye dos regresiones dirigidas: que un
guardado con los 9 objetos clave y 6 consumibles sobreviva a la normalización sin
truncarse, y que una partida de la v1.0.1 se cargue y adopte las estadísticas del
equilibrio nuevo. Requiere `npm install jsdom`.

## 7. Limitaciones

- Las pruebas de UI y responsive en Chromium siguen sin ejecutarse en este entorno. Deben correrse antes de publicar.
- El simulador modela a un jugador competente con una política fija. No modela a un jugador que aprende, se equivoca o explora por curiosidad; los porcentajes reales de un humano serán algo más bajos en la primera partida.
- El equilibrio no se ha validado con sesiones humanas. Los números dicen que la campaña es terminable y tensa; no dicen si es divertida.
- No se han medido Lighthouse ni Core Web Vitals, ni validado en Firefox, Safari, iOS o Android reales.
- La sensación de terror, el ritmo narrativo y la calidad de los textos no son medibles por simulación.

## 8. Encontrado y no corregido

Estos puntos se detectaron durante el trabajo y quedaron deliberadamente fuera de
alcance. Ninguno impide publicar; se listan para que la decisión sea consciente.

| Punto | Severidad | Detalle |
|---|---|---|
| `canAct()` invoca `checkFailure()` | Baja | Un guardia con efectos secundarios: abre diálogo, incrementa el contador de derrotas y borra el guardado. Hoy es seguro solo porque el manejador de teclado comprueba `dialog.open` antes de actuar. Es frágil ante cualquier vía de entrada nueva. |
| Umbrales de logros fuera del bloque de equilibrio | Baja | `survivor` (vida ≥ 45), `collector` (≥ 12 objetos) y `low-signal` (Señal < 35) siguen siendo números fijos en `app.js`. Continúan siendo alcanzables tras la recalibración por suerte, no por diseño: el próximo cambio de equilibrio puede desincronizarlos en silencio. |
| `explore()` retorna en silencio si el evento no existe | Baja | Ya se ha consumido tiempo y Señal, y no se repinta la pantalla. Hoy es inalcanzable porque el validador comprueba la integridad referencial, pero el fallo sería mudo. |
| `addRandomConsumable()` puede no hacer nada | Baja | Si el jugador ya lleva los cuatro objetos de la reserva, la recompensa tras el combate se pierde sin aviso. Con los drops al 45 % ocurre más a menudo. |
| El final del Recipiente promete una opción inexistente | Baja | El texto anuncia que aparecerá «Transmitir» en el menú principal. No existe. Funciona como remate inquietante, pero un jugador puede leerlo como una función prometida. |
| Sin música ambiental | Informativa | Decisión de diseño para evitar licencias y peso. |

## 9. Recomendación

Publicar la v1.1.1 como release candidate. El balance no cambia respecto a v1.1.0 y la batería de Chromium se ha ejecutado correctamente.
El siguiente trabajo con más valor no es técnico: es jugar la campaña entera un par
de veces y comprobar si el ritmo y la tensión funcionan. La simulación demuestra
que se puede terminar y que las tres presiones (vida, cordura y Señal) están
repartidas entre investigadores; no puede decir si da miedo.
