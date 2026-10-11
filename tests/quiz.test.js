import test from 'node:test';
import assert from 'node:assert/strict';
import { createQuiz, SALON_STEPS } from '../assets/js/quiz.js';

const firstOption = (quiz) => quiz.current().options[0];

function finish(quiz) {
  while (quiz.current()) quiz.answer(firstOption(quiz).id);
}

test('SALON_STEPS has four steps with unique option ids', () => {
  assert.equal(SALON_STEPS.length, 4);
  const ids = SALON_STEPS.flatMap((s) => s.options.map((o) => o.id));
  assert.equal(new Set(ids).size, ids.length);
});

test('a new quiz starts on the first step with no result', () => {
  const quiz = createQuiz(SALON_STEPS);
  assert.equal(quiz.current().id, SALON_STEPS[0].id);
  assert.equal(quiz.result(), null);
});

test('answering every step finishes the quiz and the summary lists the chosen labels', () => {
  const quiz = createQuiz(SALON_STEPS);
  finish(quiz);
  assert.equal(quiz.current(), null);
  const { summary } = quiz.result();
  for (const step of SALON_STEPS) assert.ok(summary.includes(step.options[0].label), step.options[0].label);
});

test('back on the first step does nothing', () => {
  const quiz = createQuiz(SALON_STEPS);
  quiz.back();
  assert.equal(quiz.current().id, SALON_STEPS[0].id);
});

test('back after an answer returns to the previous step and lets the answer change', () => {
  const quiz = createQuiz(SALON_STEPS);
  quiz.answer(SALON_STEPS[0].options[0].id);
  quiz.back();
  assert.equal(quiz.current().id, SALON_STEPS[0].id);
  quiz.answer(SALON_STEPS[0].options[1].id);
  finish(quiz);
  assert.ok(quiz.result().summary.includes(SALON_STEPS[0].options[1].label));
  assert.ok(!quiz.result().summary.includes(SALON_STEPS[0].options[0].label));
});

test('back from the result returns to the last step', () => {
  const quiz = createQuiz(SALON_STEPS);
  finish(quiz);
  quiz.back();
  assert.equal(quiz.current().id, SALON_STEPS[SALON_STEPS.length - 1].id);
  assert.equal(quiz.result(), null);
});

test('answering the same option twice does not advance two steps', () => {
  const quiz = createQuiz(SALON_STEPS);
  const id = SALON_STEPS[0].options[0].id;
  quiz.answer(id);
  quiz.answer(id);
  assert.equal(quiz.current().id, SALON_STEPS[1].id);
});

test('an unknown option id is ignored', () => {
  const quiz = createQuiz(SALON_STEPS);
  quiz.answer('bogus');
  assert.equal(quiz.current().id, SALON_STEPS[0].id);
});

test('answers after the quiz has finished are ignored', () => {
  const quiz = createQuiz(SALON_STEPS);
  finish(quiz);
  const before = quiz.result().summary;
  quiz.answer(SALON_STEPS[0].options[1].id);
  assert.equal(quiz.current(), null);
  assert.equal(quiz.result().summary, before);
});

test('restart returns to the first step and clears the result', () => {
  const quiz = createQuiz(SALON_STEPS);
  finish(quiz);
  quiz.restart();
  assert.equal(quiz.current().id, SALON_STEPS[0].id);
  assert.equal(quiz.result(), null);
});
