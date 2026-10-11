import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SERVICES, formatPrice, formatWeeks } from '../assets/js/pricing.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8').replace(/&nbsp;/g, ' ');

function card(id) {
  const m = html.match(new RegExp(`<article[^>]*data-service="${id}"[\\s\\S]*?</article>`));
  assert.ok(m, `card for ${id} should exist`);
  return m[0].replace(/<[^>]+>/g, ' ').replace(/[ \t\r\n]+/g, ' ');
}

test('formatPrice joins "от", a thousands-separated number and the ruble sign', () => {
  assert.equal(formatPrice(30000), 'от 30 000 ₽');
  assert.equal(formatPrice(15000), 'от 15 000 ₽');
});

test('there are exactly five service cards, one per service', () => {
  const ids = [...html.matchAll(/<article[^>]*data-service="(\w+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids.sort(), Object.keys(SERVICES).sort());
});

test('every card shows the title, pitch, price and term from pricing.js', () => {
  for (const s of Object.values(SERVICES)) {
    const text = card(s.id);
    assert.ok(text.includes(s.title), `${s.id} title`);
    assert.ok(text.includes(s.pitch), `${s.id} pitch`);
    assert.ok(text.includes(formatPrice(s.base)), `${s.id} price ${formatPrice(s.base)}`);
    assert.ok(text.includes(formatWeeks(s.weeks)), `${s.id} term ${formatWeeks(s.weeks)}`);
  }
});

test('the section carries the honest price caption', () => {
  assert.ok(html.includes('Окончательная цена зависит от задач. Оценку дам бесплатно.'));
});

test('each card links to the calculator', () => {
  for (const s of Object.values(SERVICES)) {
    const m = html.match(new RegExp(`<article[^>]*data-service="${s.id}"[\\s\\S]*?</article>`));
    assert.ok(m[0].includes('href="#calculator"'), `${s.id} calculator link`);
  }
});
