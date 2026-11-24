import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";

vi.mock("../services/recentlyPlayedService", () => ({ recentlyPlayedService: { recordPlay: () => Promise.resolve() } }));
vi.mock("../services/statsService", () => ({ statsService: { recordListen: () => Promise.resolve() } }));
import { PlayerProvider } from "../context/PlayerContext";
import { usePlayer } from "../hooks/usePlayer";

let audios, iosLike;
beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  audios = [];
  iosLike = false;
  window.Audio = function () {
    const a = document.createElement("audio");
    a.play = vi.fn(() => Promise.resolve());
    a.pause = vi.fn();
    a.load = vi.fn();
    let t = 0, ready = 0, vol = 1;
    Object.defineProperty(a, "currentTime", { get: () => t, set: (v) => (t = v), configurable: true });
    Object.defineProperty(a, "readyState", { get: () => ready, set: (v) => (ready = v), configurable: true });
    Object.defineProperty(a, "duration", { value: 200, configurable: true, writable: true });
    if (iosLike) Object.defineProperty(a, "volume", { get: () => 1, set: () => {}, configurable: true });
    else Object.defineProperty(a, "volume", { get: () => vol, set: (v) => (vol = v), configurable: true });
    audios.push(a);
    return a;
  };
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

const songs = ["a", "b", "c"].map((id) => ({ _id: id, title: id, audioUrl: `/u/${id}.mp3` }));
const setup = () => renderHook(() => usePlayer(), { wrapper: PlayerProvider });
const id = (el) => el.src.match(/\/u\/(\w)\.mp3/)?.[1] ?? null;
const fire = (el, type) => act(() => { el.dispatchEvent(new Event(type)); });
const tick = (el, t) => { el.currentTime = t; fire(el, "timeupdate"); };
const wait = (ms) => act(() => { vi.advanceTimersByTime(ms); });

// Song a playing on d0 with b buffered on d1, crossfade 6s, volume 0.8
const ready = () => {
  const r = setup();
  act(() => r.result.current.setCrossfade(6));
  act(() => r.result.current.playSong(songs[0], songs));
  const [d0, d1] = audios;
  tick(d0, 6);
  d1.readyState = 4;
  return { ...r, d0, d1 };
};

