# PLAN DE REVISIÓN Y LOG DE FEEDBACK — [CLIENTE] · [PIEZA]

> Gates **G8** (rondas) → **G9** (picture lock). Dueño: Productor (consolida) · Motion director (traduce al agente) · Aprueba: Cliente (aprobador único).
> Archivos: `reviews/plan.md`, `reviews/R1.md`, `reviews/R2.md`. Cada versión enviada = tag git `rvw-vNN`.

---

## 1. Plan de revisión (se acuerda en G0)
| Ronda | Qué se revisa | Qué NO se revisa | Herramienta | Revisores (cliente) | Envío | Feedback límite | Formato del feedback |
|---|---|---|---|---|---|---|---|
| G3 Guion (2 rondas) | Mensaje, estructura, palabras, claims | Visual final | Google Docs (modo sugerencia) | Aprobador + SME + Legal | | | Sugerencias en doc |
| G4 Styleframes | Look: color, tipo, composición | Movimiento | Frame.io (imágenes) / PDF | Aprobador + Marca | | | Elegir 1 dirección + ajustes |
| G6 Animatic (1 ronda) | Orden, timing, comprensión, hook | Movimiento final, color fino | Frame.io | Aprobador | | | Comentarios con TC |
| **R1** (v01) | Contenido visual dentro de lo aprobado; claridad; marca | Guion (ya firmado) | Frame.io | Aprobador (consolida su equipo) | | | **Lista única consolidada** |
| **R2** (v02) | Pulido: timing fino, detalles, legales | Cambios estructurales | Frame.io | Aprobador | | | Lista única consolidada |
| R3 (v03, solo bugs) | Errores objetivos | Todo lo demás | Frame.io | Aprobador | | | |
| **G9 Lock** | Firma de versión final | — | Acta (email/firma) | Aprobador | | | "Aprobado vNN" |

**Reglas acordadas**
1. **Una ronda = una lista consolidada, de una sola fuente (el aprobador), en una sola entrega.** Comentarios tardíos van a la ronda siguiente.
2. Incluidas: 2 rondas de build + R3 solo bugs. Ronda extra: $____.
3. Cambio que contradice un gate firmado (guion, estilo, animatic) = **change order** con costo y fecha.
4. Sin feedback en el SLA (__ h hábiles) → se considera aprobado.
5. Toda nota debe tener **TC + qué + por qué** (ver §2). Notas sin "por qué" se devuelven pidiendo la intención.
6. R2 se revisa **completa** (no solo los cambios).

---

## 2. Cómo dar feedback accionable sobre motion (guía para el cliente y el equipo)
**Fórmula:** `TC (o rango) · QUÉ · POR QUÉ · REFERENCIA · PRIORIDAD`

| ❌ No accionable | ✅ Accionable |
|---|---|
| "No me gusta el gráfico" | "00:41–00:44 · Las barras entran lento y el dato clave aparece último · Por qué: se pierde la conclusión · Ref: ritmo de 00:12 · Must" |
| "Más dinámico" | "00:20–00:35 · Escenas se sienten largas · Por qué: perdemos atención antes del dato · Ref: el pacing de [link] · Should" |
| "El logo más grande" | "01:25 · Logo se ve chico vs guía de marca p.12 · Must" |
| "Cambiar la música" | "Toda la pieza · La música compite con la voz en términos técnicos (00:30, 00:52) · Ref: [track] · Should" |

**Categorías:** `Bug` (error objetivo: typo, dato, sync) · `Cambio` (dentro de lo aprobado) · `Nuevo alcance` (contradice gate firmado → change order)
**Prioridad:** `Must` (bloquea aprobación) · `Should` (mejora clara) · `Could` (si hay tiempo)

---

## 3. Log de feedback (una fila por nota; se alimenta del export CSV de Frame.io)
| FB-ID | Ronda | Versión | TC in–out | Escena | Autor | Nota original (literal) | Categoría | Prioridad | Decisión productor | Responsable | Estado | Corregido en | Verificación |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| FB-012 | R1 | v01 | 00:41:12–00:44:00 | S08 | Cliente (Mkt) | "El gráfico se siente lento y no se entiende qué es lo importante" | Cambio | Must | Aceptado | Motion dir. → Agente | Hecho | v02 | Snapshot 41.5/42.5/43.5 + reproducción OK (MD) |
| FB-013 | R1 | v01 | 00:52 | S10 | Cliente (Producto) | "Esa pantalla ya cambió en la versión 3.2" | Bug (contenido) | Must | Aceptado — pedir captura nueva | Editor | En curso | | |
| FB-014 | R1 | v01 | 00:30 | S05 | Cliente (CEO) | "Cambiemos la frase por 'la plataforma más rápida del mercado'" | Nuevo alcance + claim comparativo | — | **Rechazado / a Legal** (claim sin sustento; guion firmado) | Productor | Escalado | | |
| FB-015 | R1 | v01 | 00:30 | S05 | Cliente (Mkt) | "Me encanta esta escena" | — | — | Proteger: `lock: true` | Motion dir. | Hecho | | |

