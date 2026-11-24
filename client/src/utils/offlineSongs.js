import { getMediaUrl } from './format';

// Songs the user chose to keep on this device: { song (metadata), blob } in IndexedDB, keyed by song id.
// `urls` maps id -> blob: URL so the player can ask synchronously whether a song is saved.
const DB = 'offline-songs';
const urls = new Map();
const listeners = new Set();
let ready = null;

const open = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('songs', { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const run = async (mode, fn) => {
  const db = await open();
  return new Promise((resolve, reject) => {
    const store = db.transaction('songs', mode).objectStore('songs');
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

const emit = () => listeners.forEach((l) => l());

/** Reads everything saved so far and prepares the blob URLs. Safe to call many times. */
export const loadOffline = () => {
  ready ??= (typeof indexedDB === 'undefined' ? Promise.resolve([]) : run('readonly', (s) => s.getAll()))
    .then((rows) => {
      rows.forEach((r) => urls.set(r.id, URL.createObjectURL(r.blob)));
      emit();
      return rows.map((r) => r.song);
    })
    .catch(() => []); // private mode etc.: simply no offline songs
  return ready;
};

export const isSaved = (id) => urls.has(id);
export const savedCount = () => urls.size;

/** Source for an <audio>: the saved copy when there is one, else the normal URL. */
export const audioSrc = (song) => urls.get(song._id) || getMediaUrl(song.audioUrl);

export const subscribeOffline = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const listSavedSongs = async () => {
  await loadOffline();
  const rows = await run('readonly', (s) => s.getAll());
  return rows.map((r) => r.song);
};

export const saveOffline = async (song) => {
  await loadOffline();
  const res = await fetch(getMediaUrl(song.audioUrl));
  if (!res.ok) throw new Error('Could not download this song');
  const blob = await res.blob();
  await run('readwrite', (s) => s.put({ id: song._id, song, blob }));
  urls.set(song._id, URL.createObjectURL(blob));
  navigator.storage?.persist?.().catch(() => {}); // ask the browser not to evict saved songs
  emit();
};

export const removeOffline = async (id) => {
  await run('readwrite', (s) => s.delete(id));
  const u = urls.get(id);
  if (u) URL.revokeObjectURL(u);
  urls.delete(id);
  emit();
};
