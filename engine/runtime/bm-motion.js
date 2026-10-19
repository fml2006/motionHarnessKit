/* bm-motion.js — helpers de motion de marca para escenas HyperFrames (motion-harness-kit)
   Requiere, en este orden: vendor/gsap.min.js, vendor/CustomEase.min.js, tokens.js (window.BRAND).
   Todo es determinista y seek-safe: solo fromTo / tweens con onUpdate calculado desde el progreso.

   API (todas devuelven lo que crean para poder encadenar):
     BM.vars(defaults)                     variables de la instancia (defaults + data-variable-values del host)
     BM.lines(el, text)                    arma líneas enmascaradas desde "línea 1|línea 2" → [span]
     BM.words(el, text, accentWord?)       arma palabras → [span]; marca la palabra de acento
     BM.revealLines(tl, spans, at)         reveal por línea según BRAND.look.textReveal (mask | fade | rise | blur)
     BM.revealWords(tl, spans, at)         reveal por palabra (mismo look)
     BM.accentIn(tl, els, at)              anima el acento según BRAND.look.accentStyle (color | underline | highlight | italic)
     BM.decoIn(tl, el, at)                 entrada de la decoración del kicker (.bm-kicker-deco) según BRAND.look.kicker
     BM.fadeUp(tl, targets, at, opts)      entrada sobria (opacidad + desplazamiento corto)
     BM.exit(tl, targets, at, mode)        salida: "fade" | "up" | "none"
     BM.countUp(tl, el, to, at, opts)      conteo numérico (from, decimals, prefix, suffix, locale, dur)
     BM.typeText(tl, el, text, at, cps)    tipeo carácter a carácter (para terminal / prompts)
     BM.drawLine(tl, el, at, axis)         dibuja una línea/conector (scaleX o scaleY desde 0)
     BM.highlightCode(code, lang)          HTML con spans de sintaxis (keyword/string/number/comment/fn)
     BM.esc(text)                          escapa HTML
     BM.PLACEHOLDER                        marca visible de dato faltante (⟦—⟧)
*/
(function () {
  "use strict";
  var B = window.BRAND;
  if (!B) throw new Error("bm-motion.js: falta window.BRAND (cargá brand/tokens.js antes)");
  // el look de la marca decide CÓMO entra el texto, cómo se ve el acento y la decoración del kicker
  var LOOK = B.look || { textReveal: "mask", accentStyle: "color", kicker: "line" };

  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // IMPORTANTE: pasá el __hyperframes de la escena (BM.vars(defaults, window.__hyperframes) dentro del <script>
  // del bloque). El runtime lo inyecta con scope por instancia; el de este archivo global es el de la raíz.
  function vars(defaults, hf) {
    var api = hf || window.__hyperframes;
    var v = api && api.getVariables ? api.getVariables() || {} : {};
    var out = {};
    Object.keys(defaults || {}).forEach(function (k) {
      out[k] = v[k] === undefined || v[k] === null || v[k] === "" ? defaults[k] : v[k];
    });
    Object.keys(v || {}).forEach(function (k) {
      if (out[k] === undefined) out[k] = v[k];
    });
    return out;
  }

  function lines(el, text) {
    el.innerHTML = "";
    return String(text)
      .split("|")
      .map(function (s) { return s.trim(); })
      .filter(Boolean)
      .map(function (s) {
        var line = document.createElement("span");
        line.className = "bm-line";
        var inner = document.createElement("span");
        inner.innerHTML = accentMarkup(s);
        line.appendChild(inner);
        el.appendChild(line);
        return inner;
      });
  }

  // *texto* entre asteriscos = momento de acento (máx. 1 por frame según la marca)
  function accentMarkup(s) {
    // el texto plano va en su propio span: así cada tramo se mide contra SU fondo (el acento resaltado tiene el suyo)
    return String(s)
      .split(/(\*[^*]+\*)/)
      .filter(function (part) { return part !== ""; })
      .map(function (part) {
        var m = part.match(/^\*([^*]+)\*$/);
        return m ? '<em class="bm-accent">' + esc(m[1]) + "</em>" : '<span class="bm-plain">' + esc(part) + "</span>";
      })
      .join("");
  }

  function words(el, text, accentWord) {
    el.innerHTML = "";
    var acc = accentWord ? String(accentWord).toLowerCase().replace(/[^\p{L}\p{N}]/gu, "") : "";
    var out = [];
    var inAcc = false; // soporta acentos de varias palabras: *no ve*
    String(text)
      .split(/\s+/)
      .filter(Boolean)
      .forEach(function (w, i, arr) {
        var opens = /^\*/.test(w);
        var closes = /\*[.,;:!?…]*$/.test(w);
        var multi = inAcc || (opens && !closes);
        if (opens && !closes) inAcc = true;
        if (inAcc && closes) inAcc = false;
        var s = document.createElement("span");
        s.className = "bm-word";
        var m = w.match(/^\*?(.*?)\*?([.,;:!?…]*)$/);
        var core = m ? m[1] : w;
        var punct = m ? m[2] : "";
        var isAcc = multi || (acc && core.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "") === acc) || /^\*.*\*[.,;:!?…]*$/.test(w);
        var tail = punct + (i < arr.length - 1 ? " " : "");
        if (isAcc) {
          // la palabra lleva el acento; la puntuación queda en color de texto
          var a = document.createElement("span");
          a.className = "bm-accent bm-accent-word";
          a.style.display = "inline-block";
          a.textContent = core;
          s.appendChild(a);
          s.appendChild(document.createTextNode(tail));
          s.classList.add("has-accent");
        } else {
          s.textContent = core + tail;
        }
        el.appendChild(s);
        out.push(s);
      });
    return out;
  }

  // true si no hay nada que animar (evita warnings "GSAP target not found")
  function empty(t) {
    if (!t) return true;
    if (typeof t.length === "number" && typeof t !== "string") return t.length === 0;
    return false;
  }

  // estados de entrada por look (el "to" siempre vuelve a opacidad 1 y posición 0)
  function revealFrom(mode, kind) {
    if (mode === "fade") return { opacity: 0 };
    if (mode === "rise") return { opacity: 0, yPercent: kind === "words" ? 70 : 55 };
    if (mode === "blur") return { opacity: 0, yPercent: 10, filter: "blur(0.28em)" };
    return kind === "words" ? { opacity: 0, yPercent: 35 } : { yPercent: 110 }; // mask
  }
  function revealTo(mode, kind) {
    if (mode === "fade") return { opacity: 1 };
    if (mode === "blur") return { opacity: 1, yPercent: 0, filter: "blur(0em)" };
    if (mode === "rise") return { opacity: 1, yPercent: 0 };
    return kind === "words" ? { opacity: 1, yPercent: 0 } : { yPercent: 0 };
  }
  function revealDur(mode, kind) {
    var base = kind === "words" ? B.dur("short") * 1.6 : B.dur("enter") * 1.3;
    return mode === "fade" ? base * 1.35 : mode === "blur" ? base * 1.15 : base;
  }
  function revealEase(mode, kind) {
    if (mode === "fade") return "standard";
    if (mode === "blur") return "enter";
    return kind === "words" && mode === "mask" ? "enter" : "emphasized";
  }

  function revealLines(tl, spans, at, opts) {
    if (empty(spans)) return tl;
    opts = opts || {};
    var mode = opts.mode || LOOK.textReveal || "mask";
    var d = opts.duration || revealDur(mode, "lines");
    var st = opts.stagger != null ? opts.stagger : B.stagger("lines") * (mode === "fade" ? 1.4 : 1);
    var to = revealTo(mode, "lines");
    to.duration = d;
    to.ease = B.ease(opts.ease || revealEase(mode, "lines"));
    to.stagger = st;
    tl.fromTo(spans, revealFrom(mode, "lines"), to, at);
    // el acento con forma (subrayado / resaltado) se dibuja cuando su línea ya llegó
    if (opts.accent !== false && (LOOK.accentStyle === "underline" || LOOK.accentStyle === "highlight")) {
      Array.prototype.forEach.call(spans, function (sp, i) {
        var acc = sp.querySelectorAll ? sp.querySelectorAll(".bm-accent") : [];
        if (acc.length) accentIn(tl, acc, at + i * st + d * 0.7);
      });
    }
    return tl;
  }

  function revealWords(tl, spans, at, opts) {
    if (empty(spans)) return tl;
    opts = opts || {};
    var mode = opts.mode || LOOK.textReveal || "mask";
    var to = revealTo(mode, "words");
    to.duration = opts.duration || revealDur(mode, "words");
    to.ease = B.ease(opts.ease || revealEase(mode, "words"));
    to.stagger = opts.stagger != null ? opts.stagger : B.stagger("words");
    tl.fromTo(spans, revealFrom(mode, "words"), to, at);
    return tl;
  }

  // acento según la marca: color (vira al acento), underline (se dibuja la línea), highlight (se pinta la banda),
  // italic (la itálica ya está; vira al color de acento). Seek-safe: todo fromTo.
  function accentIn(tl, els, at, opts) {
    if (empty(els)) return tl;
    opts = opts || {};
    var style = opts.style || LOOK.accentStyle || "color";
    var d = opts.duration || (style === "color" || style === "italic" ? B.dur("short") : B.dur("enter"));
    if (style === "underline") {
      tl.fromTo(els, { backgroundSize: "0% 0.1em" }, { backgroundSize: "100% 0.1em", duration: d, ease: B.ease("emphasized") }, at);
    } else if (style === "highlight") {
      // la banda barre (background-image) y al llegar queda como background-color: el estado final es inequívoco
      // para el chequeo de contraste (que no lee gradientes) y para cualquier lector
      tl.fromTo(els, { backgroundSize: "0% 100%", backgroundColor: "rgba(0,0,0,0)", color: B.color("text") }, { backgroundSize: "100% 100%", color: B.color("onAccent") || B.color("background"), duration: d, ease: B.ease("emphasized") }, at);
      tl.set(els, { backgroundColor: B.color("accent") }, at + d);
    } else {
      tl.fromTo(els, { color: B.color("text") }, { color: B.color("accent"), duration: d, ease: B.ease("standard") }, at);
    }
    return tl;
  }

  // decoración del kicker: línea que se dibuja, punto que aparece, o nada
  function decoIn(tl, el, at, opts) {
    if (empty(el) || LOOK.kicker === "none") return tl;
    opts = opts || {};
    if (LOOK.kicker === "dot") tl.fromTo(el, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: opts.duration || B.dur("short"), ease: B.ease("enter") }, at);
    else drawLine(tl, el, at, "x", { duration: opts.duration || B.dur("enter") });
    return tl;
  }

  function fadeUp(tl, targets, at, opts) {
    if (empty(targets)) return tl;
    opts = opts || {};
    // la distancia también es del look: fundido casi sin desplazamiento, "rise" con más recorrido
    var k = LOOK.textReveal === "fade" ? 0.3 : LOOK.textReveal === "rise" ? 1.5 : 1;
    tl.fromTo(
      targets,
      { opacity: 0, yPercent: (opts.yPercent != null ? opts.yPercent : 20) * k },
      { opacity: 1, yPercent: 0, duration: opts.duration || B.dur("enter") * (LOOK.textReveal === "fade" ? 1.25 : 1), ease: B.ease(opts.ease || "enter"), stagger: opts.stagger || 0 },
      at
    );
    return tl;
  }

  function exit(tl, targets, at, mode) {
    if (!mode || mode === "none" || empty(targets)) return tl;
    var d = B.dur("exit");
    if (mode === "up") {
      tl.to(targets, { opacity: 0, yPercent: -12, duration: d, ease: B.ease("exit"), stagger: 0.03 }, at);
    } else {
      tl.to(targets, { opacity: 0, duration: d, ease: B.ease("exit") }, at);
    }
    return tl;
  }

  function fmt(n, decimals, locale) {
    return Number(n).toLocaleString(locale || "es-AR", { minimumFractionDigits: decimals || 0, maximumFractionDigits: decimals || 0 });
  }

  // Los conteos tweenean un atributo del propio nodo (no un objeto JS): el runtime de HyperFrames
  // filtra los targets de GSAP al subárbol de la escena y descarta objetos planos.
  function countUp(tl, el, to, at, opts) {
    opts = opts || {};
    var from = Number(opts.from || 0);
    var render = function () {
      var n = parseFloat(el.getAttribute("data-bm-n"));
      el.textContent = (opts.prefix || "") + fmt(isFinite(n) ? n : from, opts.decimals, opts.locale) + (opts.suffix || "");
    };
    el.setAttribute("data-bm-n", from);
    render();
    tl.fromTo(el, { attr: { "data-bm-n": from } }, { attr: { "data-bm-n": Number(to) }, duration: opts.duration || B.dur("long") * 1.2, ease: B.ease(opts.ease || "standard"), onUpdate: render }, at);
    return tl;
  }

  function typeText(tl, el, text, at, cps) {
    var str = String(text);
    var render = function () {
      var n = parseFloat(el.getAttribute("data-bm-n")) || 0;
      el.textContent = str.slice(0, Math.round(n));
    };
    el.setAttribute("data-bm-n", 0);
    render();
    tl.fromTo(el, { attr: { "data-bm-n": 0 } }, { attr: { "data-bm-n": str.length }, duration: str.length / (cps || 28), ease: "none", onUpdate: render }, at);
    return tl;
  }

  function drawLine(tl, el, at, axis, opts) {
    if (empty(el)) return tl;
    opts = opts || {};
    var from = axis === "y" ? { scaleY: 0 } : { scaleX: 0 };
    var to = axis === "y" ? { scaleY: 1 } : { scaleX: 1 };
    to.duration = opts.duration || B.dur("emphasis");
    to.ease = B.ease(opts.ease || "standard");
    tl.fromTo(el, from, to, at);
    return tl;
  }

  var KW = /\b(const|let|var|function|return|import|from|export|default|async|await|if|else|for|while|class|new|def|lambda|print|try|catch|except|raise|throw|yield|in|of|as|with|type|interface|extends|implements|public|private|fn|pub|use|mut|match|SELECT|FROM|WHERE|JOIN|GROUP|BY|ORDER|LIMIT)\b/;
  function highlightCode(code) {
    var re = /(\/\/[^\n]*|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*(?=\())|(\b[A-Za-z_]\w*\b)/g;
    var out = "";
    var last = 0;
    var m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += '<span class="tok-comment">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="tok-string">' + esc(m[2]) + "</span>";
      else if (m[3]) out += '<span class="tok-number">' + esc(m[3]) + "</span>";
      else if (m[4]) out += KW.test(m[4]) ? '<span class="tok-keyword">' + esc(m[4]) + "</span>" : '<span class="tok-fn">' + esc(m[4]) + "</span>";
      else if (m[5]) out += KW.test(m[5]) ? '<span class="tok-keyword">' + esc(m[5]) + "</span>" : esc(m[5]);
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  // lo que se ve cuando falta un dato obligatorio (build:roots --strict no deja renderizar el final así)
  var PLACEHOLDER = "\u27E6—\u27E7";

  window.BM = {
    PLACEHOLDER: PLACEHOLDER,
    look: LOOK,
    vars: vars, lines: lines, words: words, revealLines: revealLines, revealWords: revealWords, accentIn: accentIn, decoIn: decoIn,
    fadeUp: fadeUp, exit: exit, empty: empty, countUp: countUp, typeText: typeText, drawLine: drawLine,
    highlightCode: highlightCode, esc: esc, fmt: fmt, accentMarkup: accentMarkup,
  };
})();
