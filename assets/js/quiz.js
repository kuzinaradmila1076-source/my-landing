import { telegramLink } from './links.js';

export const SALON_STEPS = [
  {
    id: 'service',
    question: 'Какая услуга вас интересует?',
    options: [
      { id: 'service-manicure', label: 'Маникюр' },
      { id: 'service-haircut', label: 'Стрижка' },
      { id: 'service-colour', label: 'Окрашивание' },
    ],
  },
  {
    id: 'master',
    question: 'К какому мастеру записать?',
    options: [
      { id: 'master-any', label: 'К любому свободному' },
      { id: 'master-anna', label: 'К Анне' },
      { id: 'master-maria', label: 'К Марии' },
    ],
  },
  {
    id: 'day',
    question: 'Когда вам удобно?',
    options: [
      { id: 'day-today', label: 'Сегодня' },
      { id: 'day-tomorrow', label: 'Завтра' },
      { id: 'day-weekend', label: 'В выходные' },
    ],
  },
  {
    id: 'time',
    question: 'В какое время?',
    options: [
      { id: 'time-morning', label: 'Утром (9–12)' },
      { id: 'time-day', label: 'Днём (12–17)' },
      { id: 'time-evening', label: 'Вечером (17–21)' },
    ],
  },
];

export function createQuiz(steps) {
  let picks = []; // выбранные опции по порядку шагов

  return {
    current: () => steps[picks.length] ?? null,
    answer(optionId) {
      const step = steps[picks.length];
      const option = step?.options.find((o) => o.id === optionId);
      if (option) picks = [...picks, option];
    },
    back() {
      picks = picks.slice(0, -1);
    },
    result: () => (picks.length === steps.length ? { summary: picks.map((o) => o.label).join(' · ') } : null),
    restart() {
      picks = [];
    },
  };
}

function emitGoal(name) {
  document.dispatchEvent(new CustomEvent('landing:goal', { detail: name }));
}

export function initQuiz(root) {
  if (!root) return;
  const quiz = createQuiz(SALON_STEPS);
  let started = false;

  function render(moveFocus = true) {
    const step = quiz.current();
    const done = quiz.result();
    const index = SALON_STEPS.findIndex((s) => s.id === step?.id);
    root.innerHTML = step
      ? `<p class="label">Демо-сценарий · шаг ${index + 1} из ${SALON_STEPS.length}</p>
         <h3>${step.question}</h3>
         <div class="quiz__options">${step.options
           .map((o) => `<button type="button" class="quiz__option" data-option="${o.id}">${o.label}</button>`)
           .join('')}</div>
         ${index > 0 ? '<button type="button" class="quiz__back" data-back>← Назад</button>' : ''}`
      : `<p class="label">Демо-сценарий · готово</p>
         <h3>Запись: ${done.summary}</h3>
         <p class="quiz__note">Так клиент оставляет запись за четыре клика, а вам приходит готовое сообщение.</p>
         <div class="quiz__actions">
           <a class="btn btn--primary" href="${telegramLink(`Здравствуйте! Хочу записаться: ${done.summary}`)}" data-goal="telegram">Записаться в Telegram</a>
           <button type="button" class="quiz__back" data-restart>Пройти ещё раз</button>
         </div>`;
    if (moveFocus) root.querySelector('button, a')?.focus({ preventScroll: true });
  }

  root.addEventListener('click', (e) => {
    const option = e.target.closest('[data-option]');
    if (option) {
      if (!started) {
        started = true;
        emitGoal('quiz');
      }
      quiz.answer(option.dataset.option);
      render();
    } else if (e.target.closest('[data-back]')) {
      quiz.back();
      render();
    } else if (e.target.closest('[data-restart]')) {
      quiz.restart();
      render();
    }
  });

  render(false);
}