test("starts in the last 6s: next song becomes current at once, volumes ramp equal-power, old deck released at the end", () => {
  const { result, d0, d1 } = ready();
  tick(d0, 190);                       // 10s left: too early
  expect(result.current.currentSong._id).toBe("a");
  tick(d0, 195);                       // 5s left: fade starts
  expect(result.current.currentSong._id).toBe("b");
  expect(d1.play).toHaveBeenCalled();
  expect(d1.volume).toBe(0);
  expect(d0.volume).toBeCloseTo(0.8);
  expect(id(d0)).toBe("a");            // still audible
  wait(2500);                          // halfway through a 5s fade
  expect(d0.volume).toBeCloseTo(0.8 * Math.SQRT1_2, 1);
  expect(d1.volume).toBeCloseTo(0.8 * Math.SQRT1_2, 1);
  wait(2600);
  expect(d0.pause).toHaveBeenCalled();
  expect(id(d0)).toBeNull();
  expect(d1.volume).toBeCloseTo(0.8);
  expect(d0.volume).toBeCloseTo(0.8);
});
test("off by default and when the setting is 0: no fade, but the gapless switch still works", () => {
  const r = setup();
  act(() => r.result.current.playSong(songs[0], songs));
  const [d0, d1] = audios;
  tick(d0, 6); d1.readyState = 4;
  tick(d0, 195);
  expect(r.result.current.currentSong._id).toBe("a");
  fire(d0, "ended");
  expect(r.result.current.currentSong._id).toBe("b");
  expect(d1.volume).toBeCloseTo(0.8);
});
test("no fade for very short songs, repeat-one, the last song, or 'after this song' sleep timer", () => {
  let r = ready();
  r.d0.duration = 10; tick(r.d0, 8);
  expect(r.result.current.currentSong._id).toBe("a");
  cleanup(); audios = [];
  r = ready();
  act(() => r.result.current.setSleepTimer("song"));
  tick(r.d0, 195);
  expect(r.result.current.currentSong._id).toBe("a");
  cleanup(); audios = [];
  r = setup();
  act(() => r.result.current.setCrossfade(6));
  act(() => r.result.current.playSong(songs[2], songs));
  tick(audios[0], 6); audios[1].readyState = 4; tick(audios[0], 195);
  expect(r.result.current.currentSong._id).toBe("c");
  cleanup(); audios = [];
  r = setup();
  act(() => r.result.current.setCrossfade(6));
  act(() => { r.result.current.cycleRepeatMode(); r.result.current.cycleRepeatMode(); });
  act(() => r.result.current.playSong(songs[0], songs));
  tick(audios[0], 195);
  expect(r.result.current.currentSong._id).toBe("a");
});
test("waits until the next song is buffered, then fades", () => {
  const { result, d0, d1 } = ready();
  d1.readyState = 1;
  tick(d0, 195);
  expect(result.current.currentSong._id).toBe("a");
  d1.readyState = 4;
  tick(d0, 196);
  expect(result.current.currentSong._id).toBe("b");
});
test("pause during the fade stops BOTH songs and restores volume", () => {
  const { result, d0, d1 } = ready();
  tick(d0, 195); wait(1000);
  act(() => result.current.togglePlay());
  expect(d0.pause).toHaveBeenCalled();
  expect(d1.pause).toHaveBeenCalled();
  expect(id(d0)).toBeNull();
  expect(d1.volume).toBeCloseTo(0.8);
  wait(10000); // the ramp timer must be gone
  expect(d1.volume).toBeCloseTo(0.8);
});
test("the browser/OS pausing the playing deck also ends the fade", () => {
  const { d0, d1 } = ready();
  tick(d0, 195); wait(1000);
  fire(d1, "pause");
  expect(id(d0)).toBeNull();
  expect(d0.pause).toHaveBeenCalled();
});
test("seek, Next, Previous, queue jump and a new playSong during the fade end it first", () => {
  for (const act1 of [(p) => p.seek(30), (p) => p.playNext(), (p) => p.playPrevious(), (p) => p.jumpToQueueIndex(2), (p) => p.playSong(songs[2], songs)]) {
    const { result, d0, d1 } = ready();
    tick(d0, 195); wait(500);
    act(() => act1(result.current));
    expect(d0.pause).toHaveBeenCalled();
    expect(d1.volume).toBeCloseTo(0.8);
    cleanup(); audios = [];
  }
});
test("volume slider works during the fade and the final level is the new one", () => {
  const { result, d0, d1 } = ready();
  tick(d0, 195); wait(1000);
  act(() => result.current.setVolume(0.4));
  wait(5000);
  expect(d1.volume).toBeCloseTo(0.4);
  expect(d0.volume).toBeCloseTo(0.4);
});
test("the fading-out deck's own events are ignored, and the preload never touches it mid-fade", () => {
  const { result, d0, d1 } = ready();
  tick(d0, 195); wait(500);
  fire(d0, "pause");
  expect(result.current.isPlaying).toBe(true);
  tick(d0, 199);
  expect(result.current.currentTime).toBe(0);
  tick(d1, 6);                          // 6s into b, but the fade (5s) has not finished: d0 must keep its song
  wait(0);
  expect(id(d0)).toBe("a");
  wait(5000);
  tick(d1, 7);                          // fade over: the idle deck may preload c now
  expect(id(d0)).toBe("c");
});
test("setting is saved, restored, and invalid stored values mean off", () => {
  let r = setup();
  expect(r.result.current.crossfade).toBe(0);
  act(() => r.result.current.setCrossfade(9));
  act(() => r.result.current.setCrossfade(7)); // not an offered value: ignored
  expect(r.result.current.crossfade).toBe(9);
  expect(localStorage.getItem("crossfadeSec")).toBe("9");
  cleanup();
  r = setup();
  expect(r.result.current.crossfade).toBe(9);
  cleanup();
  localStorage.setItem("crossfadeSec", "banana");
  r = setup();
  expect(r.result.current.crossfade).toBe(0);
});
test("iOS-like: crossfade is reported unsupported and never fades", () => {
  iosLike = true;
  const r = setup();
  expect(r.result.current.crossfadeSupported).toBe(false);
  act(() => r.result.current.setCrossfade(6));
  act(() => r.result.current.playSong(songs[0], songs));
  tick(audios[0], 195);
  expect(r.result.current.currentSong._id).toBe("a");
  expect(audios.length).toBe(1);
});
test("a failed play() on the incoming deck ends the fade instead of leaving two songs", async () => {
  const { result, d0, d1 } = ready();
  d1.play = vi.fn(() => Promise.reject(new Error("blocked")));
  tick(d0, 195);
  await act(async () => { await Promise.resolve(); });
  expect(result.current.isPlaying).toBe(false);
  expect(d0.pause).toHaveBeenCalled();
});
