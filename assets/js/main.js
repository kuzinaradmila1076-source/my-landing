import { initReveal } from './reveal.js';
import { initAnalytics } from './analytics.js';
import { initCalculator } from './calculator.js';
import { initQuiz } from './quiz.js';
import { initBot } from './bot-demo.js';

initCalculator(document.querySelector('[data-calculator]'));
initQuiz(document.querySelector('[data-quiz]'));
document.querySelectorAll('[data-bot]').forEach(initBot);
initReveal(document);
initAnalytics();
