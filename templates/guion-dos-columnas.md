# GUION A DOS COLUMNAS — [CLIENTE] · [PIEZA]

> Gate **G3**. Dueño: Guionista · Aprueba: Director creativo + SME (exactitud) + Legal (si hay comparativos) · Sign-off: Cliente.
> Archivo: `01_guion.md` (lo copia `npm run new`). Al firmar, la narración bloqueada queda en la sección **"VO limpia"** al final (formato SCRIPT de HyperFrames, abajo), que es lo que recibe el locutor o el TTS.

## Treatment (gate G2: se aprueba antes de escribir el guion)
Una página. El director creativo elige un hook y una dirección; recién ahí se escribe la tabla de abajo.
- **Mensaje único** (del brief, una oración):
- **Hooks candidatos** (2–3, cada uno en ≤ 12 palabras):
  1.
  2.
  3.
- **Estructura** (Hook → Problema → Solución → Prueba → CTA u otra de la guía) y beats con % de duración:
- **Tono y referencias** (2–3 links o stills, con qué tomar de cada uno):
- **Bloques previstos** (de `engine/blocks/README.md`) y momentos héroe (el 10–20 % que se pule a mano):
- **Claims que va a necesitar** (IDs de `research/claims.csv`; si falta alguno, se pide antes de seguir):
- **Aprobado G2:** ___ (director creativo) · fecha ___ · hook elegido: ___

## Cabecera
| Campo | Valor |
|---|---|
| Pieza / versión | `EXPL01` · `SCR_v02` |
| Duración objetivo | 90 s |
| Ritmo de narración | **2,2 palabras/s netas** (≈ 132 ppm, ritmo de TTS con aire) — fuente única: `brands/<marca>/brand.config.json` → `audio.voice.wordsPerSecond` |
| Presupuesto de palabras (neto) | **duración (s) × 2,2** → 90 s ≈ 198 · 60 s ≈ 132 · 30 s ≈ 66 (máximo; apuntá a 5–10 % menos para pausas) |
| **Conteo actual** | ___ palabras → duración estimada ___ s (palabras ÷ 2,2) + pausas |
| Duración leída en voz alta (cronometrada) | ___ s (criterio: ±10 % del objetivo) |
| Estructura | Hook → Problema → Solución → Prueba → CTA |
| Mensaje único | (copiar del brief) |
| Variante de idioma | es-419 |
| Voz | Locutor / TTS (proveedor + voz) · dirección: "segura, cercana, sin vender" |

## Leyenda
- **AUDIO:** `VO:` texto literal a locutar · `SFX:` efecto · `MX:` música (cue / cambio / stinger) · `[pausa 0,5 s]`
- **VIDEO:** `VIS:` qué se ve (layout, elementos) · `TXT:` texto en pantalla **literal** entre comillas · `MOV:` movimiento (elemento · verbo · duración · easing · disparador) · `TR:` transición de salida · `REF:` still / bloque / referencia
- **Ancla:** la palabra de la VO que dispara un evento visual va en **negrita** en AUDIO y se cita en MOV.
- **Claims:** IDs de `research/claims.csv`. Sin ID, no hay número.

## Guion
| # | TC in–out | Dur | AUDIO | VIDEO | Claims | Notas |
|---|---|---|---|---|---|---|
| S01 | 00:00–00:04 | 4 s | VO: "Este deploy tarda **cuatro segundos**. [pausa 0,3] El mes pasado tardaba **once minutos**." · SFX: tick seco en "cuatro" · MX: entra pulso grave | VIS: bloque `terminal` sobre `var(--c-background)`, comando `acme deploy --prod` ya escrito. TXT: "4 s" (`.bm-hero`, `var(--c-accent)`) → luego "11 min" tachado (`var(--c-text-muted)`). MOV: cursor ejecuta a los 0,2 s (nunca en t = 0); barra de progreso 0→100 % en 0,8 s (power2.out) termina en "**cuatro**"; "11 min" entra en "**once**" con strike-through 0,3 s. TR: corte seco. REF: `review/frames-landscape/01_s01-hook.png` | C-001 | Hook "resultado primero". Movimiento desde los 0,2 s (autoplay mudo). Sin logo. |
| S02 | 00:04–00:12 | 8 s | VO: "En la mayoría de los equipos, cada deploy es una espera: **build**, **tests**, **imagen**, **rollout**. Y mientras tanto, nadie mergea." · MX: sigue | VIS: pipeline horizontal de 4 nodos (bloque `steps-flow`). TXT: "build" "tests" "imagen" "rollout". MOV: cada nodo se ilumina (`var(--c-primary)`, 0,25 s) en su palabra ancla; reloj de arena pequeño gira lento arriba a la derecha. TR: zoom-in al nodo "imagen" (0,6 s, power3.inOut) | — | Problema. Densidad: 4 elementos, uno por vez. |
| S03 | 00:12–00:17 | 5 s | VO: "**Antes**, construir la imagen se llevaba casi todo el tiempo. **Ahora**, se reutiliza." · SFX: whoosh pre-lap 6 frames antes del corte | VIS: bloque `bar-chart`, dos barras horizontales. TXT: "v1 — 11 min" (`var(--c-text-muted)`), "v2 — 4 s" (`var(--c-accent)`), label "−99 %". MOV: barra A 0→100 % en 1,2 s (power2.out) en "**Antes**"; barra B 0,3 s en "**Ahora**"; label "−99 %" scale 0,9→1 0,25 s, +0,2 s. Datos: `research/data/deploy-times.json`. TR: corte. NO: partículas, glow, ejes | C-001, C-002 | Aceptación: a 00:16 "−99 %" es el elemento de mayor contraste. |
| S04 | … | | | | | |
| S12 | 01:24–01:30 | 6 s | VO: "Probalo gratis en **acme punto dev barra deploy**." · MX: resolución + stinger de marca | VIS: bloque `end-card` según `MOTION.md` (logo, área de respeto de `brand.config logo`). TXT: "acme.dev/deploy" · legal: "Benchmark interno, oct. 2026. Ver condiciones en la descripción." (mín. 3 s) | C-002 (legal) | CTA único. URL verificada + UTM. |

