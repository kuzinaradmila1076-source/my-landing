import { SERVICES, calculate, formatRange, formatWeeks, buildRequestText } from './pricing.js';
import { telegramLink } from './links.js';

export function initialState() {
  return { serviceId: null, answers: {} };
}

export function nextState(state, event) {
  switch (event.type) {
    case 'pick-service':
      return SERVICES[event.id] ? { serviceId: event.id, answers: {} } : state;
    case 'answer': {
      const service = SERVICES[state.serviceId];
      const question = service?.questions.find((q) => q.id === event.questionId);
      if (!question || !question.options.some((o) => o.id === event.optionId)) return state;
      return { ...state, answers: { ...state.answers, [event.questionId]: event.optionId } };
    }
    case 'reset':
      return initialState();
    default:
      return state;
  }
}

export function requestLink(state) {
  if (!state.serviceId) return null;
  return telegramLink(buildRequestText(state.serviceId, state.answers));
}

const html = (strings, ...values) =>
  strings.reduce((out, s, i) => out + s + (i < values.length ? values[i] : ''), '');

function emitGoal(name) {
  document.dispatchEvent(new CustomEvent('landing:goal', { detail: name }));
}

export function initCalculator(root) {
  if (!root) return;
  let state = initialState();
  let started = false;

  const picker = html`<div class="calc__picker" role="group" aria-label="Выберите услугу">
    ${Object.values(SERVICES)
      .map((s) => html`<button type="button" class="calc__chip" data-pick="${s.id}" aria-pressed="false">${s.title}</button>`)
      .join('')}
  </div>`;
  root.innerHTML = html`${picker}<div class="calc__body" hidden></div>`;
  const body = root.querySelector('.calc__body');

  function renderQuestions() {
    const service = SERVICES[state.serviceId];
    body.hidden = false;
    body.innerHTML = html`
      <div class="calc__questions">
        ${service.questions
          .map(
            (q) => html`<fieldset class="calc__q">
              <legend>${q.label}</legend>
              ${q.options
                .map(
                  (o, i) => html`<label class="calc__opt">
                    <input type="radio" name="${q.id}" value="${o.id}" ${i === 0 ? 'checked' : ''}>
                    <span>${o.label}</span>
                  </label>`,
                )
                .join('')}
            </fieldset>`,
          )
          .join('')}
      </div>
      <div class="calc__result" aria-live="polite"></div>`;
    renderResult();
  }

  function renderResult() {
    const result = body.querySelector('.calc__result');
    const r = calculate(state.serviceId, state.answers);
    if (r.error) {
      result.textContent = '';
      return;
    }
    result.innerHTML = html`
      <p class="label">Ориентировочно</p>
      <p class="calc__price">${formatRange(r)}</p>
      <p class="calc__term">Срок: ${formatWeeks(r.weeks)}</p>
      <p class="calc__note">Ориентировочно, точную цену назову после обсуждения.</p>
      <a class="btn btn--primary" href="${requestLink(state)}" data-goal="telegram">Отправить расчёт мне в Telegram</a>`;
  }

  function pick(id) {
    const next = nextState(state, { type: 'pick-service', id });
    if (next === state) return;
    state = next;
    if (!started) {
      started = true;
      emitGoal('calculator');
    }
    root.querySelectorAll('[data-pick]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pick === id)));
    renderQuestions();
  }

  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-pick]');
    if (btn) pick(btn.dataset.pick);
  });
  root.addEventListener('change', (e) => {
    if (e.target.type !== 'radio') return;
    state = nextState(state, { type: 'answer', questionId: e.target.name, optionId: e.target.value });
    renderResult();
  });
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-calc-service]');
    if (link) pick(link.dataset.calcService);
  });
}
