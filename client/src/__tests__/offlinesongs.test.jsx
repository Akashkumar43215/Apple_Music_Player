import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { test, expect, vi, beforeEach } from 'vitest';

const song = { _id: 's1', title: 'T', artist: 'A', audioUrl: 'https://cdn.example/s1.mp3' };

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory(); // every test starts with an empty database
  vi.resetModules();
  URL.createObjectURL = vi.fn(() => 'blob:saved-s1');
  URL.revokeObjectURL = vi.fn();
  globalThis.fetch = vi.fn(async () => ({ ok: true, blob: async () => new Blob(['x']) }));
});

test('saving makes the player use the local copy; removing goes back to the network URL', async () => {
  const m = await import('../utils/offlineSongs');
  expect(m.audioSrc(song)).toBe('https://cdn.example/s1.mp3');
  await m.saveOffline(song);
  expect(m.isSaved('s1')).toBe(true);
  expect(m.audioSrc(song)).toBe('blob:saved-s1');
  expect((await m.listSavedSongs()).map((s) => s._id)).toEqual(['s1']);
  await m.removeOffline('s1');
  expect(m.audioSrc(song)).toBe('https://cdn.example/s1.mp3');
});

test('a saved song is found again after a reload', async () => {
  let m = await import('../utils/offlineSongs');
  await m.saveOffline(song);
  vi.resetModules();
  m = await import('../utils/offlineSongs');
  await m.loadOffline();
  expect(m.isSaved('s1')).toBe(true);
});

test('a failed download saves nothing', async () => {
  const m = await import('../utils/offlineSongs');
  globalThis.fetch = vi.fn(async () => ({ ok: false }));
  await expect(m.saveOffline(song)).rejects.toThrow();
  expect(m.isSaved('s1')).toBe(false);
});
