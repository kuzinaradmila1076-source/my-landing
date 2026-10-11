# Лендинг-портфолио: план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Собрать статичный лендинг-портфолио Кузиной Радмилы (9 блоков, калькулятор, демо-квиз, демо-бот) и опубликовать на GitHub Pages.

**Architecture:** Статичный сайт без сборки: один `index.html` с полным текстом в разметке (виден без JS), ES-модули в `assets/js/` для интерактива. Бизнес-логика (цены, квиз, бот, ссылки) вынесена в чистые модули без DOM и покрыта тестами на `node --test`; UI-модули только подключают их к разметке. Анимации на CSS с `@supports` и запасным IntersectionObserver.

**Tech Stack:** HTML5, CSS (custom properties, scroll-driven animations), JavaScript ES-модули, `node:test` (без зависимостей), Chrome headless + Lighthouse (`npx lighthouse`) для проверки.

**Spec:** [tz.md](../../../tz.md) (исследование: [research.md](../../../research.md)). Исполнитель читает оба.

## Global Constraints

Значения из tz.md, копируются дословно.
- Контакты: Telegram `https://t.me/radmila_direct`; почта `radmila-web@yandex.ru`; телефон `+79308501004` (в тексте страницы номер не выводится, только `tel:` в ссылке кнопки «Позвонить»).
- Главный CTA: **«Обсудить проект»** → Telegram; шапка: **«Написать в Telegram»**; финал: **«Расскажите о задаче, отвечу в течение дня»**; микротекст hero: «Отвечу в Telegram в течение дня».
- Hero-заголовок: **«Сайты и ИИ-агенты, которые приносят заявки, пока вы занимаетесь делом»**; метка: `САЙТЫ · КВИЗЫ · КАЛЬКУЛЯТОРЫ · ИИ-АГЕНТЫ`.
- Цены «от» и сроки: сайт-визитка 30 000 ₽, 1–2 недели; квиз 20 000 ₽, около недели; калькулятор 20 000 ₽, 1–2 недели; чат-бот 15 000 ₽, 1–2 недели; ИИ-агент 50 000 ₽, 3–4 недели. Подпись: «Окончательная цена зависит от задач. Оценку дам бесплатно.»
- Палитра: `#031C12` фон, `#0B4A2E` и `#05301F` градиент/карточки, `#3DF08A` акцент, `#EAF6EE` текст на тёмном, `#F2FBF6` и `#E9FBF1` светлые блоки, `#0A1C14` текст на светлом, `#000000` блок FAQ. Контраст обычного текста ≥ 4,5:1, крупного ≥ 3:1.
- Шрифты: Manrope (заголовки вес 300, текст 400/600) и JetBrains Mono (лейблы), локальные woff2 с кириллицей, `font-display: swap`; не больше двух семейств.
- Анимируются только `transform`, `opacity`, `filter`; всё отключается при `prefers-reduced-motion: reduce`; базовое состояние контента видимое.
- Запрещено: loader, кастомный курсор, перехват скролла (Lenis), 3D/WebGL, форма с серверной частью, выдуманные отзывы, логотипы клиентов и цифры.
- Метрики: LCP ≤ 2,5 с, INP ≤ 200 мс, CLS ≤ 0,1 (Lighthouse, мобильный профиль); цели нажатия ≥ 24×24 px; нет горизонтального скролла на 360 px и 1440 px.
- Без JS видны текст, услуги с ценами и сроками, ссылки, контакты; калькулятор, квиз и демо-бот показывают заглушку «Включите JavaScript или напишите в Telegram».
- Репозиторий `my-landing`, адрес `https://kuzinaradmila1076-source.github.io/my-landing/`; пути к файлам относительные; канонический адрес и Open Graph абсолютные, вынесены в `SITE_URL` в `assets/js/config.js` и дублируются в `<head>` одной строкой.
- Яндекс.Метрика и баннер cookies реализованы, выключены флагом `ANALYTICS.enabled = false`, пока нет номера счётчика.
- Честность: «1 учебный сайт онлайн и 3 рабочих демо: квиз, калькулятор, бот»; подпись блока работ «Учебные проекты. Здесь будут реальные кейсы, когда они появятся».
- Реквизиты подвала: ИП Кузина Радмила, ОГРНИП 326680000013067, ИНН 681101943762, г. Сочи, ул. Транспортная 78/30. Документы: `https://project1003106.tilda.ws/confidentiality`, `https://project1003106.tilda.ws/personal`, `https://project1003106.tilda.ws/media`.
- Условия: оплата 30% / 40% / 30%; 2 круга правок; код и доступы передаются после финальной оплаты; 14 дней бесплатных исправлений после запуска.

