// Браузерные проверки (не входят в `npm test`): npm run e2e
// Нужен Chrome: путь берётся из CHROME_PATH или стандартного места установки на Windows.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };

const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const body = await readFile(join(root, p));
    res.writeHead(200, { 'content-type': types[extname(p)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push([true, name]);
  } catch (e) {
    results.push([false, `${name}: ${e.message}`]);
  }
}
const ok = (cond, msg) => { if (!cond) throw new Error(msg); };

async function open(opts = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width: opts.width ?? 1280, height: 900, isMobile: !!opts.mobile, hasTouch: !!opts.mobile });
  if (opts.block) {
    await page.setRequestInterception(true);
    page.on('request', (r) => (r.url().includes(opts.block) ? r.abort() : r.continue()));
  }
  await page.goto(base, { waitUntil: 'networkidle0' });
  return page;
}

await check('a module that fails to load leaves the stub, and the other modules still work', async () => {
  const page = await open({ block: 'bot-demo.js' });
  const hero = await page.$eval('[data-bot="hero"]', (e) => e.textContent);
  ok(hero.includes('Включите JavaScript или напишите в Telegram'), 'hero bot card should show the stub');
  ok((await page.$('.calc__picker')) !== null, 'calculator should still work');
  await page.close();
});

await check('double-clicking a quiz answer advances only one step', async () => {
  const page = await open();
  await page.click('.quiz__option', { count: 2 });
  const label = await page.$eval('.quiz .label', (e) => e.textContent);
  ok(label.includes('шаг 2 из 4'), `expected step 2, got "${label}"`);
  await page.close();
});

await check('the demo bot keeps keyboard focus and its live region across turns', async () => {
  const page = await open();
  await page.evaluate(() => { document.querySelector('[data-bot="hero"] .bot__log').dataset.same = '1'; });
  await page.focus('[data-bot="hero"] .bot__reply');
  await page.keyboard.press('Enter');
  const state = await page.evaluate(() => ({
    inBot: !!document.activeElement.closest('[data-bot="hero"]'),
    same: document.querySelector('[data-bot="hero"] .bot__log').dataset.same === '1',
    msgs: document.querySelectorAll('[data-bot="hero"] .bot__msg').length,
  }));
  ok(state.inBot, 'focus should stay inside the bot card');
  ok(state.same, 'the live region element must not be re-created');
  ok(state.msgs === 3, `expected 3 messages, got ${state.msgs}`);
  await page.close();
});

await check('the focus ring is not mint on light sections and white cards', async () => {
  const page = await open();
  await page.keyboard.press('Tab');
  const ring = async (selector) => {
    await page.focus(selector);
    await page.keyboard.press('Shift');
    return page.$eval(selector, (e) => ({ colour: getComputedStyle(e).outlineColor, visible: e.matches(':focus-visible') }));
  };
  for (const selector of ['.service-card a', '.quiz__option', '.calc__chip']) {
    const r = await ring(selector);
    ok(r.visible, `${selector} should match :focus-visible`);
    ok(r.colour !== 'rgb(61, 240, 138)', `${selector} ring is mint (${r.colour})`);
  }
  await page.close();
});

await check('the mobile menu closes after choosing a link', async () => {
  const page = await open({ width: 360, mobile: true });
  await page.tap('.menu summary');
  ok(await page.$eval('.menu', (e) => e.open), 'menu should open');
  await page.tap('.menu nav a[href="#calculator"]');
  ok(!(await page.$eval('.menu', (e) => e.open)), 'menu should close after navigation');
  await page.close();
});

await browser.close();
server.close();
for (const [pass, msg] of results) console.log(`${pass ? 'PASS' : 'FAIL'}  ${msg}`);
const failed = results.filter(([p]) => !p).length;
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
