// Цены, надбавки и формула из tz.md (блок 04). Все числа живут здесь, UI их не дублирует.

const RUSH = {
  id: 'rush',
  label: 'Сроки',
  options: [
    { id: 'normal', label: 'Обычные сроки', surcharge: 0 },
    { id: 'urgent', label: 'Срочно (до 5 дней)', surcharge: 0, multiplier: 1.3 },
  ],
};

const DESIGN = (surcharge) => ({
  id: 'design',
  label: 'Дизайн',
  options: [
    { id: 'template', label: 'На основе шаблона', surcharge: 0 },
    { id: 'custom', label: 'Индивидуальный дизайн', surcharge },
  ],
});

export const SERVICES = {
  site: {
    id: 'site',
    title: 'Сайт-визитка',
    pitch: 'Сайт, который показывает вас и приводит заявки',
    base: 30000,
    weeks: [1, 2],
    questions: [
      {
        id: 'pages',
        label: 'Сколько страниц',
        options: [
          { id: 'p1_3', label: '1–3 страницы', surcharge: 0 },
          { id: 'p4_6', label: '4–6 страниц', surcharge: 10000 },
          { id: 'p7', label: '7 и больше', surcharge: 25000 },
        ],
      },
      DESIGN(15000),
      {
        id: 'integrations',
        label: 'Интеграции (аналитика, карта, Telegram-уведомления)',
        options: [
          { id: 'i0', label: 'Без интеграций', surcharge: 0 },
          { id: 'i1_2', label: '1–2 интеграции', surcharge: 5000 },
          { id: 'i3', label: '3 и больше', surcharge: 10000 },
        ],
      },
      RUSH,
    ],
  },
  quiz: {
    id: 'quiz',
    title: 'Квиз для записи',
    pitch: 'Квиз, который сам собирает запись и отвечает на вопросы клиента',
    base: 20000,
    weeks: [1, 1],
    questions: [
      {
        id: 'steps',
        label: 'Сколько вопросов',
        options: [
          { id: 'q7', label: 'До 7 вопросов', surcharge: 0 },
          { id: 'q15', label: '8–15 вопросов', surcharge: 8000 },
        ],
      },
      {
        id: 'delivery',
        label: 'Куда отправлять результат',
        options: [
          { id: 'none', label: 'Только показать на экране', surcharge: 0 },
          { id: 'send', label: 'Отправлять в Telegram или на почту', surcharge: 5000 },
        ],
      },
      DESIGN(10000),
      RUSH,
    ],
  },
  calculator: {
    id: 'calculator',
    title: 'Калькулятор стоимости',
    pitch: 'Клиент сам считает цену ваших услуг и приходит уже с расчётом',
    base: 20000,
    weeks: [1, 2],
    questions: [
      {
        id: 'items',
        label: 'Сколько услуг в калькуляторе',
        options: [
          { id: 'i5', label: 'До 5 услуг', surcharge: 0 },
          { id: 'i15', label: '6–15 услуг', surcharge: 8000 },
          { id: 'i16', label: '16 и больше', surcharge: 15000 },
        ],
      },
      {
        id: 'logic',
        label: 'Логика расчёта',
        options: [
          { id: 'simple', label: 'Простая', surcharge: 0 },
          { id: 'complex', label: 'Сложная (зависимости между опциями)', surcharge: 7000 },
        ],
      },
      {
        id: 'submit',
        label: 'Отправка заявки',
        options: [
          { id: 'none', label: 'Без отправки', surcharge: 0 },
          { id: 'send', label: 'С отправкой заявки', surcharge: 5000 },
        ],
      },
      DESIGN(10000),
      RUSH,
    ],
  },
  bot: {
    id: 'bot',
    title: 'Чат-бот',
    pitch: 'Бот в Telegram принимает заявки и записи, пока вы заняты',
    base: 15000,
    weeks: [1, 2],
    questions: [
      {
        id: 'scenarios',
        label: 'Сколько сценариев',
        options: [
          { id: 's5', label: 'До 5 сценариев', surcharge: 0 },
          { id: 's15', label: '6–15 сценариев', surcharge: 10000 },
        ],
      },
      {
        id: 'integrations',
        label: 'Интеграции (CRM, таблицы, почта)',
        options: [
          { id: 'i0', label: 'Без интеграций', surcharge: 0 },
          { id: 'i1', label: '1 интеграция', surcharge: 5000 },
          { id: 'i2', label: '2 и больше', surcharge: 10000 },
        ],
      },
      {
        id: 'payment',
        label: 'Оплата или запись',
        options: [
          { id: 'none', label: 'Без оплаты и записи', surcharge: 0 },
          { id: 'yes', label: 'Приём оплаты или запись', surcharge: 10000 },
        ],
      },
      RUSH,
    ],
  },
  agent: {
    id: 'agent',
    title: 'ИИ-агент',
    pitch: 'ИИ-ассистент отвечает клиентам по вашим материалам 24/7',
    base: 50000,
    weeks: [3, 4],
    questions: [
      {
        id: 'crm',
        label: 'Интеграция с CRM',
        options: [
          { id: 'no', label: 'Без CRM', surcharge: 0 },
          { id: 'yes', label: 'С интеграцией CRM', surcharge: 15000 },
        ],
      },
      {
        id: 'channels',
        label: 'Каналы',
        options: [
          { id: 'one', label: 'Один канал', surcharge: 0 },
          { id: 'many', label: 'Больше одного канала', surcharge: 10000 },
        ],
      },
      {
        id: 'training',
        label: 'Обучение на данных клиента',
        options: [
          { id: 'no', label: 'Базовые материалы (FAQ, прайс)', surcharge: 0 },
          { id: 'yes', label: 'Обучение на данных клиента', surcharge: 20000 },
        ],
      },
      RUSH,
    ],
  },
};

