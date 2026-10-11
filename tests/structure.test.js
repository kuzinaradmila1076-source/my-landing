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

test('works section contains the demo quiz mount with a no-JS fallback', () => {
  const m = html.match(/<section id="works"[\s\S]*?<\/section>/);
  assert.ok(m, 'works section');
  assert.ok(m[0].includes('data-quiz'));
  assert.ok(m[0].includes('Включите JavaScript или напишите в Telegram'));
});

test('the demo bot is mounted twice: in the hero card and in the works section', () => {
  assert.ok((html.match(/data-bot=/g) ?? []).length >= 2);
  const works = html.match(/<section id="works"[\s\S]*?<\/section>/)[0];
  assert.ok(works.includes('data-bot'));
});

const section = (id) => {
  const m = html.match(new RegExp('<section id="' + id + '"[\\s\\S]*?</section>'));
  assert.ok(m, `section #${id}`);
  return m[0];
};
const text = (s) => s.replace(/<[^>]+>/g, ' ').replace(/[ \t\r\n]+/g, ' ');

test('process has five steps and the second is the deep niche and competitor analysis', () => {
  const s = section('process');
  const steps = s.match(/data-step="\d"/g) ?? [];
  assert.equal(steps.length, 5);
  assert.ok(/data-step="2"[\s\S]*?Глубокий анализ ниши и конкурентов/.test(s));
  assert.ok(/data-step="1"[\s\S]*?Бриф/.test(s));
  assert.ok(/data-step="5"[\s\S]*?Поддержка/.test(s));
});

test('process states the agreed conditions', () => {
  const t = text(section('process'));
  assert.ok(t.includes('30% перед началом, 40% после согласования прототипа, 30% после сдачи'));
  assert.ok(t.includes('2 круга правок'));
  assert.ok(t.includes('14 дней'));
  assert.ok(t.includes('передаются вам полностью после финальной оплаты'));
  assert.ok(t.includes('ИП'));
});

test('about has the name, a described photo and honest learning status', () => {
  const s = section('about');
  assert.ok(s.includes('Радмила Кузина'));
  assert.ok(/<img[^>]+src="assets\/img\/radmila\.webp"[^>]+alt="[^"]{5,}"/.test(s));
  assert.ok(text(s).includes('прохожу обучение'));
  assert.ok(s.includes('https://github.com/kuzinaradmila1076-source'));
});

test('faq has seven questions in details elements and covers the key fears', () => {
  const s = section('faq');
  assert.equal((s.match(/<details/g) ?? []).length, 7);
  const t = text(s);
  for (const q of ['Сколько это стоит', 'Сколько времени займёт', 'не понравится результат', 'Кому принадлежат сайт и код', 'после запуска', 'ИИ-агент безопасен', 'работаете одна']) {
    assert.ok(t.includes(q), q);
  }
});

test('the final block has the promise, three contact buttons and what happens next', () => {
  const s = section('contact');
  assert.ok(s.includes('Расскажите о задаче, отвечу в течение дня'));
  assert.ok(s.includes('href="https://t.me/radmila_direct"'));
  assert.ok(s.includes('href="tel:+79308501004"') && s.includes('Позвонить'));
  assert.ok(s.includes('href="mailto:radmila-web@yandex.ru"') && s.includes('Написать на почту'));
  assert.ok(text(s).includes('Что будет после заявки'));
});

test('the footer has the sole-proprietor requisites, address and the three documents', () => {
  const f = html.match(/<footer[\s\S]*?<\/footer>/);
  assert.ok(f, 'footer');
  for (const s of ['ИП Кузина Радмила', '326680000013067', '681101943762', 'Транспортная 78/30', '© 2026',
    'https://project1003106.tilda.ws/confidentiality', 'https://project1003106.tilda.ws/personal', 'https://project1003106.tilda.ws/media']) {
    assert.ok(f[0].includes(s), s);
  }
});

test('no invented testimonials or client logos', () => {
  assert.ok(!html.includes('<blockquote'));
  assert.ok(!/Отзывы клиентов|Нам доверяют|Наши клиенты/.test(html));
});

test('the works section repeats the main call to action after the demos', () => {
  const works = section('works');
  assert.ok(works.lastIndexOf('Обсудить проект') > works.indexOf('demo-grid'));
  assert.ok(/<a[^>]+href="https:\/\/t\.me\/radmila_direct"[^>]*>Обсудить проект<\/a>/.test(works));
});

test('the footer lists Telegram, e-mail and the call link', () => {
  const f = html.match(/<footer[\s\S]*?<\/footer>/)[0];
  assert.ok(f.includes('href="https://t.me/radmila_direct"'));
  assert.ok(f.includes('href="mailto:radmila-web@yandex.ru"'));
  assert.ok(f.includes('href="tel:+79308501004"'));
  assert.ok(!f.replace(/<[^>]+>/g, ' ').includes('850 1004'));
});

test('the menu script file exists and main.js loads modules through the safe boot helper', () => {
  const main = readFileSync(new URL('../assets/js/main.js', import.meta.url), 'utf8');
  assert.ok(main.includes("from './boot.js'"));
  assert.ok(!/^import \{ init(Calculator|Quiz|Bot) \}/m.test(main), 'interactive modules must be loaded dynamically');
});
