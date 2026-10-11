import test from 'node:test';
import assert from 'node:assert/strict';
import { createBot, BOOKING_SCRIPT } from '../assets/js/bot-demo.js';

const GREETING = 'Здравствуйте! На какую услугу записать?';

function playToEnd(bot) {
  while (!bot.finished()) bot.choose(bot.replies()[0].label);
}

test('the bot starts with the spec greeting and offers replies', () => {
  const bot = createBot(BOOKING_SCRIPT);
  assert.deepEqual(bot.messages(), [{ from: 'bot', text: GREETING }]);
  assert.ok(bot.replies().length > 0);
  assert.equal(bot.finished(), false);
});

test('the spec dialogue works: Маникюр, завтра -> free slots question', () => {
  const bot = createBot(BOOKING_SCRIPT);
  bot.choose('Маникюр, завтра');
  const texts = bot.messages().map((m) => `${m.from}: ${m.text}`);
  assert.deepEqual(texts.slice(0, 3), [
    `bot: ${GREETING}`,
    'me: Маникюр, завтра',
    'bot: Свободно 11:00 и 15:30. Какое время?',
  ]);
});

test('choosing an unknown reply is ignored', () => {
  const bot = createBot(BOOKING_SCRIPT);
  bot.choose('что-то другое');
  assert.equal(bot.messages().length, 1);
});

test('the dialogue finishes with no replies left', () => {
  const bot = createBot(BOOKING_SCRIPT);
  playToEnd(bot);
  assert.equal(bot.finished(), true);
  assert.deepEqual(bot.replies(), []);
});

test('choosing after the dialogue has finished changes nothing', () => {
  const bot = createBot(BOOKING_SCRIPT);
  playToEnd(bot);
  const count = bot.messages().length;
  bot.choose('Маникюр, завтра');
  assert.equal(bot.messages().length, count);
});

test('clicking the same reply twice only advances once', () => {
  const bot = createBot(BOOKING_SCRIPT);
  bot.choose('Маникюр, завтра');
  const count = bot.messages().length;
  bot.choose('Маникюр, завтра');
  assert.equal(bot.messages().length, count);
});

test('restart returns to the greeting', () => {
  const bot = createBot(BOOKING_SCRIPT);
  playToEnd(bot);
  bot.restart();
  assert.deepEqual(bot.messages(), [{ from: 'bot', text: GREETING }]);
  assert.equal(bot.finished(), false);
});

test('every reply points to an existing node and the start node exists', () => {
  assert.ok(BOOKING_SCRIPT.nodes[BOOKING_SCRIPT.start]);
  for (const [id, node] of Object.entries(BOOKING_SCRIPT.nodes)) {
    for (const r of node.replies) {
      assert.ok(BOOKING_SCRIPT.nodes[r.next], `${id} -> ${r.next}`);
    }
  }
});
