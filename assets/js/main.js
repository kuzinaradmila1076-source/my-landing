import { bootModule } from './boot.js';

const all = (selector) => [...document.querySelectorAll(selector)];

// Интерактив подгружается по отдельности: сбой одного модуля не ломает остальные и оставляет заглушку.
bootModule(() => import('./calculator.js'), (m, el) => m.initCalculator(el), all('[data-calculator]'));
bootModule(() => import('./quiz.js'), (m, el) => m.initQuiz(el), all('[data-quiz]'));
bootModule(() => import('./bot-demo.js'), (m, el) => m.initBot(el), all('[data-bot]'));

// Необязательные улучшения: их сбой ничего не показывает и ничего не прячет.
import('./reveal.js').then((m) => m.initReveal(document)).catch(() => {});
import('./analytics.js').then((m) => m.initAnalytics()).catch(() => {});

// Мобильное меню закрывается после выбора ссылки.
for (const link of all('.menu nav a')) {
  link.addEventListener('click', () => {
    link.closest('details').open = false;
  });
}