## Review Focus

Входы и условия, которые ТЗ подразумевает, но не описывает; у каждого есть тест в задаче-владельце.
1. Калькулятор получает неизвестную услугу или не заполненный параметр: расчёт не падает, возвращает ошибку или значения по умолчанию, кнопка Telegram не открывает пустой текст (Task 2, Task 5).
2. Текст заявки в Telegram с кириллицей, кавычками и `&`: корректно кодируется и не превышает 500 символов (Task 1, Task 5).
3. JS отключён или упал: основной текст, цены и ссылки на месте, заглушки вместо интерактива (Task 3, Task 9).
4. Браузер без `animation-timeline` (Firefox) и `prefers-reduced-motion: reduce`: контент виден, `opacity: 0` нигде не задан вне `@supports` и без JS-класса (Task 10).
5. Квиз и бот: возврат на предыдущий шаг, повторный старт после результата, повторный клик по тому же варианту (Task 6, Task 7).

---

## Структура файлов

| Файл | Ответственность |
|---|---|
| `index.html` | Вся разметка и тексты 9 блоков, `<head>` с SEO/OG |
| `assets/css/tokens.css` | Переменные (цвета, шрифты, отступы), `@font-face` |
| `assets/css/base.css` | Сброс, типографика, кнопки, сетка, адаптив |
| `assets/css/sections.css` | Стили блоков 01–08 и подвала |
| `assets/css/motion.css` | Все анимации, `@supports`, `prefers-reduced-motion` |
| `assets/js/config.js` | `CONTACTS`, `SITE_URL`, `ANALYTICS` |
| `assets/js/links.js` | Построение ссылок Telegram/tel/mailto |
| `assets/js/pricing.js` | `SERVICES`, `calculate`, формат диапазона и сроков, текст заявки |
| `assets/js/calculator.js` | UI калькулятора (блок 04) |
| `assets/js/quiz.js` | Движок демо-квиза (чистый) и его UI |
| `assets/js/bot-demo.js` | Движок демо-бота (чистый) и его UI |
| `assets/js/works.js` | Данные кейсов и отрисовка блока 03 |
| `assets/js/reveal.js` | Запасной IntersectionObserver для появления блоков |
| `assets/js/analytics.js` | Метрика и баннер cookies за флагом |
| `assets/js/main.js` | Точка входа: подключает модули к разметке |
| `assets/fonts/`, `assets/img/` | woff2, фото Радмилы (webp), скриншоты кейса |
| `tests/*.test.js` | Тесты `node --test` |
| `package.json` | `{"type":"module","scripts":{"test":"node --test"}}` |

---

### Task 1: Каркас проекта и построители ссылок

**Files:**
- Create: `package.json`, `.gitignore` (содержит `.superpowers/`, `node_modules/`), `assets/js/config.js`, `assets/js/links.js`
- Test: `tests/links.test.js`

**Interfaces:**
- Produces: `CONTACTS = { telegram: 'https://t.me/radmila_direct', email: 'radmila-web@yandex.ru', phone: '+79308501004' }`, `SITE_URL: string`, `ANALYTICS = { enabled: false, counterId: null }` из `config.js`; из `links.js`: `telegramLink(text?: string): string`, `telLink(): string`, `mailLink(): string`.

