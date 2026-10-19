# GUION — EXPL01 · Qué es un servidor MCP (ejemplo resuelto)

**Duración objetivo:** ~42 s (render v003: 46 s, +9,5 % → pendiente de ajuste o re-aprobación) · **VO:** 82 palabras netas (≈ 37 s a 2,2 palabras/s; tope para 42 s: ~92) · **Estructura:** Hook 10 % · Problema 19 % · Mecanismo 21 % · Prueba 19 % · Credibilidad 11 % · CTA 12 %

**Hook elegido** (de 3 opciones): tensión — "brillante pero ciego". Alternativas descartadas: resultado ("tu IA leyendo tu base en 10 s") por requerir demo real; pregunta ("¿por qué tu chatbot no sabe nada de tu empresa?") por menos concreta.

| # | AUDIO (VO literal) | VIDEO (bloque · texto en pantalla literal · anclaje) |
|---|---|---|
| s01 | Tu modelo de IA es brillante… pero no ve nada de tu empresa. | `kinetic-statement` · "Sin herramientas, tu IA *no ve* tus datos." · acento en "no ve" cuando la VO dice "nada" |
| s02 | Para eso existe MCP. | `title-card` · kicker "Explainer" · "Qué es un / *servidor MCP*" · bajada "El enchufe estándar entre IA y sistemas." |
| s03 | Sin un estándar, cada app necesita su propio conector para cada modelo. Con MCP, cada lado se conecta una sola vez. | `split-compare` · "Sin estándar" vs "Con MCP" · N × M vs N + M [C-002] |
| s04 | La app de IA, el host, usa un cliente MCP para hablar con servidores, que exponen herramientas y datos de tus sistemas. | `steps-flow` · Host → Cliente MCP → Servidor MCP → Tu sistema · cada paso entra en su palabra [C-003] |
| s05 | Conectar uno es una entrada de configuración. | `code-reveal` · `.mcp.json` (sintaxis a verificar contra la doc vigente) · resaltar líneas 3, 4 y 7 [C-004] |
| s06 | Y es abierto: lo publicó Anthropic en noviembre de 2024. | `kinetic-statement` · "Protocolo *abierto*, publicado por Anthropic en noviembre de 2024." [C-001] |
| s07 | Probalo hoy con un servidor. | `end-card` · "Probalo hoy con / *un* servidor" · `modelcontextprotocol.io` · disclosure IA |

## VO limpia (para TTS/locutor) — 82 palabras netas, ~37 s de habla a 2,2 palabras/s + aire entre escenas
Tu modelo de IA es brillante… pero no ve nada de tu empresa. Para eso existe MCP. Sin un estándar, cada app necesita su propio conector para cada modelo. Con MCP, cada lado se conecta una sola vez. La app de IA, el host, usa un cliente MCP para hablar con servidores, que exponen herramientas y datos de tus sistemas. Conectar uno es una entrada de configuración. Y es abierto: lo publicó Anthropic en noviembre de 2024. Probalo hoy con un servidor.
