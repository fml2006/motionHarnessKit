// Pulso — theme para Remotion (GENERADO por scripts/brand-apply.mjs)
import { Easing } from "remotion";

export const brand = {
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
  "typeScale": {
    "unit": "cqmin",
    "comment": "Pulso ya parte de una escala grande y sus titulares van en MAYÚSCULAS (más anchas): no se agranda en 9:16 ni en 4:5.",
    "hero": 15,
    "h1": 10.5,
    "h2": 7.2,
    "h3": 5,
    "body": 3.9,
    "caption": 3.4,
    "label": 2.6,
    "code": 3,
    "portraitMultiplier": 1,
    "feedMultiplier": 1
  }
} as const;

/** Easing de marca como función de Remotion: interpolate(frame, [0, 20], [0, 1], { easing: ease("enter") }) */
export const ease = (name: keyof typeof brand.motion.easings) => {
  const [a, b, c, d] = brand.motion.easings[name];
  return Easing.bezier(a, b, c, d);
};
/** Duración de marca en frames */
export const durFrames = (name: keyof typeof brand.motion.durations, fps = 30) =>
  Math.round((brand.motion.durations[name] / 1000) * fps);
/** Tamaño tipográfico en px para un frame dado (escala en cqmin) */
export const fontPx = (name: keyof typeof brand.typeScale, width: number, height: number) =>
  ((brand.typeScale[name] as number) * Math.min(width, height)) / 100;