- [ ] **Step 1: Write the failing test** `tests/links.test.js`: `telegramLink()` равен `https://t.me/radmila_direct`; `telegramLink('Услуга: сайт & бот «а»')` начинается с `https://t.me/radmila_direct?text=` и после `decodeURIComponent` возвращает исходную строку; `telegramLink('я'.repeat(600))` декодированный текст не длиннее 500 символов; `telLink()` равен `tel:+79308501004`; `mailLink()` равен `mailto:radmila-web@yandex.ru`.
- [ ] **Step 2: Run** `npm test` — ожидаемо FAIL (модуль не найден).
- [ ] **Step 3: Implement** `config.js` и `links.js` по сигнатурам выше; обрезка текста до 500 символов внутри `telegramLink`.
- [ ] **Step 4: Run** `npm test` — PASS.
- [ ] **Step 5: Commit** (`git init` в корне проекта, `git add .`, `git commit -m "chore: project scaffold and link builders"`).

---

### Task 2: Движок цен и калькулятор (чистая логика)

**Files:**
- Create: `assets/js/pricing.js`
- Test: `tests/pricing.test.js`

**Interfaces:**
- Consumes: —
- Produces:
  - `SERVICES: Record<ServiceId, { id, title, pitch, base: number, weeks: [number, number], questions: Question[] }>` для `ServiceId` = `'site' | 'quiz' | 'calculator' | 'bot' | 'agent'`; `Question = { id, label, options: { id, label, surcharge: number }[] }` (опции и надбавки дословно из таблицы в tz.md, блок 04); `URGENT` как вопрос в каждой услуге (`rush`: `normal`/`urgent`).
  - `calculate(serviceId: ServiceId, answers: Record<string,string>): { min: number, max: number, weeks: [number, number] } | { error: string }`
  - `formatRange(r): string` → `«38 000–50 000 ₽»` (неразрывный пробел как разделитель тысяч), `formatWeeks(w): string`
  - `buildRequestText(serviceId, answers): string` — текст заявки для Telegram.

Правила: `min = base + сумма надбавок`; срочность (`urgent`) умножает `min` на 1,3; `max = min × 1,3`; оба значения `Math.round(x/1000)*1000`; срок = срок услуги, +1 неделя к обоим концам, если выбрано две и более опций с надбавкой ≥ 10 000.

- [ ] **Step 1: Write the failing tests**: сайт, страниц 1–3, шаблон, интеграций 0, обычно → `{min: 30000, max: 39000, weeks: [1,2]}`; сайт, страниц 4–6, индивидуальный дизайн, 1–2 интеграции → `min 60000, max 78000`; сайт срочно при базе → `min 39000, max 51000`; сайт, страниц 7+ и индивидуальный дизайн → `weeks [2,3]`; чат-бот 6–15 сценариев + 1 интеграция → `min 30000, max 39000`; ИИ-агент, больше одного канала → `min 60000, max 78000`, `weeks [3,4]`; `calculate('unknown', {})` → `{error}`; неполные ответы (опущен вопрос) → считаются как первая опция (надбавка 0); `formatRange` выдаёт строку, содержащую `₽` и два числа; `buildRequestText('site', {...})` содержит название услуги, диапазон, выбранные опции и не длиннее 500 символов. Для каждой услуги `SERVICES[id].base` равен цене «от» из Global Constraints.
- [ ] **Step 2: Run** `node --test tests/pricing.test.js` — FAIL.
- [ ] **Step 3: Implement** `pricing.js` по сигнатурам и правилам; все цены и надбавки как данные в `SERVICES`, формула в `calculate`.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `feat: pricing engine with spec tables`.

---

### Task 3: Шрифты, токены, шапка и hero (статичная часть)

**Files:**
- Create: `index.html` (шапка, hero, заглушки для остальных блоков с `id`), `assets/css/tokens.css`, `assets/css/base.css`, `assets/css/sections.css` (hero, шапка), `assets/fonts/*.woff2`
- Test: `tests/structure.test.js`

