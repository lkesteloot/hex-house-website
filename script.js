/* ==========================================================================
   Hex House — the living honeycomb behind everything.
   A grid of hexagons that twinkles, follows the cursor, and ripples when hexed.
   ========================================================================== */

(function () {
  "use strict";

  var canvas = document.getElementById("grid");
  var ctx = canvas.getContext("2d");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var R = 30;                 // hexagon radius (flat-top)
  var cells = [];
  var W = 0, H = 0;

  var pointer = { x: -9999, y: -9999, on: false };
  var ripples = [];           // { x, y, t0, hue }

  var DEFAULT_TINT = [168, 85, 247];
  var tint = DEFAULT_TINT.slice();
  var target = DEFAULT_TINT.slice();

  /* --- geometry ----------------------------------------------------------- */

  function build() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    R = W < 700 ? 24 : 32;

    var dx = R * 1.5;
    var dy = R * Math.sqrt(3);
    cells = [];

    for (var c = -1; c * dx < W + R; c++) {
      for (var r = -1; r * dy < H + dy; r++) {
        cells.push({
          x: c * dx,
          y: r * dy + (c & 1 ? dy / 2 : 0),
          // deterministic per-cell phase, so the twinkle never repeats visibly
          seed: fract(Math.sin(c * 12.9898 + r * 78.233) * 43758.5453)
        });
      }
    }
  }

  function fract(n) { return n - Math.floor(n); }

  function hexPath(x, y, r) {
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var a = (Math.PI / 3) * i;
      var px = x + r * Math.cos(a);
      var py = y + r * Math.sin(a);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  /* --- painting ----------------------------------------------------------- */

  function draw(now) {
    var t = now / 1000;
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;

    // ease the tint toward whatever the page is currently emphasizing
    for (var k = 0; k < 3; k++) tint[k] += (target[k] - tint[k]) * 0.06;
    var rgb = Math.round(tint[0]) + "," + Math.round(tint[1]) + "," + Math.round(tint[2]);

    var reach = 190;

    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var b = 0;

      // slow, sparse twinkle
      if (!reduced) {
        var s = Math.sin(t * 0.45 + cell.seed * Math.PI * 2);
        b += Math.pow(Math.max(0, s), 22) * 0.85;
      } else {
        b += cell.seed * 0.12;
      }

      // cursor glow
      if (pointer.on) {
        var ddx = cell.x - pointer.x, ddy = cell.y - pointer.y;
        var d = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d < reach) b += Math.pow(1 - d / reach, 2) * 0.9;
      }

      // expanding rings from every hex cast
      for (var j = 0; j < ripples.length; j++) {
        var rp = ripples[j];
        var age = t - rp.t0;
        var rad = age * 520;
        var dist = Math.hypot(cell.x - rp.x, cell.y - rp.y);
        var band = Math.abs(dist - rad);
        if (band < 80) {
          b += (1 - band / 80) * Math.max(0, 1 - age / 2.4) * 1.15;
        }
      }

      if (b <= 0.002) {
        ctx.strokeStyle = "rgba(" + rgb + ",0.05)";
        hexPath(cell.x, cell.y, R - 1.5);
        ctx.stroke();
        continue;
      }

      b = Math.min(b, 1.35);
      hexPath(cell.x, cell.y, R - 1.5);
      ctx.fillStyle = "rgba(" + rgb + "," + (b * 0.13).toFixed(3) + ")";
      ctx.fill();
      ctx.strokeStyle = "rgba(" + rgb + "," + (0.05 + b * 0.6).toFixed(3) + ")";
      ctx.stroke();
    }

    // retire finished ripples
    for (var m = ripples.length - 1; m >= 0; m--) {
      if (t - ripples[m].t0 > 2.6) ripples.splice(m, 1);
    }
  }

  function frame(now) {
    draw(now);
    requestAnimationFrame(frame);
  }

  /* --- interaction -------------------------------------------------------- */

  function cast(x, y) {
    if (ripples.length > 12) ripples.shift();
    ripples.push({ x: x, y: y, t0: performance.now() / 1000 });
    if (reduced) draw(performance.now());
  }

  window.addEventListener("resize", function () {
    build();
    if (reduced) draw(performance.now());
  });

  window.addEventListener("pointermove", function (e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.on = e.pointerType === "mouse";
  });

  window.addEventListener("pointerleave", function () { pointer.on = false; });

  window.addEventListener("pointerdown", function (e) { cast(e.clientX, e.clientY); });

  // the sigil: a deliberate hex, cast from the center of the mark
  var sigil = document.getElementById("sigil");
  var hint = document.getElementById("hint");
  var spins = 0;

  sigil.addEventListener("click", function () {
    var box = sigil.getBoundingClientRect();
    cast(box.left + box.width / 2, box.top + box.height / 2);
    spins += 60;
    sigil.style.transform = "rotate(" + spins + "deg)";
    if (hint) hint.style.opacity = "0";
  });

  // residents tint the whole grid while you consider them
  Array.prototype.forEach.call(document.querySelectorAll(".cell"), function (cell) {
    var rgb = hexToRgb(cell.dataset.color);
    cell.addEventListener("pointerenter", function () { target = rgb; });
    cell.addEventListener("pointerleave", function () { target = DEFAULT_TINT.slice(); });
  });

  function hexToRgb(h) {
    var n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  /* --- the address, in two bases ------------------------------------------ */

  var nums = document.querySelectorAll(".addr-num");

  function flip(on) {
    Array.prototype.forEach.call(nums, function (el) {
      el.textContent = on ? el.dataset.hex : el.dataset.dec;
      el.classList.toggle("flip", on);
    });
  }

  Array.prototype.forEach.call(nums, function (el) {
    el.addEventListener("pointerenter", function () { flip(true); });
    el.addEventListener("pointerleave", function () { flip(false); });
  });

  // show the trick once, unprompted, then put it back
  setTimeout(function () {
    flip(true);
    setTimeout(function () { flip(false); }, 2200);
  }, 2600);

  /* --- easter egg: type 666 ----------------------------------------------- */

  var buffer = "";
  window.addEventListener("keydown", function (e) {
    if (e.key.length !== 1) return;
    buffer = (buffer + e.key).slice(-3);
    if (buffer !== "666") return;
    buffer = "";
    target = [239, 68, 68];
    for (var i = 0; i < 6; i++) {
      (function (n) {
        setTimeout(function () {
          cast(window.innerWidth / 2, window.innerHeight * 0.28);
        }, n * 260);
      })(i);
    }
    setTimeout(function () { target = DEFAULT_TINT.slice(); }, 4200);
  });

  /* --- go ----------------------------------------------------------------- */

  build();
  if (reduced) draw(performance.now());
  else requestAnimationFrame(frame);
})();
