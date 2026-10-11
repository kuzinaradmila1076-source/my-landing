// Классический (не модульный) скрипт: загружается даже там, где модули заблокированы
// (например, страница открыта двойным кликом как файл). Если главный модуль не стартовал,
// пустые окна демо получают заглушку со ссылкой на Telegram.
(function () {
  var STUB =
    '<p class="stub">Включите JavaScript или напишите в Telegram: <a href="https://t.me/radmila_direct">@radmila_direct</a></p>';
  setTimeout(function () {
    if (window.__landingReady) return;
    var mounts = document.querySelectorAll('[data-bot], [data-quiz], [data-calculator]');
    for (var i = 0; i < mounts.length; i++) mounts[i].innerHTML = STUB;
  }, 3000);
})();
