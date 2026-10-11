import test from 'node:test';
import assert from 'node:assert/strict';
import { bootModule, STUB_HTML } from '../assets/js/boot.js';
import { isRepeatClick } from '../assets/js/clicks.js';

const mount = () => ({ innerHTML: 'original' });

test('a module that loads is run on its mounts and the mounts are left alone', async () => {
  const mounts = [mount(), mount()];
  const seen = [];
  await bootModule(async () => ({ init: (m) => seen.push(m) }), (mod, m) => mod.init(m), mounts);
  assert.equal(seen.length, 2);
  assert.deepEqual(mounts.map((m) => m.innerHTML), ['original', 'original']);
});

test('a module that fails to load puts the stub into every mount instead of leaving them blank', async () => {
  const mounts = [mount(), mount()];
  await bootModule(async () => { throw new Error('404'); }, () => {}, mounts);
  for (const m of mounts) {
    assert.equal(m.innerHTML, STUB_HTML);
    assert.ok(m.innerHTML.includes('Включите JavaScript или напишите в Telegram'));
    assert.ok(m.innerHTML.includes('https://t.me/radmila_direct'));
  }
});

test('an init function that throws also falls back to the stub', async () => {
  const mounts = [mount()];
  await bootModule(async () => ({}), () => { throw new Error('boom'); }, mounts);
  assert.equal(mounts[0].innerHTML, STUB_HTML);
});

test('missing mounts (null) are skipped without error', async () => {
  await assert.doesNotReject(bootModule(async () => { throw new Error('x'); }, () => {}, [null, mount()]));
});

test('isRepeatClick is true only for the second and later click of a multi-click', () => {
  assert.equal(isRepeatClick({ detail: 2 }), true);
  assert.equal(isRepeatClick({ detail: 3 }), true);
  assert.equal(isRepeatClick({ detail: 1 }), false);
  assert.equal(isRepeatClick({ detail: 0 }), false); // клавиатура: Enter и пробел
  assert.equal(isRepeatClick({}), false);
});
