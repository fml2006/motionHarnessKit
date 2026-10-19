/* bm-motion.js — helpers de motion de marca para escenas HyperFrames (motion-harness-kit)
   Requiere, en este orden: vendor/gsap.min.js, vendor/CustomEase.min.js, tokens.js (window.BRAND).
   Todo es determinista y seek-safe: solo fromTo / tweens con onUpdate calculado desde el progreso.

   API (todas devuelven lo que crean para poder encadenar):
     BM.vars(defaults)                     variables de la instancia (defaults + data-variable-values del host)
     BM.lines(el, text)                    arma líneas enmascaradas desde "línea 1|línea 2" → [span]
     BM.words(el, text, accentWord?)       arma palabras → [span]; marca la palabra de acento
     BM.revealLines(tl, spans, at)         reveal por línea desde abajo (máscara)
     BM.revealWords(tl, spans, at)         reveal por palabra
     BM.fadeUp(tl, targets, at, opts)      entrada sobria (opacidad + desplazamiento corto)
     BM.exit(tl, targets, at, mode)        salida: "fade" | "up" | "none"
     BM.countUp(tl, el, to, at, opts)      conteo numérico (from, decimals, prefix, suffix, locale, dur)
     BM.typeText(tl, el, text, at, cps)    tipeo carácter a carácter (para terminal / prompts)
     BM.drawLine(tl, el, at, axis)         dibuja una línea/conector (scaleX o scaleY desde 0)
     BM.highlightCode(code, lang)          HTML con spans de sintaxis (keyword/string/number/comment/fn)
     BM.esc(text)                          escapa HTML
*/
(function () {
  "use strict";
  var B = window.BRAND;
  if (!B) throw new Error("bm-motion.js: falta window.BRAND (cargá brand/tokens.js antes)");

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
    return esc(s).replace(/\*([^*]+)\*/g, '<em class="bm-accent" style="font-style:normal">$1</em>');
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

  function revealLines(tl, spans, at, opts) {
    if (empty(spans)) return tl;
    opts = opts || {};
    tl.fromTo(
      spans,
      { yPercent: 110 },
      { yPercent: 0, duration: opts.duration || B.dur("enter") * 1.3, ease: B.ease(opts.ease || "emphasized"), stagger: opts.stagger != null ? opts.stagger : B.stagger("lines") },
      at
    );
    return tl;
  }

  function revealWords(tl, spans, at, opts) {
    if (empty(spans)) return tl;
    opts = opts || {};
    tl.fromTo(
      spans,
      { opacity: 0, yPercent: 35 },
      { opacity: 1, yPercent: 0, duration: opts.duration || B.dur("short") * 1.6, ease: B.ease(opts.ease || "enter"), stagger: opts.stagger != null ? opts.stagger : B.stagger("words") },
      at
    );
    return tl;
  }

  function fadeUp(tl, targets, at, opts) {
    if (empty(targets)) return tl;
    opts = opts || {};
    tl.fromTo(
      targets,
      { opacity: 0, yPercent: opts.yPercent != null ? opts.yPercent : 20 },
      { opacity: 1, yPercent: 0, duration: opts.duration || B.dur("enter"), ease: B.ease(opts.ease || "enter"), stagger: opts.stagger || 0 },
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

  window.BM = {
    vars: vars, lines: lines, words: words, revealLines: revealLines, revealWords: revealWords,
    fadeUp: fadeUp, exit: exit, empty: empty, countUp: countUp, typeText: typeText, drawLine: drawLine,
    highlightCode: highlightCode, esc: esc, fmt: fmt, accentMarkup: accentMarkup,
  };
})();
