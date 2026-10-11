// Безопасный запуск интерактивных блоков: если модуль не загрузился или упал,
// вместо пустой карточки показываем заглушку со ссылкой на Telegram.
export const STUB_HTML =
  '<p class="stub">Включите JavaScript или напишите в Telegram: <a href="https://t.me/radmila_direct">@radmila_direct</a></p>';

export async function bootModule(importFn, run, mounts) {
  const targets = mounts.filter(Boolean);
  try {
    const mod = await importFn();
    for (const mount of targets) run(mod, mount);
  } catch {
    for (const mount of targets) mount.innerHTML = STUB_HTML;
  }
}
