import test from 'node:test';
import assert from 'node:assert/strict';
import { nextPosition, shouldStartFade, fadeGains } from './crossfade.js';

test('nextPosition: advances, stops at the end, wraps for repeat all, stays for repeat one', () => {
  assert.equal(nextPosition(3, 0, 'off'), 1);
  assert.equal(nextPosition(3, 2, 'off'), null);
  assert.equal(nextPosition(3, 2, 'all'), 0);
  assert.equal(nextPosition(3, 1, 'one'), 1);
  assert.equal(nextPosition(0, 0, 'all'), null);
  assert.equal(nextPosition(1, 0, 'all'), 0);
});
test('shouldStartFade: only inside the last fadeSec, never when off, unknown length or tiny songs', () => {
  const f = (currentTime, duration, fadeSec) => shouldStartFade({ currentTime, duration, fadeSec });
  assert.equal(f(190, 200, 6), false);
  assert.equal(f(194, 200, 6), true);
  assert.equal(f(199, 200, 0), false);
  assert.equal(f(5, NaN, 6), false);
  assert.equal(f(5, 10, 6), false);
});
test('fadeGains: equal power, clamped', () => {
  assert.deepEqual(fadeGains(0), { out: 1, in: 0 });
  const mid = fadeGains(0.5);
  assert.ok(Math.abs(mid.out ** 2 + mid.in ** 2 - 1) < 1e-9);
  assert.equal(fadeGains(2).out < 1e-9, true);
  assert.equal(fadeGains(-1).in, 0);
});
