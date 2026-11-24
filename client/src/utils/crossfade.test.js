import { test, expect } from 'vitest';
import { nextPosition, shouldStartFade, fadeGains } from './crossfade.js';

test('nextPosition: advances, stops at the end, wraps for repeat all, stays for repeat one', () => {
  expect(nextPosition(3, 0, 'off')).toBe(1);
  expect(nextPosition(3, 2, 'off')).toBeNull();
  expect(nextPosition(3, 2, 'all')).toBe(0);
  expect(nextPosition(3, 1, 'one')).toBe(1);
  expect(nextPosition(0, 0, 'all')).toBeNull();
  expect(nextPosition(1, 0, 'all')).toBe(0);
});
test('shouldStartFade: only inside the last fadeSec, never when off, unknown length or tiny songs', () => {
  const f = (currentTime, duration, fadeSec) => shouldStartFade({ currentTime, duration, fadeSec });
  expect(f(190, 200, 6)).toBe(false);
  expect(f(194, 200, 6)).toBe(true);
  expect(f(199, 200, 0)).toBe(false);
  expect(f(5, NaN, 6)).toBe(false);
  expect(f(5, 10, 6)).toBe(false);
});
test('fadeGains: equal power, clamped', () => {
  expect(fadeGains(0)).toEqual({ out: 1, in: 0 });
  const mid = fadeGains(0.5);
  expect(Math.abs(mid.out ** 2 + mid.in ** 2 - 1)).toBeLessThan(1e-9);
  expect(fadeGains(2).out).toBeLessThan(1e-9);
  expect(fadeGains(-1).in).toBe(0);
});