**Interfaces:**
- Produces: `index.html` с якорями `#services`, `#works`, `#calculator`, `#process`, `#about`, `#faq`, `#contact`; CSS-переменные `--c-bg`, `--c-green-1`, `--c-green-2`, `--c-accent`, `--c-text`, `--c-light`, `--c-ink`, `--c-black`; классы `.btn`, `.btn--primary`, `.section`, `.section--dark`, `.section--light`, `.section--black`.

- [ ] **Step 1: Скачать шрифты** с `cdn.jsdelivr.net/npm/@fontsource-variable/manrope/files/` (cyrillic и latin, wght) и `@fontsource/jetbrains-mono/files/` (cyrillic и latin, 400) в `assets/fonts/`; `@font-face` в `tokens.css` с `font-display: swap`.
- [ ] **Step 2: Write the failing test** `tests/structure.test.js` (читает `index.html` как текст): присутствуют заголовок hero из Global Constraints, метка из Global Constraints, текст «Обсудить проект» и «Написать в Telegram», ссылка `https://t.me/radmila_direct`, `lang="ru"`, `<meta name="viewport"`, все семь якорей; текст `+7 (930)` и `850 1004` в разметке отсутствуют.
- [ ] **Step 3: Run** `node --test tests/structure.test.js` — FAIL.
- [ ] **Step 4: Implement** `index.html`, шапка закреплена, меню сворачивается на телефоне без JS (чекбокс-меню или `<details>`), hero по макету из брейншторма (две кнопки, микротекст, место под карточку демо-бота, строка доказательства из Global Constraints). Стили mobile-first.
- [ ] **Step 5: Run** — PASS; открыть страницу в Chrome headless на 360 px и 1440 px, скриншоты без горизонтального скролла.
- [ ] **Step 6: Commit** `feat: header and hero`.

---

### Task 4: Блок 02 «Что я делаю»

**Files:**
- Modify: `index.html` (секция `#services`), `assets/css/sections.css`
- Test: `tests/structure.test.js` (добавить), `tests/services-sync.test.js`

**Interfaces:**
- Consumes: `SERVICES` из `pricing.js`.

- [ ] **Step 1: Write the failing tests**: в `index.html` пять карточек услуг с заголовками дословно из tz.md (блок 02); для каждой услуги в карточке есть текст цены `от N ₽` и срок, совпадающие с `SERVICES[id].base` и `weeks` из `pricing.js` (тест импортирует `pricing.js` и сверяет с HTML); присутствует подпись «Окончательная цена зависит от задач. Оценку дам бесплатно.»
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** разметку пяти карточек с `data-service="site|quiz|calculator|bot|agent"` и ссылкой «Рассчитать» на `#calculator`.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `feat: services section`.

---

### Task 5: Блок 04 «Калькулятор» (UI)

**Files:**
- Create: `assets/js/calculator.js`
- Modify: `index.html` (секция `#calculator`), `assets/css/sections.css`
- Test: `tests/calculator-ui.test.js`

**Interfaces:**
- Consumes: `SERVICES`, `calculate`, `formatRange`, `formatWeeks`, `buildRequestText` из `pricing.js`; `telegramLink` из `links.js`.
- Produces: `initCalculator(root: HTMLElement): void` (подключается в `main.js`); чистая функция `nextState(state, event): State` с `State = { serviceId: ServiceId | null, answers: Record<string,string> }` и событиями `{type:'pick-service', id}`, `{type:'answer', questionId, optionId}`, `{type:'reset'}`.

- [ ] **Step 1: Write the failing tests** на `nextState`: выбор услуги сбрасывает ответы; ответ записывается по `questionId`; повторный ответ на тот же вопрос заменяет предыдущий; `reset` возвращает `{serviceId:null, answers:{}}`; неизвестный `id` услуги не меняет состояние.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** `nextState` и `initCalculator`: шаги выбор услуги → вопросы → результат с диапазоном цены и срока и пометкой «Ориентировочно, точную цену назову после обсуждения»; кнопка «Отправить расчёт мне в Telegram» ведёт на `telegramLink(buildRequestText(...))`; пока услуга не выбрана, кнопка не показывается; в разметке внутри `#calculator` лежит `<noscript>` с заглушкой из Global Constraints.
- [ ] **Step 4: Run** — PASS; в Chrome вручную пройти сценарий «сайт → 4–6 страниц → индивидуальный дизайн» и убедиться, что диапазон равен `55 000–72 000 ₽`.
- [ ] **Step 5: Commit** `feat: cost calculator`.

