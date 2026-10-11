import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, nextState, requestLink } from '../assets/js/calculator.js';

test('initial state has no service and no answers', () => {
  assert.deepEqual(initialState(), { serviceId: null, answers: {} });
});

test('picking a service resets previous answers', () => {
  let s = nextState(initialState(), { type: 'pick-service', id: 'site' });
  s = nextState(s, { type: 'answer', questionId: 'pages', optionId: 'p4_6' });
  s = nextState(s, { type: 'pick-service', id: 'bot' });
  assert.deepEqual(s, { serviceId: 'bot', answers: {} });
});

test('an answer is stored by question id and a later answer replaces it', () => {
  let s = nextState(initialState(), { type: 'pick-service', id: 'site' });
  s = nextState(s, { type: 'answer', questionId: 'pages', optionId: 'p4_6' });
  assert.deepEqual(s.answers, { pages: 'p4_6' });
  s = nextState(s, { type: 'answer', questionId: 'pages', optionId: 'p7' });
  assert.deepEqual(s.answers, { pages: 'p7' });
});

test('reset returns to the initial state', () => {
  let s = nextState(initialState(), { type: 'pick-service', id: 'site' });
  s = nextState(s, { type: 'reset' });
  assert.deepEqual(s, initialState());
});

test('an unknown service id leaves the state unchanged', () => {
  const s = nextState(initialState(), { type: 'pick-service', id: 'nope' });
  assert.deepEqual(s, initialState());
});

test('answers without a service, or for an unknown question or option, are ignored', () => {
  assert.deepEqual(nextState(initialState(), { type: 'answer', questionId: 'pages', optionId: 'p7' }), initialState());
  const picked = nextState(initialState(), { type: 'pick-service', id: 'site' });
  assert.deepEqual(nextState(picked, { type: 'answer', questionId: 'bogus', optionId: 'p7' }), picked);
  assert.deepEqual(nextState(picked, { type: 'answer', questionId: 'pages', optionId: 'bogus' }), picked);
});

test('nextState does not mutate the previous state', () => {
  const before = nextState(initialState(), { type: 'pick-service', id: 'site' });
  const snapshot = JSON.stringify(before);
  nextState(before, { type: 'answer', questionId: 'pages', optionId: 'p7' });
  assert.equal(JSON.stringify(before), snapshot);
});

test('requestLink is null until a service is chosen, never an empty message', () => {
  assert.equal(requestLink(initialState()), null);
});

test('requestLink opens Telegram with the service, option and range, encoded', () => {
  let s = nextState(initialState(), { type: 'pick-service', id: 'site' });
  s = nextState(s, { type: 'answer', questionId: 'pages', optionId: 'p4_6' });
  s = nextState(s, { type: 'answer', questionId: 'design', optionId: 'custom' });
  const link = requestLink(s);
  assert.ok(link.startsWith('https://t.me/radmila_direct?text='));
  const text = decodeURIComponent(link.split('?text=')[1]);
  assert.ok(text.includes('Сайт-визитка'));
  assert.ok(text.includes('4–6 страниц'));
  assert.ok(text.includes('55 000–72 000 ₽'));
});
