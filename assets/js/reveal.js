// Запасной вариант появления блоков для браузеров без CSS scroll-driven animations (Firefox).
// Список обязан совпадать с селекторами в motion.css (@supports-блок и .js-reveal).
export const REVEAL_SELECTOR = [
  '.service-card',
  '.work-card',
  '.step',
  '.terms',
  '.demo-grid .demo-card',
  '.about__photo',
  '.about__text',
  '.faq__item',
  '.contact__buttons',
  '.contact__next',
].join(', ');

export function shouldReveal({ supportsTimeline, reducedMotion, hasObserver }) {
  return !supportsTimeline && !reducedMotion && hasObserver;
}

export function initReveal(root = document) {
  const win = root.defaultView ?? window;
  const ok = shouldReveal({
    supportsTimeline: win.CSS?.supports?.('animation-timeline: view()') ?? false,
    reducedMotion: win.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    hasObserver: 'IntersectionObserver' in win,
  });
  if (!ok) return;

  const items = [...root.querySelectorAll(REVEAL_SELECTOR)];
  const observer = new win.IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  for (const el of items) {
    el.classList.add('js-reveal');
    observer.observe(el);
  }
}