const MAX_RATIO = 1.3;
const EXPENSIVE = 10000;
const MAX_REQUEST = 500;

const roundThousand = (n) => Math.round(n / 1000) * 1000;

// Выбранная опция вопроса; неизвестный или пропущенный ответ равен первой опции.
function chosen(question, answers) {
  return question.options.find((o) => o.id === answers?.[question.id]) ?? question.options[0];
}

export function calculate(serviceId, answers = {}) {
  const service = SERVICES[serviceId];
  if (!service) return { error: `Неизвестная услуга: ${serviceId}` };

  const picks = service.questions.map((q) => chosen(q, answers));
  let min = service.base + picks.reduce((sum, o) => sum + o.surcharge, 0);
  for (const o of picks) if (o.multiplier) min *= o.multiplier;
  min = roundThousand(min);
  const max = roundThousand(min * MAX_RATIO);

  const expensive = picks.filter((o) => o.surcharge >= EXPENSIVE).length;
  const extra = expensive >= 2 ? 1 : 0;
  const weeks = [service.weeks[0] + extra, service.weeks[1] + extra];
  return { min, max, weeks };
}

const number = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export function formatRange({ min, max }) {
  return `${number(min)}–${number(max)} ₽`;
}

export function formatWeeks([from, to]) {
  if (from === to) return from === 1 ? 'около недели' : `около ${from} ${weekWord(from)}`;
  return `${from}–${to} ${weekWord(to)}`;
}

function weekWord(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'недели';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) return 'недели';
  return 'недель';
}

export function buildRequestText(serviceId, answers = {}) {
  const service = SERVICES[serviceId];
  if (!service) return '';
  const r = calculate(serviceId, answers);
  const lines = service.questions.map((q) => `• ${q.label}: ${chosen(q, answers).label}`);
  const text = [
    `Здравствуйте! Хочу обсудить проект: ${service.title}.`,
    ...lines,
    `Ориентир по расчёту: ${formatRange(r)}, ${formatWeeks(r.weeks)}.`,
  ].join('\n');
  return text.slice(0, MAX_REQUEST);
}