---

### Task 6: Демо-квиз

**Files:**
- Create: `assets/js/quiz.js`
- Modify: `index.html` (карточка и контейнер демо-квиза внутри `#works`), `assets/css/sections.css`
- Test: `tests/quiz.test.js`

**Interfaces:**
- Produces: `createQuiz(steps: QuizStep[]): Quiz`; `QuizStep = { id, question, options: { id, label }[] }`; `Quiz = { current(): QuizStep | null, answer(optionId): void, back(): void, result(): { summary: string } | null, restart(): void }`; `SALON_STEPS: QuizStep[]` (тема «запись в салон красоты», 4 шага: услуга, мастер, день, время — содержание на усмотрение исполнителя); `initQuiz(root): void`.

- [ ] **Step 1: Write the failing tests**: на старте `current()` — первый шаг, `result()` — null; после ответа на все шаги `current()` — null, `result().summary` содержит выбранные подписи; `back()` на первом шаге ничего не ломает; `back()` после ответа возвращает предыдущий шаг и позволяет сменить ответ; повторный `answer` с тем же `optionId` не продвигает квиз дважды; `answer` с неизвестным `optionId` игнорируется; `restart()` возвращает на первый шаг.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** `createQuiz`, `SALON_STEPS`, `initQuiz` (кнопки-варианты, кнопка «Назад», итог «Записаться: …» с кнопкой в Telegram, подпись «Демо-сценарий»); `<noscript>` заглушка.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `feat: demo quiz`.

---

### Task 7: Демо-бот (hero и блок 03)

**Files:**
- Create: `assets/js/bot-demo.js`
- Modify: `index.html` (карточка бота в hero и полный сценарий в `#works`), `assets/css/sections.css`
- Test: `tests/bot-demo.test.js`

**Interfaces:**
- Produces: `createBot(script: BotScript): Bot`; `BotScript = { start: string, nodes: Record<string, { bot: string, replies: { label: string, next: string }[] }> }`; `Bot = { messages(): { from: 'bot'|'me', text: string }[], replies(): { label: string }[], choose(label: string): void, restart(): void, finished(): boolean }`; `BOOKING_SCRIPT: BotScript` (диалог из tz.md: «Здравствуйте! На какую услугу записать?» → «Маникюр, завтра» → «Свободно 11:00 и 15:30. Какое время?» → подтверждение); `initBot(root): void`.

- [ ] **Step 1: Write the failing tests**: на старте `messages()` содержит приветствие из tz.md и `replies()` не пуст; `choose('Маникюр, завтра')` добавляет реплику `me` и следующий ответ бота; выбор несуществующего варианта игнорируется; `finished()` истинно после последнего узла и `replies()` пуст; повторный `choose` после завершения ничего не меняет; `restart()` возвращает к приветствию; все `next` в `BOOKING_SCRIPT` указывают на существующие узлы.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** движок и `initBot` (варианты ответа кнопками, без текстового ввода, подпись «Демо-сценарий», кнопка «Сначала»); анимация появления сообщений только `opacity`/`transform`.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `feat: demo bot`.

---

### Task 8: Блок 03 «Работы и живые демо»

**Files:**
- Create: `assets/js/works.js`, `assets/img/kapibara.webp` (скриншот живого сайта)
- Modify: `index.html` (секция `#works`)
- Test: `tests/works.test.js`

**Interfaces:**
- Produces: `WORKS: Work[]`, `Work = { id, title, task, done, stack: string[], kind: 'site'|'demo', url?: string, repo?: string, anchor?: string }`; `renderWorks(root, works): void`.

