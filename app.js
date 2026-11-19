/* CipherON site: small, dependency-free 3D interactions. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- reveal on scroll ---------- */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- counters ---------- */
  var counters = $$('.fact b');
  function runCounter(el) {
    var end = +el.getAttribute('data-n'), suf = el.getAttribute('data-suf') || '';
    if (reduce || end === 0) { el.textContent = end + suf; return; }
    var t0 = null;
    (function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / 1100);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  } else { counters.forEach(runCounter); }

  /* ---------- tilt cards and figures ---------- */
  $$('[data-tilt]').forEach(function (el) {
    if (reduce) return;
    var target = el.classList.contains('card') ? el : ($('.phone', el) || el);
    el.addEventListener('pointermove', function (e) {
      var b = el.getBoundingClientRect();
      var x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
      target.style.transform = 'rotateY(' + (x * 22) + 'deg) rotateX(' + (y * -18) + 'deg) translateZ(14px)';
    });
    el.addEventListener('pointerleave', function () { target.style.transform = ''; });
  });

  /* ---------- security layers ---------- */
  var layers = $$('.layer'), lis = $$('#slist li');
  function light(i) {
    layers.forEach(function (l) { l.classList.toggle('on', +l.getAttribute('data-i') === i); });
    lis.forEach(function (l) { l.classList.toggle('on', +l.getAttribute('data-i') === i); });
  }
  layers.concat(lis).forEach(function (l) {
    var i = +l.getAttribute('data-i');
    l.addEventListener('pointerenter', function () { light(i); });
    l.addEventListener('click', function () { light(i); });
  });
  var ls = $('#lstack');
  if (ls && !reduce) {
    var box = ls.parentNode;
    box.addEventListener('pointermove', function (e) {
      var b = box.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
      ls.style.transform = 'rotateX(' + (58 + y * -14) + 'deg) rotateZ(' + (-34 + x * 24) + 'deg)';
    });
    box.addEventListener('pointerleave', function () { ls.style.transform = ''; });
  }

  /* ---------- colour designs: recolour the whole page ---------- */
  var sw = $$('#sw button'), root = document.documentElement;
  function hexToRgba(h, a) { var v = parseInt(h.slice(1), 16); return 'rgba(' + (v >> 16) + ',' + ((v >> 8) & 255) + ',' + (v & 255) + ',' + a + ')'; }
  function setTheme(a, o, i, silent) {
    root.style.setProperty('--accent', a);
    root.style.setProperty('--on-accent', o);
    root.style.setProperty('--glow', hexToRgba(a, 0.35));
    sw.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    if (!silent) { try { localStorage.setItem('cipheron-theme', String(i)); } catch (e) { /* storage may be blocked */ } }
  }
  sw.forEach(function (b, i) {
    b.addEventListener('click', function () { setTheme(b.getAttribute('data-a'), b.getAttribute('data-o'), i); });
  });
  try {
    var saved = localStorage.getItem('cipheron-theme');
    if (saved !== null && sw[+saved]) { var sb = sw[+saved]; setTheme(sb.getAttribute('data-a'), sb.getAttribute('data-o'), +saved, true); }
  } catch (e) { /* ignore */ }
})();
