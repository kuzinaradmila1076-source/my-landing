import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { shouldReveal, REVEAL_SELECTOR } from '../assets/js/reveal.js';

const cssDir = new URL('../assets/css/', import.meta.url);
const read = (name) => readFileSync(new URL(name, cssDir), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const motion = read('motion.css');

// Заголовки всех блоков { ... }, внутри которых лежит позиция index (от внешнего к внутреннему).
function enclosing(css, index) {
  const stack = [];
  let headStart = 0;
  for (let i = 0; i < index; i++) {
    const c = css[i];
    if (c === '{') {
      stack.push(css.slice(headStart, i).trim());
      headStart = i + 1;
    } else if (c === '}') {
      stack.pop();
      headStart = i + 1;
    } else if (c === ';') {
      headStart = i + 1;
    }
  }
  return stack;
}
const occurrences = (css, needle) => [...css.matchAll(new RegExp(needle, 'g'))].map((m) => m.index);

test('every animation-timeline lives inside @supports (animation-timeline: view())', () => {
  const found = occurrences(motion, 'animation-timeline');
  assert.ok(found.length > 0, 'scroll-driven animation is used');
  for (const i of found) {
    if (enclosing(motion, i).length === 0) continue; // само условие @supports, не объявление
    assert.ok(
      enclosing(motion, i).some((h) => h.startsWith('@supports') && h.includes('animation-timeline')),
      `animation-timeline at ${i} must be guarded`,
    );
  }
});

test('reduced motion switches off animations and transitions', () => {
  const m = motion.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?\n\})/);
  assert.ok(m, 'reduce block exists');
  assert.ok(m[1].includes('animation: none'));
  assert.ok(m[1].includes('transition: none'));
});

test('opacity: 0 appears only in keyframes or .js-reveal and only under no-preference', () => {
  for (const [name, css] of readdirSync(cssDir).map((n) => [n, read(n)])) {
    for (const i of occurrences(css, 'opacity:\\s*0\\s*[;}]')) {
      if (name !== 'motion.css') assert.fail(`${name} must not hide content with opacity: 0`);
      const chain = enclosing(css, i);
      assert.ok(chain.some((h) => h.includes('prefers-reduced-motion: no-preference')), `motion.css:${i} needs no-preference`);
      assert.ok(chain.some((h) => h.startsWith('@keyframes') || h.includes('.js-reveal')), `motion.css:${i} must be keyframes or .js-reveal`);
    }
  }
});

test('only transform, opacity and filter are animated', () => {
  const allowed = new Set(['transform', 'opacity', 'filter']);
  for (const m of motion.matchAll(/@keyframes[^{]+\{((?:[^{}]|\{[^{}]*\})*)\}/g)) {
    for (const d of m[1].matchAll(/([a-z-]+)\s*:[^;}]+/g)) {
      assert.ok(allowed.has(d[1]), `keyframes animate ${d[1]}`);
    }
  }
  for (const t of motion.matchAll(/transition:\s*([^;]+);/g)) {
    for (const part of t[1].replace(/!important/g, '').split(',')) {
      assert.ok(allowed.has(part.trim().split(/\s+/)[0]) || part.trim() === 'none', `transition ${part}`);
    }
  }
});

test('no loader and no custom cursor anywhere', () => {
  for (const n of readdirSync(cssDir)) {
    const css = read(n);
    assert.ok(!/loader|preloader/i.test(css), `${n} loader`);
    assert.ok(!/cursor:\s*none/.test(css), `${n} cursor`);
  }
});

test('the scroll-reveal selector list is exported and non-empty', () => {
  assert.ok(typeof REVEAL_SELECTOR === 'string' && REVEAL_SELECTOR.includes('.service-card'));
});

test('shouldReveal: only without scroll-timeline support, with motion allowed and an observer', () => {
  assert.equal(shouldReveal({ supportsTimeline: false, reducedMotion: false, hasObserver: true }), true);
  assert.equal(shouldReveal({ supportsTimeline: true, reducedMotion: false, hasObserver: true }), false);
  assert.equal(shouldReveal({ supportsTimeline: false, reducedMotion: true, hasObserver: true }), false);
  assert.equal(shouldReveal({ supportsTimeline: false, reducedMotion: false, hasObserver: false }), false);
});
