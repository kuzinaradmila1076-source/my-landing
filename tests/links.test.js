import test from 'node:test';
import assert from 'node:assert/strict';
import { telegramLink, telLink, mailLink } from '../assets/js/links.js';

const TG = 'https://t.me/radmila_direct';

test('telegramLink without text returns the bare profile link', () => {
  assert.equal(telegramLink(), TG);
});

test('telegramLink encodes cyrillic, quotes and ampersand and round-trips', () => {
  const text = 'Услуга: сайт & бот «а»';
  const link = telegramLink(text);
  assert.ok(link.startsWith(`${TG}?text=`));
  assert.equal(decodeURIComponent(link.slice(`${TG}?text=`.length)), text);
});

test('telegramLink truncates text to 500 characters', () => {
  const link = telegramLink('я'.repeat(600));
  const decoded = decodeURIComponent(link.slice(`${TG}?text=`.length));
  assert.ok(decoded.length <= 500);
});

test('telLink returns the tel: URI', () => {
  assert.equal(telLink(), 'tel:+79308501004');
});

test('mailLink returns the mailto: URI', () => {
  assert.equal(mailLink(), 'mailto:radmila-web@yandex.ru');
});
