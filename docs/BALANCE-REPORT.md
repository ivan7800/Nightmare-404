# Informe de equilibrio — Nightmare 404 v3.6.0 Director's Cut


> **Verificación v3.1 Premium:** el motor de equilibrio no cambia. La ejecución final `4000 --ci` simuló 36.000 campañas; la estrategia mixta quedó en 37,7–39,3 % y el conjunto de combinaciones en 30,5–50,4 %.
## Método

Simulación Monte Carlo sobre la misma configuración de equilibrio que consume el juego. Ejecución final:

```bash
node tests/balance_sim.js 4000 --ci
```

Se simulan 4.000 campañas por combinación de investigador y estrategia de resolución: 3 investigadores × 3 estrategias = **36.000 campañas**.

## Criterio de aceptación

- Estrategia mixta: entre 30 % y 45 % de victorias.
- Ninguna combinación individual: fuera de 25 %–55 %.

## Resultado final

| Estrategia | Lucía Vega | Matías Rivas | Noa Sanz |
|---|---:|---:|---:|
| Sellos | 49,0 % | 46,4 % | 41,1 % |
| Conocimiento | 29,8 % | 30,9 % | 30,6 % |
| Mixta | 40,8 % | 38,8 % | 37,5 % |

- Estrategia mixta: **37,5–40,8 %** → dentro del objetivo.
- Todas las vías: **29,8–49,0 %** → dentro del límite 25–55 %.
- Resultado del simulador: **EQUILIBRIO ACEPTADO**.

## Lectura de diseño

La ruta de conocimiento sigue siendo la más dura, especialmente para Lucía, pero permanece dentro del rango aceptado. Sellos es la vía más segura. La estrategia mixta queda muy agrupada entre los tres investigadores, lo que reduce la probabilidad de que una elección de personaje condene la campaña.

La v3.6.0 no modifica números de combate ni economía respecto a la base equilibrada anterior; los cambios de esta versión son de dirección, audio, UX, persistencia, PWA y documentación.

## Límite de la simulación

Una simulación no sustituye sesiones humanas. Para un 10/10 comercial faltan campañas completas con jugadores reales, observación de abandono, percepción de dificultad y ajustes posteriores basados en evidencia de uso.
