/* Pulso — tokens JS para GSAP (GENERADO por scripts/brand-apply.mjs — no editar a mano)
   Requiere cargar antes: vendor/gsap.min.js y vendor/CustomEase.min.js
   API:
     BRAND.ease("enter")      → nombre de ease registrado ("brand.enter")
     BRAND.dur("enter")       → segundos (0.6)
     BRAND.stagger("words")   → segundos entre elementos
     BRAND.stagger("items", n)→ idem, acotado para que el grupo de n elementos dure ≤ staggerGroupMaxMs
     BRAND.hold("texto...")   → segundos mínimos de lectura para ese texto
     BRAND.color("accent")    → hex
     BRAND.u(el)              → px por 1cqmin del frame que contiene a el
     BRAND.logo.svgMark       → SVG inline del isotipo
*/
(function () {
  var B = {
  "name": "Pulso",
  "slug": "pulso",
  "version": "1.0.0",
  "colors": {
    "background": "#120A1C",
    "surface": "#1E1230",
    "surfaceAlt": "#2A1A42",
    "border": "#3D2A5C",
    "text": "#FFF6FA",
    "textMuted": "#CDBFDB",
    "primary": "#FF4F8B",
    "secondary": "#8B6CFF",
    "accent": "#E8FF59",
    "danger": "#FF6B6B",
    "success": "#3DDC97",
    "onPrimary": "#160A12",
    "onAccent": "#120A1C",
    "code": {
      "background": "#170D24",
      "text": "#F2EAF7",
      "comment": "#A797BD",
      "keyword": "#FF8DB5",
      "string": "#C9F27A",
      "number": "#FFD36B",
      "function": "#B9A4FF"
    },
    "dataViz": [
      "#FF4F8B",
      "#8B6CFF",
      "#E8FF59",
      "#4FD1FF",
      "#FF9F43",
      "#A797BD"
    ],
    "gradients": {
      "hero": [
        "#FF4F8B",
        "#8B6CFF"
      ]
    },
    "rules": {
      "maxAccentMomentsPerFrame": 1,
      "notes": "El lima (accent) es el resaltado del dato o la palabra clave: una vez por frame. Rosa y violeta son estructura y fondo."
    }
  },
  "fonts": {
    "display": "Bricolage Grotesque",
    "body": "Inter",
    "mono": "JetBrains Mono"
  },
  "motion": {
    "personality": "expressive",
    "personalityOptions": "productive = preciso y sobrio (B2B, tech) | balanced | expressive = enérgico (social, lanzamientos)",
    "principles": [
      "El movimiento empuja: cada beat entra con decisión y deja el dato quieto para leerlo.",
      "Una cosa a la vez: el ojo sigue un solo foco por beat; el resto queda quieto.",
      "Nunca arrancar en t=0: primer movimiento a los 150-300 ms de iniciada la escena.",
      "Entradas decididas, salidas discretas: las salidas duran ~65% de las entradas y aceleran.",
      "Holds generosos: el texto queda en pantalla al menos max(1,5 s; 0,8 s + 0,35 s por palabra; caracteres / 15).",
      "Dirección consistente: lo nuevo entra de derecha/abajo, lo que se va sale a izquierda/arriba.",
      "Máximo 2 tweens con el mismo easing por escena; la escena más lenta dura ~3x la más rápida."
    ],
    "durations": {
      "instant": 80,
      "micro": 120,
      "short": 200,
      "enter": 420,
      "exit": 260,
      "emphasis": 650,
      "scene": 350,
      "long": 1000
    },
    "easings": {
      "standard": [
        0.2,
        0,
        0,
        1
      ],
      "enter": [
        0.22,
        1,
        0.36,
        1
      ],
      "exit": [
        0.55,
        0.055,
        0.675,
        0.19
      ],
      "emphasized": [
        0.16,
        1,
        0.3,
        1
      ],
      "move": [
        0.645,
        0.045,
        0.355,
        1
      ],
      "camera": [
        0.77,
        0,
        0.175,
        1
      ],
      "linear": [
        0,
        0,
        1,
        1
      ],
      "expressive": [
        0.34,
        1.56,
        0.64,
        1
      ]
    },
    "stagger": {
      "letters": 20,
      "words": 55,
      "lines": 90,
      "items": 50
    },
    "staggerGroupMaxMs": 450,
    "staggerComment": "Un grupo escalonado no supera staggerGroupMaxMs: BRAND.stagger(nombre, n) devuelve min(valor, staggerGroupMaxMs / n).",
    "distance": {
      "small": 1.5,
      "medium": 4,
      "large": 10,
      "unit": "cqmin"
    },
    "reading": {
      "secondsPerWord": 0.35,
      "baseMs": 800,
      "minHoldMs": 1500,
      "charsPerSecond": 15,
      "comment": "hold = max(minHold; base + 0,35 s × palabras; caracteres / 15). Sumá +20 % si el texto es técnico (código, cifras, nombres propios)."
    },
    "transitions": {
      "default": "push",
      "allowed": [
        "cut",
        "crossfade",
        "push",
        "mask-wipe"
      ],
      "comment": "Solo las transiciones implementadas en build:roots. Una transición fuera de esta lista hace fallar el build (nunca cae a corte en silencio).",
      "manualInNLE": [
        "zoom-through",
        "match-cut"
      ],
      "manualComment": "Permitidas por la marca pero no automatizadas: se resuelven en el editor (NLE) o como escena custom.",
      "forbidden": [
        "spin",
        "star-wipe",
        "glitch aleatorio",
        "page-curl",
        "flash blanco > 3 por segundo"
      ]
    },
    "forbidden": [
      "Bounce/elastic en texto (la energía sale del ritmo, no del rebote)",
      "Emojis o stickers animados",
      "Más de un resaltado por frame",
      "Glow, partículas o lens flares de relleno",
      "Movimiento continuo detrás de texto que se está leyendo"
    ],
    "easingNotes": {
      "standard": "Reposicionar algo visible (Material 3 standard)",
      "enter": "Entrada por defecto, rápida y decidida (= expo-ish out), sin rebote",
      "exit": "Salida por defecto, acelera (= power2.in)",
      "emphasized": "Golpe de entrada para titulares y el dato (más corto y seco que productive)",
      "move": "Movimientos simétricos y push entre escenas (= power2.inOut)",
      "camera": "Zoom/paneo de cámara virtual (= power3.inOut), 1-2 s",
      "linear": "Tipeo, progreso, scroll constante",
      "expressive": "RESTRINGIDO: overshoot ~10%. Solo registro lúdico aprobado; nunca datos, logos ni texto"
    }
  },
  "captions": {
    "enabled": true,
    "file": "captions.srt",
    "burnIn": [
      "portrait",
      "feed"
    ],
    "burnInComment": "Si existe captions.srt|.vtt en el proyecto, build:roots los quema en estos formatos. En el resto se entregan como archivo (sidecar).",
    "style": "rail",
    "maxCharsPerLine": 38,
    "maxLines": 2,
    "minDurationMs": 1000,
    "maxCharsPerSecond": 17,
    "position": "bottom",
    "highlightActiveWord": false
  },
  "look": {
    "background": "gradient",
    "align": "start",
    "statementAlign": "start",
    "statementSize": "hero",
    "headlineCase": "uppercase",
    "accentStyle": "highlight",
    "textReveal": "rise",
    "kicker": "dot",
    "cards": "none",
    "density": "compact",
    "summary": "Energética para social: gradiente rosa-violeta, titulares enormes en MAYÚSCULAS, el dato resaltado en lima y texto que sube con fuerza."
  },
  "logo": {
    "primary": "logo/primary.svg",
    "mark": "logo/mark.svg",
    "onDark": "logo/onDark.svg",
    "onLight": "logo/onLight.svg",
    "svgMark": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 120 120\" width=\"120\" height=\"120\" role=\"img\" aria-label=\"Pulso\">\n<g data-part=\"mark\">\n  <circle cx=\"60\" cy=\"60\" r=\"60\" fill=\"#FF4F8B\"/>\n  <path d=\"M16.8 64.80000000000001 H40.800000000000004 L51.6 36 L67.2 88.8 L78 55.2 H103.2\" fill=\"none\" stroke=\"#160A12\" stroke-width=\"10.200000000000001\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n  <circle cx=\"103.2\" cy=\"55.2\" r=\"9\" fill=\"#E8FF59\"/>\n</g>\n</svg>\n",
    "svgPrimary": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 475 120\" width=\"475\" height=\"120\" role=\"img\" aria-label=\"Pulso\">\n<g data-part=\"mark\">\n  <circle cx=\"60\" cy=\"60\" r=\"60\" fill=\"#FF4F8B\"/>\n  <path d=\"M16.8 64.80000000000001 H40.800000000000004 L51.6 36 L67.2 88.8 L78 55.2 H103.2\" fill=\"none\" stroke=\"#160A12\" stroke-width=\"10.200000000000001\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n  <circle cx=\"103.2\" cy=\"55.2\" r=\"9\" fill=\"#E8FF59\"/>\n</g>\n<g data-part=\"wordmark\" transform=\"translate(156 91.68)\"><path d=\"M17.95 -17.38L17.95 -29.28L32.06 -29.28Q38.3 -29.28 41.38 -31.87Q44.45 -34.46 44.45 -40.61Q44.45 -45.98 41.62 -48.77Q38.78 -51.55 32.64 -51.55L17.95 -51.55L17.95 -63.36L33.12 -63.36Q39.26 -63.36 44.21 -61.92Q49.15 -60.48 52.7 -57.65Q56.26 -54.82 58.13 -50.45Q60 -46.08 60 -40.22Q60 -32.74 56.59 -27.65Q53.18 -22.56 46.51 -19.97Q39.84 -17.38 29.86 -17.38ZM6.62 0L6.62 -63.36L22.08 -63.36L22.08 0Z M97.92 1.34Q91.87 1.34 87.17 0.14Q82.46 -1.06 79.01 -3.36Q75.55 -5.66 73.3 -8.93Q71.04 -12.19 69.94 -16.27Q68.83 -20.35 68.83 -25.15L68.83 -63.36L84.38 -63.36L84.38 -25.63Q84.38 -21.02 85.82 -18.05Q87.26 -15.07 90.24 -13.68Q93.22 -12.29 97.82 -12.29Q102.43 -12.29 105.41 -13.68Q108.38 -15.07 109.82 -18.05Q111.26 -21.02 111.26 -25.63L111.26 -63.36L126.72 -63.36L126.72 -25.15Q126.72 -12.58 119.57 -5.62Q112.42 1.34 97.92 1.34Z M139.58 0L139.58 -63.36L155.04 -63.36L155.04 0ZM142.37 0L142.37 -12.96L180.86 -12.96L180.86 0Z M213.6 1.34Q207.46 1.34 202.46 0.19Q197.47 -0.96 193.82 -3.31Q190.18 -5.66 188.06 -9.31Q185.95 -12.96 185.57 -17.76L199.1 -22.27Q199.39 -18.24 201.41 -15.55Q203.42 -12.86 206.83 -11.57Q210.24 -10.27 214.46 -10.27Q218.5 -10.27 221.23 -11.28Q223.97 -12.29 225.36 -13.87Q226.75 -15.46 226.75 -17.28Q226.75 -19.39 224.93 -20.78Q223.1 -22.18 219.94 -23.18Q216.77 -24.19 212.54 -25.15Q207.74 -26.3 203.14 -27.65Q198.53 -28.99 194.78 -31.15Q191.04 -33.31 188.88 -36.72Q186.72 -40.13 186.72 -45.31Q186.72 -51.17 189.7 -55.49Q192.67 -59.81 198.43 -62.26Q204.19 -64.7 212.64 -64.7Q220.99 -64.7 226.85 -62.3Q232.7 -59.9 235.87 -55.63Q239.04 -51.36 239.33 -45.7L225.5 -41.76Q225.5 -44.54 224.59 -46.66Q223.68 -48.77 222.05 -50.16Q220.42 -51.55 218.02 -52.27Q215.62 -52.99 212.54 -52.99Q208.9 -52.99 206.35 -52.13Q203.81 -51.26 202.56 -49.87Q201.31 -48.48 201.31 -46.66Q201.31 -44.35 203.28 -42.86Q205.25 -41.38 208.66 -40.37Q212.06 -39.36 216.19 -38.4Q220.32 -37.54 224.74 -36.24Q229.15 -34.94 232.99 -32.83Q236.83 -30.72 239.18 -27.12Q241.54 -23.52 241.54 -18.05Q241.54 -12.19 238.42 -7.82Q235.3 -3.46 229.06 -1.06Q222.82 1.34 213.6 1.34Z M279.55 1.34Q272.64 1.34 267.07 -0.77Q261.5 -2.88 257.52 -7.01Q253.54 -11.14 251.42 -17.23Q249.31 -23.33 249.31 -31.39Q249.31 -42.72 253.3 -50.06Q257.28 -57.41 264.29 -61.06Q271.3 -64.7 280.13 -64.7Q286.94 -64.7 292.51 -62.59Q298.08 -60.48 302.06 -56.35Q306.05 -52.22 308.21 -46.03Q310.37 -39.84 310.37 -31.78Q310.37 -23.42 308.11 -17.23Q305.86 -11.04 301.78 -6.91Q297.7 -2.78 292.03 -0.72Q286.37 1.34 279.55 1.34ZM280.03 -10.75Q284.74 -10.75 287.95 -13.1Q291.17 -15.46 292.85 -19.92Q294.53 -24.38 294.53 -30.82Q294.53 -37.63 292.8 -42.38Q291.07 -47.14 287.76 -49.58Q284.45 -52.03 279.65 -52.03Q275.04 -52.03 271.82 -49.68Q268.61 -47.33 266.88 -42.77Q265.15 -38.21 265.15 -31.58Q265.15 -26.59 266.16 -22.7Q267.17 -18.82 268.99 -16.18Q270.82 -13.54 273.65 -12.14Q276.48 -10.75 280.03 -10.75Z\" fill=\"#FFF6FA\"/></g>\n</svg>\n"
  }
};
  var ok = typeof window !== "undefined" && window.gsap && window.CustomEase;
  if (ok) {
    window.gsap.registerPlugin(window.CustomEase);
    Object.keys(B.motion.easings).forEach(function (k) {
      window.CustomEase.create("brand." + k, B.motion.easings[k].join(","));
    });
  }
  B.ease = function (name) {
    if (!B.motion.easings[name]) throw new Error("BRAND.ease: easing desconocido '" + name + "'");
    return ok ? "brand." + name : "power2.out";
  };
  B.dur = function (name) {
    var v = B.motion.durations[name];
    if (v == null) throw new Error("BRAND.dur: duración desconocida '" + name + "'");
    return v / 1000;
  };
  B.stagger = function (name, n) {
    var v = B.motion.stagger[name];
    if (v == null) throw new Error("BRAND.stagger: stagger desconocido '" + name + "'");
    var max = B.motion.staggerGroupMaxMs || 500;
    if (n > 1) v = Math.min(v, max / n);
    return v / 1000;
  };
  B.hold = function (text) {
    var r = B.motion.reading || {};
    var spw = r.secondsPerWord || (r.wordsPerSecond ? 1 / r.wordsPerSecond : 0.35);
    var base = (r.baseMs != null ? r.baseMs : r.extraHoldMs != null ? r.extraHoldMs : 800) / 1000;
    var t = String(text || "").replace(/[|*]/g, " ").replace(/\s+/g, " ").trim();
    var words = t ? t.split(" ").length : 0;
    return Math.max((r.minHoldMs || 1500) / 1000, base + words * spw, t.length / (r.charsPerSecond || 15));
  };
  B.color = function (path) {
    return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, B.colors);
  };
  B.u = function (el) {
    var frame = el && el.closest ? el.closest(".bm-frame") : null;
    var r = (frame || document.documentElement).getBoundingClientRect();
    return Math.min(r.width, r.height) / 100;
  };
  window.BRAND = B;
})();