- [ ] **Step 1: Write the failing tests**: `WORKS` содержит `«Дом Капибара»` с `url` `https://kuzinaradmila1076-source.github.io/dom-kapibara/` и `repo` `https://github.com/kuzinaradmila1076-source/dom-kapibara`; ещё три `demo`-записи (квиз, калькулятор с `anchor: '#calculator'`, бот); у каждой непустые `task`, `done`, `stack`; в `index.html` присутствует подпись «Учебные проекты. Здесь будут реальные кейсы, когда они появятся».
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** данные и отрисовку; карточки с кнопкой «Открыть» или «Попробовать»; скриншот сделать Chrome headless с живого URL, сжать в webp, `loading="lazy"`, заданные `width`/`height` для CLS; карточки видны в разметке без JS (рендер на сервере не нужен: разметка пишется в `index.html`, `renderWorks` лишь обновляет).
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `feat: works section`.

---

### Task 9: Блоки 05–08 и подвал

**Files:**
- Create: `assets/img/radmila.webp` (из `C:\Users\73B5~1\AppData\Local\Temp\claude\c--Users--------------Documents-projects-my-landing\70c4d78f-422b-44a7-862a-1696b7667a26\images\1.jpg`, скопировать в `assets/img/` в начале этой задачи и оптимизировать)
- Modify: `index.html`, `assets/css/sections.css`
- Test: `tests/structure.test.js` (добавить)

- [ ] **Step 1: Write the failing tests**: пять шагов процесса, второй называется «Глубокий анализ ниши и конкурентов»; условия 30% / 40% / 30%, «2 круга правок», «14 дней»; семь вопросов FAQ внутри `<details>`; блок «Обо мне» содержит «Кузина Радмила» и `<img` с непустым `alt`; финальный заголовок «Расскажите о задаче, отвечу в течение дня»; ссылки `mailto:radmila-web@yandex.ru`, `tel:+79308501004`; подвал содержит «ИП Кузина Радмила», `326680000013067`, `681101943762`, «Транспортная 78/30» и три ссылки на `project1003106.tilda.ws`; выдуманные отзывы отсутствуют (в разметке нет слов «отзыв» в блоке доказательств).
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** блоки по текстам tz.md (05 процесс и условия, 06 обо мне, 07 FAQ на `<details>` без JS, 08 финальный CTA с блоком «Что будет после заявки», подвал); тексты дословно из tz.md.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `feat: process, about, faq, contact, footer`.

---

### Task 10: Анимации и смена секций

**Files:**
- Create: `assets/css/motion.css`, `assets/js/reveal.js`, `assets/js/main.js`
- Modify: `index.html` (подключение CSS и `<script type="module" src="assets/js/main.js">`)
- Test: `tests/motion.test.js`

**Interfaces:**
- Produces: `initReveal(root: Document | HTMLElement): void`; `main.js` вызывает `initCalculator`, `initQuiz`, `initBot`, `renderWorks`, `initReveal`, `initAnalytics`.

- [ ] **Step 1: Write the failing tests** (чтение `motion.css` как текст): все объявления `animation-timeline` лежат внутри `@supports (animation-timeline: view())`; в файле есть `@media (prefers-reduced-motion: reduce)` с `animation: none`/`transition: none`; нет `opacity: 0` вне `@supports`, вне `@media (prefers-reduced-motion: no-preference)` и вне селекторов `.js-reveal`; нет свойств анимации кроме `transform`, `opacity`, `filter`; нет слов `loader`, `cursor: none`.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** `motion.css`: проявление hero построчно (blur → чётко, один раз), появление блоков через `view()` под `@supports`, плавная смена фона секций зелёная → светлая → чёрная → зелёная, hover/focus кнопок; `reveal.js` добавляет `.js-reveal` и `.is-visible` через IntersectionObserver только если `CSS.supports('animation-timeline: view()')` ложно и нет reduced-motion.
- [ ] **Step 4: Run** — PASS; в Chrome проверить скриншотами, что при эмуляции `prefers-reduced-motion: reduce` весь текст виден.
- [ ] **Step 5: Commit** `feat: motion and section transitions`.

