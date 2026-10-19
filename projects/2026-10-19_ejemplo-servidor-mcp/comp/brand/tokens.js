/* TuMarca — tokens JS para GSAP (GENERADO por scripts/brand-apply.mjs — no editar a mano)
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
  "name": "TuMarca",
  "slug": "tumarca",
  "version": "1.1.0",
  "colors": {
    "background": "#0B0F19",
    "surface": "#131A2A",
    "surfaceAlt": "#1B2438",
    "border": "#2A3550",
    "text": "#F4F6FB",
    "textMuted": "#A6B0C5",
    "primary": "#4C8DFF",
    "secondary": "#2ED3A7",
    "accent": "#FFB547",
    "danger": "#FF6B6B",
    "success": "#3DDC84",
    "onPrimary": "#06101F",
    "code": {
      "background": "#0E1422",
      "text": "#E6EDF7",
      "comment": "#94A0B8",
      "keyword": "#7FB0FF",
      "string": "#5FE0B8",
      "number": "#FFC46B",
      "function": "#C9A7FF"
    },
    "dataViz": [
      "#4C8DFF",
      "#2ED3A7",
      "#FFB547",
      "#C9A7FF",
      "#FF6B6B",
      "#8A96B0"
    ],
    "gradients": {
      "hero": [
        "#4C8DFF",
        "#2ED3A7"
      ]
    },
    "rules": {
      "maxAccentMomentsPerFrame": 1,
      "notes": "El acento (accent) se raciona: una sola vez por frame, para el dato o la palabra clave. Nunca para texto corrido."
    }
  },
  "fonts": {
    "display": "Space Grotesk",
    "body": "Inter",
    "mono": "JetBrains Mono"
  },
  "motion": {
    "personality": "productive",
    "personalityOptions": "productive = preciso y sobrio (B2B, tech) | balanced | expressive = enérgico (social, lanzamientos)",
    "principles": [
      "El movimiento explica: cada animación responde a una pregunta (qué apareció, qué cambió, qué importa).",
      "Una cosa a la vez: el ojo sigue un solo foco por beat; el resto queda quieto.",
      "Nunca arrancar en t=0: primer movimiento a los 150-300 ms de iniciada la escena.",
      "Entradas decididas, salidas discretas: las salidas duran ~65% de las entradas y aceleran.",
      "Holds generosos: el texto queda en pantalla al menos max(1,5 s; 0,8 s + 0,35 s por palabra; caracteres / 15).",
      "Dirección consistente: lo nuevo entra de derecha/abajo, lo que se va sale a izquierda/arriba.",
      "Máximo 2 tweens con el mismo easing por escena; la escena más lenta dura ~3x la más rápida."
    ],
    "durations": {
      "instant": 100,
      "micro": 150,
      "short": 250,
      "enter": 500,
      "exit": 325,
      "emphasis": 800,
      "scene": 400,
      "long": 1200
    },
    "easings": {
      "standard": [
        0.2,
        0,
        0,
        1
      ],
      "enter": [
        0.165,
        0.84,
        0.44,
        1
      ],
      "exit": [
        0.55,
        0.055,
        0.675,
        0.19
      ],
      "emphasized": [
        0.19,
        1,
        0.22,
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
      "letters": 25,
      "words": 70,
      "lines": 120,
      "items": 60
    },
    "staggerGroupMaxMs": 500,
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
      "default": "cut",
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
      "Bounce/elastic en texto",
      "Todo entrando a la vez con el mismo fade+slide-up",
      "Rotaciones decorativas sin significado",
      "Glow, partículas o lens flares de relleno",
      "Movimiento continuo detrás de texto que se está leyendo"
    ],
    "easingNotes": {
      "standard": "Reposicionar algo visible (Material 3 standard)",
      "enter": "Entrada por defecto, desacelera sin rebote (= GSAP power3.out)",
      "exit": "Salida por defecto, acelera (= power2.in)",
      "emphasized": "Hero, reveals con máscara, el dato clave (= expo.out)",
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
  "logo": {
    "primary": "logo/primary.svg",
    "mark": "logo/mark.svg",
    "onDark": "logo/onDark.svg",
    "onLight": "logo/onLight.svg",
    "svgMark": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 120 120\" width=\"120\" height=\"120\" role=\"img\" aria-label=\"TuMarca\">\n<g data-part=\"mark\">\n  <rect x=\"0\" y=\"0\" width=\"120\" height=\"120\" rx=\"28.799999999999997\" fill=\"#4C8DFF\"/>\n  <path d=\"M50.4 36 L31.200000000000003 60 L50.4 84\" fill=\"none\" stroke=\"#06101F\" stroke-width=\"10.799999999999999\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n  <circle cx=\"79.2\" cy=\"74.4\" r=\"10.799999999999999\" fill=\"#FFB547\"/>\n</g>\n</svg>\n",
    "svgPrimary": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 557 120\" width=\"557\" height=\"120\" role=\"img\" aria-label=\"TuMarca\">\n<g data-part=\"mark\">\n  <rect x=\"0\" y=\"0\" width=\"120\" height=\"120\" rx=\"28.799999999999997\" fill=\"#4C8DFF\"/>\n  <path d=\"M50.4 36 L31.200000000000003 60 L50.4 84\" fill=\"none\" stroke=\"#06101F\" stroke-width=\"10.799999999999999\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n  <circle cx=\"79.2\" cy=\"74.4\" r=\"10.799999999999999\" fill=\"#FFB547\"/>\n</g>\n<g data-part=\"wordmark\" transform=\"translate(156 93.6)\"><path d=\"M21.89 0L21.89 -55.68L2.3 -55.68L2.3 -67.2L54.14 -67.2L54.14 -55.68L34.56 -55.68L34.56 0Z M74.4 0.77Q68.83 0.77 64.66 -1.78Q60.48 -4.32 58.18 -8.83Q55.87 -13.34 55.87 -19.2L55.87 -47.62L67.97 -47.62L67.97 -20.16Q67.97 -14.78 70.61 -12.1Q73.25 -9.41 78.14 -9.41Q83.71 -9.41 86.78 -13.1Q89.86 -16.8 89.86 -23.42L89.86 -47.62L101.95 -47.62L101.95 0L90.05 0L90.05 -6.24L88.32 -6.24Q87.17 -3.84 84 -1.54Q80.83 0.77 74.4 0.77Z M115.01 0L115.01 -67.2L138.53 -67.2L150.14 -8.64L151.87 -8.64L163.49 -67.2L187.01 -67.2L187.01 0L174.72 0L174.72 -57.89L172.99 -57.89L161.47 0L140.54 0L129.02 -57.89L127.3 -57.89L127.3 0Z M214.85 1.34Q209.76 1.34 205.73 -0.43Q201.7 -2.21 199.34 -5.62Q196.99 -9.02 196.99 -13.92Q196.99 -18.82 199.34 -22.13Q201.7 -25.44 205.87 -27.12Q210.05 -28.8 215.42 -28.8L228.48 -28.8L228.48 -31.49Q228.48 -34.85 226.37 -37.01Q224.26 -39.17 219.65 -39.17Q215.14 -39.17 212.93 -37.1Q210.72 -35.04 210.05 -31.78L198.91 -35.52Q200.06 -39.17 202.61 -42.19Q205.15 -45.22 209.42 -47.09Q213.7 -48.96 219.84 -48.96Q229.25 -48.96 234.72 -44.26Q240.19 -39.55 240.19 -30.62L240.19 -12.86Q240.19 -9.98 242.88 -9.98L246.72 -9.98L246.72 0L238.66 0Q235.1 0 232.8 -1.73Q230.5 -3.46 230.5 -6.34L230.5 -6.43L228.67 -6.43Q228.29 -5.28 226.94 -3.41Q225.6 -1.54 222.72 -0.1Q219.84 1.34 214.85 1.34ZM216.96 -8.45Q222.05 -8.45 225.26 -11.28Q228.48 -14.11 228.48 -18.82L228.48 -19.78L216.29 -19.78Q212.93 -19.78 211.01 -18.34Q209.09 -16.9 209.09 -14.3Q209.09 -11.71 211.1 -10.08Q213.12 -8.45 216.96 -8.45Z M255.55 0L255.55 -47.62L267.46 -47.62L267.46 -42.24L269.18 -42.24Q270.24 -45.12 272.69 -46.46Q275.14 -47.81 278.4 -47.81L284.16 -47.81L284.16 -37.06L278.21 -37.06Q273.6 -37.06 270.62 -34.61Q267.65 -32.16 267.65 -27.07L267.65 0Z M314.21 1.34Q307.3 1.34 301.68 -1.54Q296.06 -4.42 292.8 -9.89Q289.54 -15.36 289.54 -23.14L289.54 -24.48Q289.54 -32.26 292.8 -37.73Q296.06 -43.2 301.68 -46.08Q307.3 -48.96 314.21 -48.96Q321.02 -48.96 325.92 -46.56Q330.82 -44.16 333.84 -39.98Q336.86 -35.81 337.82 -30.53L326.11 -28.03Q325.73 -30.91 324.38 -33.22Q323.04 -35.52 320.59 -36.86Q318.14 -38.21 314.5 -38.21Q310.85 -38.21 307.92 -36.62Q304.99 -35.04 303.31 -31.92Q301.63 -28.8 301.63 -24.29L301.63 -23.33Q301.63 -18.82 303.31 -15.7Q304.99 -12.58 307.92 -10.99Q310.85 -9.41 314.5 -9.41Q319.97 -9.41 322.8 -12.24Q325.63 -15.07 326.4 -19.68L338.11 -16.9Q336.86 -11.81 333.84 -7.63Q330.82 -3.46 325.92 -1.06Q321.02 1.34 314.21 1.34Z M362.88 1.34Q357.79 1.34 353.76 -0.43Q349.73 -2.21 347.38 -5.62Q345.02 -9.02 345.02 -13.92Q345.02 -18.82 347.38 -22.13Q349.73 -25.44 353.9 -27.12Q358.08 -28.8 363.46 -28.8L376.51 -28.8L376.51 -31.49Q376.51 -34.85 374.4 -37.01Q372.29 -39.17 367.68 -39.17Q363.17 -39.17 360.96 -37.1Q358.75 -35.04 358.08 -31.78L346.94 -35.52Q348.1 -39.17 350.64 -42.19Q353.18 -45.22 357.46 -47.09Q361.73 -48.96 367.87 -48.96Q377.28 -48.96 382.75 -44.26Q388.22 -39.55 388.22 -30.62L388.22 -12.86Q388.22 -9.98 390.91 -9.98L394.75 -9.98L394.75 0L386.69 0Q383.14 0 380.83 -1.73Q378.53 -3.46 378.53 -6.34L378.53 -6.43L376.7 -6.43Q376.32 -5.28 374.98 -3.41Q373.63 -1.54 370.75 -0.1Q367.87 1.34 362.88 1.34ZM364.99 -8.45Q370.08 -8.45 373.3 -11.28Q376.51 -14.11 376.51 -18.82L376.51 -19.78L364.32 -19.78Q360.96 -19.78 359.04 -18.34Q357.12 -16.9 357.12 -14.3Q357.12 -11.71 359.14 -10.08Q361.15 -8.45 364.99 -8.45Z\" fill=\"#F4F6FB\"/></g>\n</svg>\n"
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
