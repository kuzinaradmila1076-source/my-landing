import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { initAnalytics, trackGoal, GOALS } from '../assets/js/analytics.js';
import { SITE_URL, ANALYTICS } from '../assets/js/config.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const root = new URL('../', import.meta.url);

// Среда, которая сразу падает при любом обращении: проверяем, что выключенная аналитика ничего не трогает.
const forbidden = new Proxy({}, { get() { throw new Error('analytics touched the page while disabled'); } });

function fakeEnv() {
  const appended = [];
  const listeners = {};
  const document = {
    head: { appendChild: (n) => appended.push(n) },
    body: { appendChild: (n) => appended.push(n) },
    createElement: (tag) => ({ tag, setAttribute() {}, addEventListener() {}, append() {}, set innerHTML(v) { this.html = v; }, get innerHTML() { return this.html; } }),
    addEventListener: (type, fn) => { (listeners[type] ??= []).push(fn); },
  };
  const calls = [];
  const window = { ym: undefined };
  return { env: { document, window }, appended, listeners, calls, window };
}

test('the shipped config keeps analytics off until there is a counter id', () => {
  assert.deepEqual(ANALYTICS, { enabled: false, counterId: null });
});

test('disabled analytics is inactive and touches nothing', () => {
  assert.deepEqual(initAnalytics({ enabled: false, counterId: null }, { document: forbidden, window: forbidden }), { active: false });
});

test('enabled without a counter id stays inactive', () => {
  const { env, appended } = fakeEnv();
  assert.deepEqual(initAnalytics({ enabled: true, counterId: null }, env), { active: false });
  assert.equal(appended.length, 0);
});

test('enabled with a counter id loads Metrika and shows the cookie notice with the privacy link', () => {
  const { env, appended } = fakeEnv();
  assert.deepEqual(initAnalytics({ enabled: true, counterId: 12345678 }, env), { active: true });
  const script = appended.find((n) => n.tag === 'script');
  assert.ok(script, 'metrika script');
  const banner = appended.find((n) => n.tag === 'div');
  assert.ok(banner, 'cookie banner');
  assert.ok(banner.innerHTML.includes('https://project1003106.tilda.ws/confidentiality'));
});

test('trackGoal is safe before init and reports to Metrika after init', () => {
  assert.doesNotThrow(() => trackGoal('telegram'));
  const { env, window } = fakeEnv();
  const reported = [];
  initAnalytics({ enabled: true, counterId: 7 }, env);
  window.ym = (...args) => reported.push(args);
  trackGoal('telegram');
  assert.deepEqual(reported.at(-1), [7, 'reachGoal', 'telegram']);
});

test('landing:goal events from the interactive demos are forwarded as goals', () => {
  const { env, window, listeners } = fakeEnv();
  const reported = [];
  initAnalytics({ enabled: true, counterId: 9 }, env);
  window.ym = (...args) => reported.push(args);
  listeners['landing:goal'][0]({ detail: 'calculator' });
  assert.deepEqual(reported.at(-1), [9, 'reachGoal', 'calculator']);
});

test('every data-goal in index.html is a known goal', () => {
  const used = new Set([...html.matchAll(/data-goal="([^"]+)"/g)].map((m) => m[1]));
  assert.ok(used.size > 0);
  for (const g of used) assert.ok(GOALS.includes(g), g);
  for (const g of ['calculator', 'quiz', 'bot']) assert.ok(GOALS.includes(g), g);
});

test('head has title, description and a canonical link that equals SITE_URL', () => {
  assert.match(html, /<title>[^<]{10,}<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]{50,}">/);
  assert.ok(html.includes(`<link rel="canonical" href="${SITE_URL}">`));
});

test('Open Graph tags are complete and absolute', () => {
  for (const p of ['og:title', 'og:description', 'og:type', 'og:locale']) assert.ok(html.includes(`property="${p}"`), p);
  assert.ok(html.includes(`<meta property="og:url" content="${SITE_URL}">`));
  assert.ok(html.includes(`<meta property="og:image" content="${SITE_URL}assets/img/og.png">`));
});

test('favicon and share image exist on disk and the favicon is linked', () => {
  assert.ok(html.includes('rel="icon"'));
  assert.ok(existsSync(new URL('assets/img/favicon.svg', root)));
  assert.ok(existsSync(new URL('assets/img/og.png', root)));
});