---

### Task 11: SEO, Open Graph и аналитика за флагом

**Files:**
- Create: `assets/js/analytics.js`, `assets/img/og.png` (1200×630), `assets/img/favicon.svg`
- Modify: `index.html` (`<head>`)
- Test: `tests/analytics.test.js`, `tests/structure.test.js` (добавить)

**Interfaces:**
- Consumes: `ANALYTICS`, `SITE_URL` из `config.js`.
- Produces: `initAnalytics(config = ANALYTICS): { active: boolean }`; `trackGoal(name: string): void` (ничего не делает при выключенной аналитике).

- [ ] **Step 1: Write the failing tests**: при `enabled: false` `initAnalytics` возвращает `{active:false}` и не создаёт `<script>` и баннер; при `enabled: true` без `counterId` тоже не активируется; `trackGoal` при неактивной аналитике не бросает исключений; в `index.html` есть `<title>`, `<meta name="description"`, `og:title`, `og:description`, `og:image` и `<link rel="canonical"` с `https://kuzinaradmila1076-source.github.io/my-landing/`.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** `analytics.js`: цели «клик Telegram», «запуск калькулятора», «запуск демо», «открытие кейса»; баннер cookies со ссылкой на политику конфиденциальности, только при активной аналитике; навесить `data-goal` на соответствующие элементы.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `feat: seo, open graph, flagged analytics`.

---

### Task 12: Проверка и публикация

**Files:**
- Modify: по результатам проверки
- Test: все `tests/*.test.js`

- [ ] **Step 1: Run** `npm test` — все тесты PASS.
- [ ] **Step 2: Lighthouse**: поднять `npx serve .`, затем `npx lighthouse http://localhost:3000 --preset=desktop` и мобильный профиль по умолчанию; ожидаемо LCP ≤ 2,5 с, CLS ≤ 0,1, без критичных ошибок доступности. Исправить найденное.
- [ ] **Step 3: Визуальная проверка** Chrome headless на 360, 768 и 1440 px: нет горизонтального скролла, текст читается на всех фонах, калькулятор, квиз и бот проходятся до конца; повторить с эмуляцией `prefers-reduced-motion: reduce` и с отключённым JS (весь основной текст на месте).
- [ ] **Step 4: Спросить заказчика** (внешнее действие): создать пустой публичный репозиторий `my-landing` в аккаунте `kuzinaradmila1076-source` и включить Pages (Settings → Pages → `main`, `/ (root)`) самой или установить `gh` и войти. Без её ответа не публиковать.
- [ ] **Step 5: Push** `git remote add origin https://github.com/kuzinaradmila1076-source/my-landing.git`, `git push -u origin main`.
- [ ] **Step 6: Verify live** `curl -s -o /dev/null -w "%{http_code}" https://kuzinaradmila1076-source.github.io/my-landing/` возвращает `200`; открыть главную, проверить ссылки Telegram, почту, «Позвонить», «Дом Капибара», три документа в подвале.
- [ ] **Step 7: Commit** `chore: verification fixes` (если были правки).

---

## Self-review

- **Покрытие ТЗ:** цель и аудитория (hero, Task 3), 9 блоков (Task 3, 4, 5, 8, 9), цены и калькулятор (Task 2, 4, 5), демо-квиз и бот (Task 6, 7), стиль и шрифты (Task 3), анимации (Task 10), SEO и аналитика (Task 11), приёмка и публикация (Task 12). Блок 03 содержит демо-калькулятор как ссылку на `#calculator` (Task 8).
- **Согласованность имён:** `SERVICES`, `calculate`, `formatRange`, `formatWeeks`, `buildRequestText`, `telegramLink`, `createQuiz`, `createBot`, `WORKS`, `initReveal`, `initAnalytics` определены в Interfaces и не переименовываются в задачах-потребителях.
- **Внешние действия** (создание репозитория, публикация) вынесены в Task 12 с обязательным согласованием.
