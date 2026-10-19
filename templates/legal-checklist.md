# Checklist legal y de compliance por pieza

> Fuente: research/07-critica-legal-riesgos.md §6.4. **No es asesoramiento legal.** Niveles: N1 interno/bajo riesgo · N2 público/marca · N3 cliente, pauta paga, personas reales o voz clonada.

## Checklist IA – Pieza: ____________  | Nivel: N1 / N2 / N3 | Owner: ________ | Fecha: ________
> No es asesoramiento legal. Ante dudas en N2/N3, escalar a Legal.

### A. Identificación y herramientas
- [ ] Modelo, plan y versión registrados (solo plan comercial; nunca Pro/Max para clientes)
- [ ] Framework y versión fijados; lockfile commiteado; sin upgrades automáticos durante la pieza
- [ ] Skills usados en la allowlist, con hash registrado
- [ ] Telemetría y feedback automático deshabilitados (HYPERFRAMES_NO_TELEMETRY=1 / DO_NOT_TRACK=1)

### B. Datos y confidencialidad
- [ ] Clasificación de datos de la pieza (pública / interna / confidencial / cliente)
- [ ] Datos confidenciales del cliente solo con proveedores con DPA; render local o en nube propia
- [ ] Sin secretos, API keys, emails, nombres de clientes ni datos personales visibles en capturas o código
- [ ] Ningún "cloud render" ni "publish" a servicios de terceros sin aprobación

### C. Exactitud (videos tech)
- [ ] Cada cifra, gráfico y claim tiene fuente en un archivo del proyecto (no inventada por el modelo)
- [ ] El código que se muestra compila o corre y fue revisado; no reproduce código con licencia incompatible
- [ ] La UI mostrada corresponde a la versión real (o está marcada como "ilustrativa")
- [ ] SME firmó la exactitud técnica

### D. Software y licencias
- [ ] Licencias de framework y dependencias revisadas (Apache-2.0, GSAP Standard License, MPL, CC-BY)
- [ ] Remotion: seats de Company License al día (si aplica; cuenta cada persona que prompteá Remotion)
- [ ] Sin bloques o assets de catálogo con "origen por confirmar"
- [ ] Atribuciones requeridas (CC BY, NOTICE) incluidas donde corresponda

### E. Tipografías
- [ ] Cada fuente tiene una licencia que cubre video, el canal (social / broadcast / paid) y el embedding web/woff2 si se embebe
- [ ] Ninguna fuente desktop sin licencia de embedding fue auto-capturada o subida a nube de terceros
- [ ] Archivo de licencia guardado en /licenses

### F. Música y SFX
- [ ] Licencia escrita que cubre canales, territorios, paid media y vigencia
- [ ] Si es música IA: proveedor con términos comerciales; riesgo de Content ID evaluado; sin "estilo de" artistas reales
- [ ] SFX CC BY acreditados en la descripción o los créditos
- [ ] Prueba de Content ID (subida privada o no listada) antes de publicar en N2/N3

### G. Imágenes, video y stock
- [ ] Licencias de stock guardadas; restricciones (personas, marcas, usos sensibles) respetadas
- [ ] Imágenes o video IA fotorrealistas identificados para la divulgación (sección J)

### H. Personas, voces y avatares
- [ ] Sin clon de voz ni avatar de persona real sin **consentimiento escrito** (alcance, canales, plazo, revocación, compensación)
- [ ] Consentimiento conforme a la ley local (p. ej. Art. 53 CCyC en Argentina; right of publicity en EE. UU.)
- [ ] Sin imitación de figuras públicas, ni siquiera "parecida"

### I. Marcas y UI de terceros
- [ ] Uso nominativo justificado: solo lo necesario, sin aval implícito, preferir texto a logo
- [ ] Guías de marca del titular revisadas (logos, capturas)
- [ ] Logos obtenidos automáticamente (p. ej. media-use --type logo) aprobados por una persona
- [ ] Publicidad comparativa revisada por Legal (N3)

### J. Divulgación y etiquetado
- [ ] ¿Hay contenido realista sintético (voz de persona, avatar, footage o imagen fotorrealista de personas, productos o lugares)?  Sí / No
- [ ] Si sí: toggle de YouTube / autodeclaración de Meta / etiqueta de TikTok / nota en LinkedIn aplicados
- [ ] Si la pieza se usa en la UE: obligación de deepfake (Art. 50(4)) evaluada; divulgación visible si aplica
- [ ] Si el texto es de interés público: revisión editorial humana documentada
- [ ] Master firmado con C2PA (N2/N3 con elementos realistas); metadatos no removidos en la exportación

### K. Derechos y contrato
- [ ] Aporte humano documentado (guion, storyboard, selección, edición)
- [ ] El contrato con el cliente refleja el uso de IA y ajusta la garantía de titularidad
- [ ] Se informó al cliente si la pieza puede no ser registrable en EE. UU.

### L. Reproducibilidad y archivo
- [ ] Repo con código, lockfile, PROVENANCE.yaml, prompts o transcript exportados, /licenses
- [ ] Master en formato intermedio (ProRes o PNG sequence) y entregables archivados con hash
- [ ] Prueba golden o re-render verificado si hubo upgrade

### M. Firmas
- [ ] Creativo: ________  - [ ] SME: ________  - [ ] Legal (N2 muestreo / N3): ________  - [ ] SecOps (si hubo cambios de tooling): ________

