import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SERVICES,
  calculate,
  formatRange,
  formatWeeks,
  buildRequestText,
} from '../assets/js/pricing.js';

test('base prices and weeks match the spec for every service', () => {
  const expected = {
    site: [30000, [1, 2]],
    quiz: [20000, [1, 1]],
    calculator: [20000, [1, 2]],
    bot: [15000, [1, 2]],
    agent: [50000, [3, 4]],
  };
  assert.deepEqual(Object.keys(SERVICES).sort(), Object.keys(expected).sort());
  for (const [id, [base, weeks]] of Object.entries(expected)) {
    assert.equal(SERVICES[id].base, base, `${id} base`);
    assert.deepEqual(SERVICES[id].weeks, weeks, `${id} weeks`);
  }
});

test('every question has options and its first option costs nothing', () => {
  for (const s of Object.values(SERVICES)) {
    assert.ok(s.questions.length >= 3 && s.questions.length <= 5, `${s.id} question count`);
    for (const q of s.questions) {
      assert.ok(q.options.length >= 2, `${s.id}.${q.id} options`);
      assert.equal(q.options[0].surcharge, 0, `${s.id}.${q.id} first option`);
    }
  }
});

test('site with no answers costs the base price range', () => {
  assert.deepEqual(calculate('site', {}), { min: 30000, max: 39000, weeks: [1, 2] });
});

test('site: 4-6 pages, custom design, 1-2 integrations', () => {
  const r = calculate('site', { pages: 'p4_6', design: 'custom', integrations: 'i1_2' });
  assert.equal(r.min, 60000);
  assert.equal(r.max, 78000);
});

test('site: 4-6 pages with custom design rounds the max to 72 000', () => {
  const r = calculate('site', { pages: 'p4_6', design: 'custom' });
  assert.equal(r.min, 55000);
  assert.equal(r.max, 72000);
});

test('urgent multiplies the minimum by 1.3 before the max is derived', () => {
  const r = calculate('site', { rush: 'urgent' });
  assert.equal(r.min, 39000);
  assert.equal(r.max, 51000);
});

test('two expensive options add a week to both ends', () => {
  const r = calculate('site', { pages: 'p7', design: 'custom' });
  assert.deepEqual(r.weeks, [2, 3]);
});

test('one expensive option does not add a week', () => {
  const r = calculate('bot', { scenarios: 's15', integrations: 'i1' });
  assert.equal(r.min, 30000);
  assert.equal(r.max, 39000);
  assert.deepEqual(r.weeks, [1, 2]);
});

test('agent with more than one channel', () => {
  const r = calculate('agent', { channels: 'many' });
  assert.equal(r.min, 60000);
  assert.equal(r.max, 78000);
  assert.deepEqual(r.weeks, [3, 4]);
});

test('unknown service returns an error and does not throw', () => {
  const r = calculate('unknown', {});
  assert.ok(typeof r.error === 'string' && r.error.length > 0);
});

test('missing or unknown answers fall back to the first option', () => {
  const base = calculate('site', {});
  assert.deepEqual(calculate('site', { pages: 'bogus' }), base);
  assert.deepEqual(calculate('site', { nothing: 'x' }), base);
  assert.deepEqual(calculate('site'), base);
});

test('formatRange shows two thousands-separated numbers and the ruble sign', () => {
  assert.equal(formatRange({ min: 38000, max: 50000 }), '38 000–50 000 ₽');
});

test('formatWeeks handles ranges and the single-week case', () => {
  assert.equal(formatWeeks([1, 2]), '1–2 недели');
  assert.equal(formatWeeks([3, 4]), '3–4 недели');
  assert.equal(formatWeeks([1, 1]), 'около недели');
});

test('buildRequestText names the service, range and chosen options within 500 chars', () => {
  const answers = { pages: 'p4_6', design: 'custom' };
  const text = buildRequestText('site', answers);
  const r = calculate('site', answers);
  assert.ok(text.includes(SERVICES.site.title));
  assert.ok(text.includes(formatRange(r)));
  for (const q of SERVICES.site.questions) {
    const chosen = q.options.find((o) => o.id === answers[q.id]);
    if (chosen) assert.ok(text.includes(chosen.label), `option ${chosen.id}`);
  }
  assert.ok(text.length <= 500);
});

test('buildRequestText for an unknown service returns an empty string', () => {
  assert.equal(buildRequestText('unknown', {}), '');
});

test('the urgent option does not promise a term the quote contradicts', () => {
  for (const s of Object.values(SERVICES)) {
    const urgent = s.questions.find((q) => q.id === 'rush').options.find((o) => o.id === 'urgent');
    assert.ok(!/\d\s*дн/.test(urgent.label), `${s.id}: "${urgent.label}" must not promise a number of days`);
  }
});