**Resolución de contradicciones:** si dos notas chocan (p. ej. "más texto" vs "menos texto"), el productor **no las ejecuta** y las devuelve al aprobador con la contradicción explícita.

---

## 4. Traducción feedback humano → instrucción para el agente
> El agente recibe **instrucciones**, no comentarios crudos. Una instrucción por FB-ID. El motion director convierte síntoma → causa → cambio concreto.

### Plantilla
```
[FB-___] Escena S__ · TC hh:mm:ss:ff–hh:mm:ss:ff · Prioridad: Must/Should/Could · Versión base: v__ (tag rvw-v__)
Nota humana (literal): "…"
Diagnóstico (motion director): <causa concreta: duración, easing, jerarquía, contraste, densidad, sync con VO>
Instrucción al agente:
  CAMBIAR: <elemento> · <propiedad> de <valor actual> a <valor nuevo> · <duración/easing/token> · <disparador (palabra VO o TC)>
  MANTENER: layout aprobado (boards/stills/S__.png), textos, tokens, duración total de la escena (__ s)
  NO TOCAR: <lista de escenas / elementos con lock>, audio, otras escenas
  DATOS: <archivo> (no inventar valores)
Criterio de aceptación: <qué debe ser verdad en snapshot @ TC>; `npx hyperframes check` sin errores; duración de la escena sin cambios
Verificación: snapshot --at <t1,t2,t3> · compare v__ vs v__ · reproducción completa 1x por el motion director
Registro: history begin --who claude --label "R1 FB-___" … history end
```

### Ejemplo resuelto
```
[FB-012] Escena S08 · TC 00:00:41:12–00:00:44:00 · Must · Versión base: v01 (rvw-v01)
Nota humana: "El gráfico se siente lento y no se entiende qué es lo importante"
Diagnóstico: barras entran en 1,2 s con ease lineal; el dato clave (p95 −38 %) aparece al final y con el mismo peso visual que el resto.
Instrucción al agente:
  CAMBIAR: entrada de barras 1,2 s linear → 0,6 s power3.out, stagger 0,08 s
  CAMBIAR: barra "v2" a token --accent; label "−38 % p95" (type.display) aparece en la palabra VO "treinta y ocho", scale 0,9→1, 0,25 s
  CAMBIAR: resto de barras a --neutral-500
  MANTENER: layout de boards/stills/S08.png, textos, duración de S08 = 3,0 s
  NO TOCAR: S07, S09 (lock: true), audio
  DATOS: data/latency-p95.json
Criterio de aceptación: en snapshot @ 43.0 s "−38 % p95" es el elemento de mayor contraste; cifras = JSON; check sin errores; S08 sigue durando 3,0 s
Verificación: snapshot --at 41.5,42.5,43.5 ; compare rvw-v01 vs v02 @ 43.0 ; reproducción 1x
```

### Tabla de traducciones frecuentes
| Feedback | Causa típica | Instrucción tipo |
|---|---|---|
| "Más dinámico" | Holds largos, easing lineal, escenas >7 s | Entradas 0,4–0,5 s power3.out; holds ≤1,5 s post-dato; stagger 0,06 s; misma duración total |
| "No se lee" | Tipo chico, poco contraste, poco tiempo | Subir tamaño a token mayor; fondo sólido; tiempo ≥ 1 s + 0,3 s/palabra; contraste ≥ 4,5:1 |
| "Se siente barato" | Easings mezclados, sombras/glows no tokenizados, íconos stock | Unificar easing del design spec; quitar efectos no tokenizados; íconos de marca |
| "Muy cargado" | >3 elementos nuevos a la vez | Dividir en 2 beats; construcción progresiva sincronizada con VO |
| "No se entiende el gráfico" | Sin jerarquía, sin conclusión | Resaltar 1 serie (--accent), atenuar resto, label de conclusión en la palabra ancla |
| "Lo quiero como [referencia]" | Referencia sin análisis | MD analiza la referencia (ritmo, easing, transición) y la traduce a 2–3 parámetros concretos |

---

## 5. Cierre de ronda (changelog al cliente)
```
ACME_LAUNCH26_EXPL01_RVW_v02_16x9-1080p_ES_20261029.mp4  (tag rvw-v02)
Resuelto en v02:
- FB-012 (S08) Gráfico más rápido; dato −38 % p95 destacado.
- FB-013 (S10) Pantalla actualizada a la versión 3.2 del producto.
No incluido (motivo):
- FB-014 (S05) Claim comparativo: requiere sustento + revisión legal; guion firmado → propuesto como change order.
Protegido (sin cambios): S05, S07, S09.
Próximo paso: R2 — feedback consolidado hasta AAAA-MM-DD hh:mm.
```

## 6. Acta de picture lock (G9)
| Campo | Valor |
|---|---|
| Versión aprobada | `v03` · tag `lock-v03` · commit `abc1234` |
| Duración | 00:01:30:00 @ 30 fps |
| Escenas | S01–S12 (todas `lock: true`) |
| Pendientes post-lock permitidos | Mezcla final, captions, versiones de formato, corrección de bugs objetivos |
| Aprobado por | Nombre (cliente) · fecha · medio (email/firma) |
