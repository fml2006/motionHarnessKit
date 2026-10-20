// CyberGoat3D — theme para Remotion (GENERADO por scripts/brand-apply.mjs)
import { Easing } from "remotion";

export const brand = {
  "colors": {
    "background": "#FFFFFF",
    "surface": "#F2F2F2",
    "surfaceAlt": "#E8E8E8",
    "border": "#E0E0E0",
    "text": "#1A1A1A",
    "textMuted": "#5C5C5C",
    "primary": "#1A1A1A",
    "secondary": "#8E0505",
    "accent": "#BE0707",
    "danger": "#9E0000",
    "success": "#2E7D32",
    "onPrimary": "#FFFFFF",
    "code": {
      "background": "#1A1A1A",
      "text": "#F2F2F2",
      "comment": "#A6A6A6",
      "keyword": "#FF7A7A",
      "string": "#F5C2C2",
      "number": "#FFB3B3",
      "function": "#FFFFFF"
    },
    "dataViz": [
      "#BE0707",
      "#1A1A1A",
      "#6B6B6B",
      "#D9534F",
      "#8E0505",
      "#7A7A7A"
    ],
    "gradients": {
      "hero": [
        "#BE0707",
        "#8E0505"
      ]
    },
    "rules": {
      "maxAccentMomentsPerFrame": 1,
      "notes": "Rojo solo para la palabra o el dato clave (como CYBER y 3D en el logo). Negro para estructura. Fondo blanco: el producto es el protagonista."
    },
    "onAccent": "#FFFFFF"
  },
  "fonts": {
    "display": "Luckiest Guy",
    "body": "Nunito",
    "mono": "JetBrains Mono"
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
      "Movimiento continuo detrás de texto que se está leyendo",
      "Glitch o distorsiones digitales",
      "Partículas, neón o lens flares",
      "Girar el logo"
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
  "typeScale": {
    "unit": "cqmin",
    "comment": "Tamaños en % del lado corto del frame (1cqmin = 10.8px en 1080p). Funciona igual en 16:9, 9:16 y 1:1.",
    "hero": 12,
    "h1": 8.4,
    "h2": 6,
    "h3": 4.6,
    "body": 3.7,
    "caption": 3.3,
    "label": 2.6,
    "code": 3,
    "portraitMultiplier": 1.1,
    "feedMultiplier": 1.1
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
