export const BOOKING_SCRIPT = {
  start: 'greet',
  nodes: {
    greet: {
      bot: 'Здравствуйте! На какую услугу записать?',
      replies: [
        { label: 'Маникюр, завтра', next: 'time' },
        { label: 'Стрижка, сегодня', next: 'time' },
      ],
    },
    time: {
      bot: 'Свободно 11:00 и 15:30. Какое время?',
      replies: [
        { label: '11:00', next: 'done' },
        { label: '15:30', next: 'done' },
      ],
    },
    done: {
      bot: 'Готово, вы записаны. Напомню за час до визита.',
      replies: [],
    },
  },
};

export function createBot(script) {
  let node;
  let log;

  function restart() {
    node = script.start;
    log = [{ from: 'bot', text: script.nodes[node].bot }];
  }
  restart();

  return {
    messages: () => [...log],
    replies: () => script.nodes[node].replies.map(({ label }) => ({ label })),
    finished: () => script.nodes[node].replies.length === 0,
    choose(label) {
      const reply = script.nodes[node].replies.find((r) => r.label === label);
      if (!reply) return;
      node = reply.next;
      log = [...log, { from: 'me', text: label }, { from: 'bot', text: script.nodes[node].bot }];
    },
    restart,
  };
}

function emitGoal(name) {
  document.dispatchEvent(new CustomEvent('landing:goal', { detail: name }));
}

export function initBot(root) {
  if (!root) return;
  const bot = createBot(BOOKING_SCRIPT);
  let started = false;

  function render() {
    root.innerHTML = `
      <p class="label">Демо-бот · демо-сценарий</p>
      <div class="bot__log" role="log" aria-live="polite">${bot
        .messages()
        .map((m) => `<p class="bot__msg bot__msg--${m.from}">${m.text}</p>`)
        .join('')}</div>
      <div class="bot__replies">${bot
        .replies()
        .map((r) => `<button type="button" class="bot__reply" data-reply="${r.label}">${r.label}</button>`)
        .join('')}</div>
      ${bot.finished() ? '<button type="button" class="quiz__back" data-restart>Сначала</button>' : ''}`;
  }

  root.addEventListener('click', (e) => {
    const reply = e.target.closest('[data-reply]');
    if (reply) {
      if (!started) {
        started = true;
        emitGoal('bot');
      }
      bot.choose(reply.dataset.reply);
      render();
    } else if (e.target.closest('[data-restart]')) {
      bot.restart();
      render();
    }
  });

  render();
}
