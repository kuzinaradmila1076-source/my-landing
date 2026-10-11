import { ANALYTICS } from './config.js';

export const GOALS = ['telegram', 'call', 'email', 'work', 'calculator', 'quiz', 'bot'];

const PRIVACY_URL = 'https://project1003106.tilda.ws/confidentiality';
const DISMISS_KEY = 'cookie-notice-dismissed';

let counter = null;
let win = null;

export function trackGoal(name) {
  if (counter === null || typeof win?.ym !== 'function') return;
  win.ym(counter, 'reachGoal', name);
}

function dismissed(window) {
  try {
    return window.localStorage?.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

function showNotice({ document, window }) {
  if (dismissed(window)) return;
  const banner = document.createElement('div');
  banner.className = 'cookie-notice';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Уведомление о cookies');
  banner.innerHTML = `<p>Сайт использует Яндекс.Метрику (cookies) для статистики посещений. Подробнее в <a href="${PRIVACY_URL}" target="_blank" rel="noopener">политике конфиденциальности</a>.</p><button type="button" class="btn btn--primary btn--small" data-cookie-ok>Понятно</button>`;
  banner.addEventListener('click', (e) => {
    if (!e.target?.closest?.('[data-cookie-ok]')) return;
    try {
      window.localStorage?.setItem(DISMISS_KEY, '1');
    } catch {
      /* хранилище недоступно: баннер просто покажется снова */
    }
    banner.remove?.();
  });
  document.body.appendChild(banner);
}

export function initAnalytics(config = ANALYTICS, env = { document: globalThis.document, window: globalThis.window }) {
  if (!config.enabled || !config.counterId) return { active: false };

  const { document, window } = env;
  counter = config.counterId;
  win = window;

  window.ym =
    window.ym ||
    function ym(...args) {
      (window.ym.a = window.ym.a || []).push(args);
    };
  window.ym.l = Date.now();
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  document.head.appendChild(script);
  window.ym(counter, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });

  document.addEventListener('landing:goal', (e) => trackGoal(e.detail));
  document.addEventListener('click', (e) => {
    const goal = e.target?.closest?.('[data-goal]')?.dataset?.goal;
    if (goal) trackGoal(goal);
  });

  showNotice(env);
  return { active: true };
}
