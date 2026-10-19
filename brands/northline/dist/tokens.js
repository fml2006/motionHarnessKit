/* Northline — tokens JS para GSAP (GENERADO por scripts/brand-apply.mjs — no editar a mano)
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
  "name": "Northline",
  "slug": "northline",
  "version": "1.1.0",
  "colors": {
    "background": "#F6F1E8",
    "surface": "#ECE4D6",
    "surfaceAlt": "#E2D7C5",
    "border": "#CDBFA9",
    "text": "#1B1A17",
    "textMuted": "#5B554B",
    "primary": "#1F3A5F",
    "secondary": "#2F6B4F",
    "accent": "#B4532A",
    "danger": "#A33A2C",
    "success": "#2F6B4F",
    "onPrimary": "#F6F1E8",
    "code": {
      "background": "#1E2328",
      "text": "#EDE6D9",
      "comment": "#ABA59A",
      "keyword": "#E39A72",
      "string": "#9CC9A8",
      "number": "#E8C07A",
      "function": "#A9C1E8"
    },
    "dataViz": [
      "#1F3A5F",
      "#B4532A",
      "#2F6B4F",
      "#8A6D3B",
      "#6B4E71",
      "#7A7568"
    ],
    "gradients": {
      "hero": [
        "#1F3A5F",
        "#2F6B4F"
      ]
    },
    "rules": {
      "maxAccentMomentsPerFrame": 1,
      "notes": "Terracota solo para el dato o la palabra clave. Tinta azul para estructura."
    },
    "onAccent": "#F6F1E8"
  },
  "fonts": {
    "display": "Newsreader",
    "body": "IBM Plex Sans",
    "mono": "IBM Plex Mono"
  },
  "motion": {
    "personality": "balanced",
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
      "enter": 650,
      "exit": 420,
      "emphasis": 1000,
      "scene": 400,
      "long": 1500
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
      "words": 90,
      "lines": 160,
      "items": 80
    },
    "staggerGroupMaxMs": 600,
    "staggerComment": "Registro balanced: grupos algo más lentos que productive, pero nunca más de 600 ms.",
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
      "default": "crossfade",
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
  "look": {
    "background": "paper",
    "align": "center",
    "statementAlign": "center",
    "statementSize": "h1",
    "headlineCase": "none",
    "accentStyle": "italic",
    "textReveal": "fade",
    "kicker": "none",
    "cards": "outline",
    "density": "airy",
    "summary": "Editorial clara: papel con filete de página, composición centrada y simétrica, serif con acento en itálica terracota, texto que aparece por fundido lento."
  },
  "logo": {
    "primary": "logo/primary.svg",
    "mark": "logo/mark.svg",
    "onDark": "logo/onDark.svg",
    "onLight": "logo/onLight.svg",
    "svgMark": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 120 120\" width=\"120\" height=\"120\" role=\"img\" aria-label=\"Northline\">\n<g data-part=\"mark\"><circle cx=\"60\" cy=\"60\" r=\"56\" fill=\"#1F3A5F\"/><path d=\"M38 84 L60 30 L82 84\" fill=\"none\" stroke=\"#F6F1E8\" stroke-width=\"9\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"60\" cy=\"68\" r=\"7\" fill=\"#B4532A\"/></g>\n</svg>\n",
    "svgPrimary": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 581 120\" width=\"581\" height=\"120\" role=\"img\" aria-label=\"Northline\">\n<g transform=\"scale(1)\">\n<g data-part=\"mark\"><circle cx=\"60\" cy=\"60\" r=\"56\" fill=\"#1F3A5F\"/><path d=\"M38 84 L60 30 L82 84\" fill=\"none\" stroke=\"#F6F1E8\" stroke-width=\"9\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"60\" cy=\"68\" r=\"7\" fill=\"#B4532A\"/></g>\n</g>\n<g data-part=\"wordmark\" transform=\"translate(156 92.16)\"><path d=\"M11.38 -5.23L11.38 -58.9L3.36 -62.4L3.36 -64.9L25.82 -64.9L61.58 -13.63L58.32 -10.37L58.32 -59.66L50.21 -62.3L50.21 -64.9L71.9 -64.9L71.9 -62.3L64.46 -59.66L64.46 0.43L55.54 0.43L15.12 -58.03L17.52 -59.57L17.52 -5.23L25.63 -2.64L25.63 0L3.94 0L3.94 -2.64Z M99.22 -4.13Q102.24 -4.13 104.52 -5.69Q106.8 -7.25 108.07 -10.68Q109.34 -14.11 109.34 -19.68Q109.34 -25.92 108.12 -30.1Q106.9 -34.27 104.59 -36.41Q102.29 -38.54 98.93 -38.54Q95.86 -38.54 93.58 -36.98Q91.3 -35.42 90.02 -32.02Q88.75 -28.61 88.75 -22.99Q88.75 -16.8 89.98 -12.6Q91.2 -8.4 93.53 -6.26Q95.86 -4.13 99.22 -4.13ZM98.74 1.15Q91.82 1.15 86.81 -1.61Q81.79 -4.37 79.06 -9.34Q76.32 -14.3 76.32 -20.83Q76.32 -27.6 79.25 -32.78Q82.18 -37.97 87.36 -40.9Q92.54 -43.82 99.41 -43.82Q106.32 -43.82 111.34 -41.09Q116.35 -38.35 119.06 -33.41Q121.78 -28.46 121.78 -21.84Q121.78 -15.07 118.85 -9.89Q115.92 -4.7 110.74 -1.78Q105.55 1.15 98.74 1.15Z M159.89 -43.44Q162.77 -43.44 164.09 -41.88Q165.41 -40.32 165.41 -38.02Q165.41 -34.99 163.68 -33.36Q161.95 -31.73 159.7 -31.73Q157.87 -31.73 156.43 -32.09Q154.99 -32.45 153.62 -32.78Q152.26 -33.12 150.58 -33.12Q149.42 -33.12 148.27 -32.86Q147.12 -32.59 146.02 -32.09Q144.91 -31.58 143.9 -30.77L142.75 -33.02Q145.68 -35.86 148.1 -37.82Q150.53 -39.79 152.59 -41.04Q154.66 -42.29 156.43 -42.86Q158.21 -43.44 159.89 -43.44ZM145.97 -34.18L145.97 -4.9L153.07 -2.4L153.07 0L127.68 0L127.68 -2.4L134.21 -4.75L134.21 -32.16Q133.49 -33.02 132.48 -33.74Q131.47 -34.46 130.2 -35.18Q128.93 -35.9 127.39 -36.58L127.39 -38.4L142.85 -43.87L144.48 -43.87Z M186.14 -13.06Q186.14 -10.08 188.11 -8.54Q190.08 -7.01 193.92 -7.01Q195.74 -7.01 197.9 -7.39Q200.06 -7.78 202.56 -8.54L202.56 -5.38Q199.15 -2.98 196.42 -1.56Q193.68 -0.14 191.47 0.46Q189.26 1.06 187.3 1.06Q183.46 1.06 180.55 -0.24Q177.65 -1.54 176.02 -4.22Q174.38 -6.91 174.38 -10.99L174.38 -34.51L167.9 -39.02L167.9 -40.99Q169.3 -41.81 170.83 -42.77Q172.37 -43.73 173.98 -44.76Q175.58 -45.79 177.17 -46.9Q178.75 -48 180.29 -49.08Q181.82 -50.16 183.17 -51.22L186.14 -51.22L186.14 -41.42ZM181.39 -36.43L181.44 -42.67L201.07 -42.67L200.3 -36.43Z M234.34 -2.4L240.19 -4.51L240.19 -27.5Q240.19 -29.86 239.3 -31.44Q238.42 -33.02 236.62 -33.82Q234.82 -34.61 232.08 -34.61Q228.96 -34.61 226.22 -33.67Q223.49 -32.74 221.9 -31.3L220.18 -33.41Q223.39 -36.62 225.91 -38.69Q228.43 -40.75 230.54 -41.86Q232.66 -42.96 234.74 -43.39Q236.83 -43.82 239.18 -43.82Q245.71 -43.82 248.86 -39.98Q252 -36.14 252 -28.18L252 -4.75L258.58 -2.4L258.58 0L234.34 0ZM229.25 0L204.72 0L204.72 -2.4L211.2 -4.75L211.2 -56.93Q210.48 -57.74 209.4 -58.54Q208.32 -59.33 206.83 -60.17Q205.34 -61.01 203.47 -61.82L203.47 -64.08L222.05 -68.83L223.78 -68.83L222.96 -59.04L222.96 -4.7L229.25 -2.4Z M279.5 -4.75L286.03 -2.4L286.03 0L261.22 0L261.22 -2.4L267.7 -4.75L267.7 -56.93Q267.02 -57.74 265.92 -58.54Q264.82 -59.33 263.33 -60.17Q261.84 -61.01 259.97 -61.82L259.97 -64.08L278.54 -68.83L280.27 -68.83L279.5 -59.04Z M302.35 -54.62Q298.9 -54.62 296.83 -56.62Q294.77 -58.61 294.77 -61.78Q294.77 -64.85 296.83 -66.84Q298.9 -68.83 302.35 -68.83Q305.86 -68.83 307.92 -66.84Q309.98 -64.85 309.98 -61.78Q309.98 -58.61 307.92 -56.62Q305.86 -54.62 302.35 -54.62ZM309.12 -43.82L308.59 -33.89L308.59 -4.75L315.12 -2.4L315.12 0L290.3 0L290.3 -2.4L296.78 -4.75L296.78 -32.88Q296.21 -33.6 295.1 -34.39Q294 -35.18 292.68 -35.95Q291.36 -36.72 289.97 -37.34L289.97 -39.41L306.96 -43.82Z M337.68 -34.18L337.68 -4.51L343.54 -2.4L343.54 0L319.39 0L319.39 -2.4L325.92 -4.75L325.92 -32.16Q324.96 -33.36 323.38 -34.37Q321.79 -35.38 319.06 -36.58L319.06 -38.4L333.6 -43.87L335.23 -43.87ZM349.06 -2.4L354.91 -4.51L354.91 -27.5Q354.91 -29.86 354.02 -31.44Q353.14 -33.02 351.34 -33.82Q349.54 -34.61 346.8 -34.61Q343.68 -34.61 340.94 -33.67Q338.21 -32.74 336.62 -31.3L334.9 -33.41Q338.11 -36.62 340.61 -38.69Q343.1 -40.75 345.24 -41.86Q347.38 -42.96 349.46 -43.39Q351.55 -43.82 353.9 -43.82Q360.43 -43.82 363.58 -39.98Q366.72 -36.14 366.72 -28.18L366.72 -4.75L373.25 -2.4L373.25 0L349.06 0Z M398.93 -43.82Q404.64 -43.82 408.58 -41.47Q412.51 -39.12 414.72 -34.58Q416.93 -30.05 417.41 -23.52L386.06 -23.52L386.11 -27.84L410.78 -28.9L405.84 -26.5Q405.65 -30.62 404.76 -33.36Q403.87 -36.1 402.19 -37.46Q400.51 -38.83 398.02 -38.83Q395.28 -38.83 393.19 -37.34Q391.1 -35.86 389.95 -32.62Q388.8 -29.38 388.8 -24Q388.8 -18.62 390.7 -14.9Q392.59 -11.18 396.12 -9.29Q399.65 -7.39 404.5 -7.39Q406.66 -7.39 408.6 -7.78Q410.54 -8.16 412.42 -8.98Q414.29 -9.79 416.16 -11.04L417.41 -8.4Q414.58 -5.42 411.65 -3.29Q408.72 -1.15 405.55 0Q402.38 1.15 398.88 1.15Q392.5 1.15 387.7 -1.63Q382.9 -4.42 380.23 -9.36Q377.57 -14.3 377.57 -20.69Q377.57 -27.17 380.09 -32.42Q382.61 -37.68 387.38 -40.75Q392.16 -43.82 398.93 -43.82Z\" fill=\"#1B1A17\"/></g>\n</svg>\n"
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