### Checklist de escritura (antes de enviar a G3)
- [ ] Hook en ≤5 s que cumple la promesa del título / miniatura; sin "hola, bienvenidos"
- [ ] Una idea por fila; cada fila 3–8 s
- [ ] Columna VIDEO completa en **todas** las filas (nada de "gráfico de esto")
- [ ] Texto en pantalla literal y **no** redundante con la VO (keyword / número, no la oración)
- [ ] Tiempo de lectura de cada texto en pantalla ≥ `máx(1,5 s; 0,8 s + 0,35 s × palabras; caracteres / 15)` (`BRAND.hold`)
- [ ] Todos los números y afirmaciones técnicas con ID de claim en estado `ok` y `verificado_por` firmado por el SME (no `PENDIENTE`): es lo que exige el gate de `build:roots --strict`
- [ ] Leído en voz alta y cronometrado (±10 %)
- [ ] Términos del glosario con pronunciación definida
- [ ] Re-hooks cada 45–90 s (solo piezas >2 min)
- [ ] CTA único, al final (no al inicio)
- [ ] Versión vertical considerada (qué escenas sobreviven al cutdown de 30 s)

## Registro de claims (extracto de `research/claims.csv`)
| ID | Claim (texto exacto) | Tipo | Fuente primaria | Fecha | Condiciones | Dueño | Estado |
|---|---|---|---|---|---|---|---|
| C-001 | "De 11 minutos a 4 segundos" | Performance | Informe interno de benchmark (link) | 2026-10-05 | Repo de 120k LOC, cache caliente, runner 8 vCPU | SME: Nombre | `ok` + firma SME ☐ · Legal ☐ |
| C-002 | "−99 %" | Performance (derivado de C-001) | Cálculo sobre C-001 | 2026-10-05 | Ídem | SME | ☐ |

> Tipos: performance · compatibilidad · seguridad · comparativo · pricing · roadmap · cliente/logo. Comparativos y pricing → Legal obligatorio.

## Glosario y pronunciación
| Término | Cómo se escribe en pantalla | Cómo se pronuncia | Nota |
|---|---|---|---|
| Kubernetes | Kubernetes | "kiu-ber-NE-tis" | No abreviar "K8s" en VO |
| SQL | SQL | "ese-cu-ele" / "sí-quel" (definir) | Consistencia en toda la pieza |
| CLI | CLI | "ce-ele-i" | |

## VO limpia (narración bloqueada, formato SCRIPT de HyperFrames)
```markdown
# SCRIPT — ACME_LAUNCH26 EXPL01

**Voice:** [proveedor + voz / nombre del locutor]
**Voice settings:** [p. ej. stability 0.35 · similarity 0.75 · style 0.20]
**Voice direction:** Segura, cercana, sin tono de venta. Ritmo ~2,2 palabras/s (132 ppm).

---

## Line 1 — Hook (Frame 1)

**Time:** 0.0 – 4.0s
**Delivery:** Pausa breve antes de "once minutos".

    Este deploy tarda cuatro segundos. El mes pasado tardaba once minutos.

## Line 2 — Problema (Frame 2)

**Time:** 4.0 – 12.0s
**Delivery:** Enumerar con ritmo parejo.

    En la mayoría de los equipos, cada deploy es una espera: build, tests, imagen, rollout. Y mientras tanto, nadie mergea.
```
> Los `**Time:**` son guía; el timing real sale de los timestamps por palabra de la VO final (G6b).

## Firmas G3
| Rol | Nombre | Fecha | OK |
|---|---|---|---|
| Director creativo | | | ☐ |
| SME (exactitud técnica) | | | ☐ |
| Legal (si aplica) | | | ☐ |
| Aprobador cliente | | | ☐ |
