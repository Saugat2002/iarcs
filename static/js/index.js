document.addEventListener('DOMContentLoaded', function () {
  setupBibCopy();
  setupPriorAnimation();
});

// Copy BibTeX to clipboard. Falls back to selecting the text if the clipboard API is unavailable.
function setupBibCopy() {
  var btn = document.getElementById('copy-bib');
  var code = document.getElementById('bib-text');
  if (!btn || !code) return;

  btn.addEventListener('click', function () {
    var label = btn.querySelector('span');
    var done = function () {
      label.textContent = 'Copied';
      setTimeout(function () { label.textContent = 'Copy'; }, 1500);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(code.textContent).then(done);
    } else {
      var range = document.createRange();
      range.selectNodeContents(code);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  });
}

// Intuition animation: samples over a learned prior -> the prompt region appears ->
// iARCS moves the samples into the part of the prior that meets the prompt, still spread out.
// Schematic only; positions are random, not data.
function setupPriorAnimation() {
  var svg = document.getElementById('prior-anim');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var steps = document.querySelectorAll('.anim-steps li');
  var replay = document.getElementById('anim-replay');

  var PRIOR = { cx: 260, cy: 165, rx: 230, ry: 118 };
  var GOAL = { cx: 432, cy: 96, rx: 132, ry: 76 };

  function inside(e, x, y, s) {
    s = s || 1;
    var dx = (x - e.cx) / (e.rx * s), dy = (y - e.cy) / (e.ry * s);
    return dx * dx + dy * dy <= 1;
  }

  // Seeded RNG so the picture is the same on every load.
  var seed = 11;
  function rand() {
    seed = (seed + 0x6D2B79F5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function sample(n, ok, minDist) {
    var pts = [];
    for (var tries = 0; tries < 50000 && pts.length < n; tries++) {
      var x = rand() * 600, y = rand() * 300;
      if (!ok(x, y)) continue;
      var far = pts.every(function (p) { return (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y) > minDist * minDist; });
      if (far) pts.push([x, y]);
    }
    return pts;
  }

  // Base samples: spread over the prior, with only a few inside the prompt region.
  // (the few in-region samples go first so they survive trimming to the target count)
  var base = sample(3, function (x, y) {
    return inside(GOAL, x, y, 0.8) && inside(PRIOR, x, y, 0.9);
  }, 30).concat(sample(41, function (x, y) {
    return inside(PRIOR, x, y, 0.93) && !inside(GOAL, x, y, 1.05);
  }, 22));
  // iARCS targets: spread over the part of the prior that meets the prompt.
  var targets = sample(base.length, function (x, y) {
    return inside(GOAL, x, y, 0.92) && inside(PRIOR, x, y, 0.95);
  }, 15);
  var n = Math.min(base.length, targets.length);

  // Greedy nearest assignment keeps the motion short and tidy.
  var used = [];
  var pairs = base.slice(0, n).map(function (p) {
    var best = -1, bd = Infinity;
    targets.slice(0, n).forEach(function (t, j) {
      if (used[j]) return;
      var d = (t[0] - p[0]) * (t[0] - p[0]) + (t[1] - p[1]) * (t[1] - p[1]);
      if (d < bd) { bd = d; best = j; }
    });
    used[best] = true;
    return { from: p, to: targets[best], hit: inside(GOAL, p[0], p[1]) };
  });

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  svg.appendChild(el('ellipse', { cx: PRIOR.cx, cy: PRIOR.cy, rx: PRIOR.rx, ry: PRIOR.ry, 'class': 'd-prior a-prior' }));
  svg.appendChild(el('ellipse', { cx: GOAL.cx, cy: GOAL.cy, rx: GOAL.rx, ry: GOAL.ry, 'class': 'd-goal a-goal' }));
  var dots = pairs.map(function (pr, i) {
    var c = el('circle', { cx: pr.from[0].toFixed(1), cy: pr.from[1].toFixed(1), r: 6, 'class': 'a-dot' + (pr.hit ? ' a-hit' : '') });
    c.style.transitionDelay = (i * 18) + 'ms';
    svg.appendChild(c);
    return c;
  });

  function setStep(k) {
    svg.setAttribute('class', 'anim s' + k);
    steps.forEach(function (li, j) { li.classList.toggle('active', j <= k); });
    dots.forEach(function (c, i) {
      var pr = pairs[i];
      c.style.transform = k >= 2
        ? 'translate(' + (pr.to[0] - pr.from[0]).toFixed(1) + 'px,' + (pr.to[1] - pr.from[1]).toFixed(1) + 'px)'
        : 'translate(0px,0px)';
    });
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    setStep(2);
    if (replay) replay.hidden = true;
    return;
  }

  var timers = [];
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function play() {
    clear();
    svg.setAttribute('class', 'anim pre');
    steps.forEach(function (li) { li.classList.remove('active'); });
    dots.forEach(function (c) { c.style.transform = 'translate(0px,0px)'; });
    timers.push(setTimeout(function () { setStep(0); }, 80));
    timers.push(setTimeout(function () { setStep(1); }, 2600));
    timers.push(setTimeout(function () { setStep(2); }, 5200));
    timers.push(setTimeout(play, 10500));
  }

  if (replay) replay.addEventListener('click', play);

  // Play only while visible.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) play(); else clear(); });
    }, { threshold: 0.35 }).observe(svg);
  } else {
    play();
  }
}
