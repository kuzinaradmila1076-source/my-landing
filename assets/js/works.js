// Единственный источник данных блока «Работы». После правки запускайте: node scripts/sync-works.mjs
export const WORKS = [
  {
    id: 'dom-kapibara',
    title: 'Дом Капибара',
    kind: 'site',
    task: 'Сайт-визитка экскурсии к капибарам в Сочи: рассказать об экскурсии, показать цену и помочь выбрать дату.',
    done: 'Страница с описанием, ценой от 1\u00A0700\u00A0₽, билетами, отзывами, адресом и ответами на вопросы. Удобная версия для телефона.',
    stack: ['HTML', 'CSS', 'GitHub Pages'],
    url: 'https://kuzinaradmila1076-source.github.io/dom-kapibara/',
    repo: 'https://github.com/kuzinaradmila1076-source/dom-kapibara',
    image: {
      src: 'assets/img/kapibara.webp',
      width: 1200,
      height: 750,
      alt: 'Первый экран сайта «Дом Капибара»: дети гладят капибар, кнопка «Выбрать дату и время»',
    },
  },
  {
    id: 'demo-quiz',
    title: 'Квиз «Запись в салон»',
    kind: 'demo',
    task: 'Показать, как клиент записывается без звонка и переписки.',
    done: 'Рабочий квиз из четырёх шагов: услуга, мастер, день, время. В конце готовое сообщение в Telegram.',
    stack: ['JavaScript'],
    anchor: '#demo-quiz',
  },
  {
    id: 'demo-calculator',
    title: 'Калькулятор стоимости',
    kind: 'demo',
    task: 'Дать клиенту примерную цену сразу, без ожидания ответа.',
    done: 'Выбор услуги, несколько вопросов, диапазон цены и срока и отправка расчёта в Telegram.',
    stack: ['JavaScript'],
    anchor: '#calculator',
  },
  {
    id: 'demo-bot',
    title: 'Чат-бот для записи',
    kind: 'demo',
    task: 'Принять запись на услугу, пока мастер занят.',
    done: 'Диалог по заготовленному сценарию: услуга, свободное время, подтверждение записи.',
    stack: ['JavaScript'],
    anchor: '#demo-bot',
  },
];

export function workCardHtml(work) {
  const href = work.url ?? work.anchor;
  const isSite = work.kind === 'site';
  return `<article class="work-card" data-work="${work.id}">
  ${
    work.image
      ? `<img class="work-card__img" src="${work.image.src}" width="${work.image.width}" height="${work.image.height}" alt="${work.image.alt}" loading="lazy">\n  `
      : ''
  }<div class="work-card__body">
    <p class="label">${isSite ? 'Учебный проект' : 'Демо на странице'}</p>
    <h3>${work.title}</h3>
    <p><strong>Задача.</strong> ${work.task}</p>
    <p><strong>Что сделано.</strong> ${work.done}</p>
    <p class="work-card__stack">${work.stack.join(' · ')}</p>
    <p class="work-card__links"><a class="btn btn--primary btn--small" href="${href}"${isSite ? ' target="_blank" rel="noopener"' : ''} data-goal="work">${isSite ? 'Открыть сайт' : 'Попробовать'}</a>${
      work.repo ? `<a href="${work.repo}" target="_blank" rel="noopener">Код на GitHub</a>` : ''
    }</p>
  </div>
</article>`;
}

export function worksHtml(works) {
  return works.map(workCardHtml).join('\n');
}

export function renderWorks(root, works = WORKS) {
  if (root) root.innerHTML = worksHtml(works);
}
