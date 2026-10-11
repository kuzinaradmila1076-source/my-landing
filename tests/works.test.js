import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { WORKS, workCardHtml, worksHtml } from '../assets/js/works.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const root = new URL('../', import.meta.url);

test('the real case is Дом Капибара with the live site and the repository', () => {
  const w = WORKS.find((x) => x.id === 'dom-kapibara');
  assert.ok(w);
  assert.equal(w.title, 'Дом Капибара');
  assert.equal(w.kind, 'site');
  assert.equal(w.url, 'https://kuzinaradmila1076-source.github.io/dom-kapibara/');
  assert.equal(w.repo, 'https://github.com/kuzinaradmila1076-source/dom-kapibara');
});

test('there are three demos next to the case: quiz, calculator, bot', () => {
  const demos = WORKS.filter((x) => x.kind === 'demo').map((x) => x.id).sort();
  assert.deepEqual(demos, ['demo-bot', 'demo-calculator', 'demo-quiz']);
  assert.equal(WORKS.find((x) => x.id === 'demo-calculator').anchor, '#calculator');
});

test('every work has a task, what was done and a stack, and a unique id', () => {
  assert.equal(new Set(WORKS.map((w) => w.id)).size, WORKS.length);
  for (const w of WORKS) {
    assert.ok(w.task && w.done && w.stack.length > 0, w.id);
    assert.ok(w.url || w.anchor, `${w.id} needs a link target`);
  }
});

test('the card shows the title, the task, the stack and an open button', () => {
  const w = WORKS.find((x) => x.id === 'dom-kapibara');
  const card = workCardHtml(w);
  assert.ok(card.includes(w.title) && card.includes(w.task) && card.includes(w.done));
  assert.ok(card.includes(`href="${w.url}"`));
  assert.ok(card.includes(`href="${w.repo}"`));
  for (const s of w.stack) assert.ok(card.includes(s));
});

test('demo cards link to an on-page anchor and carry the try-it label', () => {
  const w = WORKS.find((x) => x.id === 'demo-quiz');
  const card = workCardHtml(w);
  assert.ok(card.includes(`href="${w.anchor}"`));
  assert.ok(card.includes('Попробовать'));
});

test('index.html works block is exactly what works.js generates', () => {
  const m = html.match(/<!-- works:start -->([\s\S]*?)<!-- works:end -->/);
  assert.ok(m, 'works markers');
  assert.equal(m[1].trim(), worksHtml(WORKS).trim());
});

test('every anchor target and image file exists', () => {
  for (const w of WORKS) {
    if (w.anchor) assert.ok(html.includes(`id="${w.anchor.slice(1)}"`), `${w.id} anchor ${w.anchor}`);
    if (w.image) assert.ok(existsSync(new URL(w.image.src, root)), `${w.id} image`);
  }
});

test('the honest caption about learning projects is present', () => {
  assert.ok(html.includes('Учебные проекты. Здесь будут реальные кейсы, когда они появятся'));
});
