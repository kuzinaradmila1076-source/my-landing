import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const has = (s) => assert.ok(html.includes(s), `index.html should contain: ${s}`);

test('document language, viewport and charset are set', () => {
  has('<html lang="ru"');
  has('<meta name="viewport"');
  has('<meta charset="utf-8"');
});

test('hero has the exact headline, label, CTAs and response promise', () => {
  has('Сайты и ИИ-агенты, которые приносят заявки, пока вы занимаетесь делом');
  has('САЙТЫ · КВИЗЫ · КАЛЬКУЛЯТОРЫ · ИИ-АГЕНТЫ');
  has('Обсудить проект');
  has('Написать в Telegram');
  has('Отвечу в Telegram в течение дня');
  has('1 учебный сайт онлайн и 3 рабочих демо: квиз, калькулятор, бот');
});

test('Telegram link points to the profile', () => {
  has('href="https://t.me/radmila_direct"');
});

test('all section anchors exist', () => {
  for (const id of ['services', 'works', 'calculator', 'process', 'about', 'faq', 'contact']) {
    has(`id="${id}"`);
  }
});

test('the phone number is never printed as visible text', () => {
  const visible = html.replace(/<[^>]+>/g, ' ');
  assert.ok(!visible.includes('+7 (930)'));
  assert.ok(!visible.includes('850 1004'));
  assert.ok(!visible.includes('+79308501004'));
});

test('stylesheets and the module entry are linked with relative paths', () => {
  has('href="assets/css/tokens.css"');
  has('href="assets/css/base.css"');
  has('href="assets/css/sections.css"');
});

test('calculator section has a mount point, a no-JS fallback and the module entry', () => {
  const m = html.match(/<section id="calculator"[\s\S]*?<\/section>/);
  assert.ok(m, 'calculator section');
  assert.ok(m[0].includes('data-calculator'));
  assert.ok(m[0].includes('<noscript>'));
  assert.ok(m[0].includes('Включите JavaScript или напишите в Telegram'));
  has('<script type="module" src="assets/js/main.js"></script>');
});
