import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";

vi.mock("../services/recentlyPlayedService", () => ({ recentlyPlayedService: { recordPlay: () => Promise.resolve() } }));
vi.mock("../services/statsService", () => ({ statsService: { recordListen: () => Promise.resolve() } }));
import { PlayerProvider } from "../context/PlayerContext";
import { usePlayer } from "../hooks/usePlayer";

let audios, iosLike;
beforeEach(() => {
  audios = [];
  window.Audio = function () {
    const a = document.createElement("audio");
    a.play = vi.fn(() => Promise.resolve());
    a.pause = vi.fn();
    a.load = vi.fn();
    let t = 0, ready = 0, vol = 1;
    Object.defineProperty(a, "currentTime", { get: () => t, set: (v) => (t = v), configurable: true });
    Object.defineProperty(a, "readyState", { get: () => ready, set: (v) => (ready = v), configurable: true });
    Object.defineProperty(a, "duration", { value: 200, configurable: true });
    if (iosLike) Object.defineProperty(a, "volume", { get: () => 1, set: () => {}, configurable: true });
    else Object.defineProperty(a, "volume", { get: () => vol, set: (v) => (vol = v), configurable: true });
    audios.push(a);
    return a;
  };
  iosLike = false;
});
afterEach(cleanup);

const songs = ["a", "b", "c"].map((id) => ({ _id: id, title: id, audioUrl: `/u/${id}.mp3` }));
const setup = () => renderHook(() => usePlayer(), { wrapper: PlayerProvider });
const id = (el) => el.src.match(/\/u\/(\w)\.mp3/)?.[1] ?? null;
const fire = (el, type) => act(() => { el.dispatchEvent(new Event(type)); });
const tick = (el, t) => { el.currentTime = t; fire(el, "timeupdate"); };

test("two decks are created up front where volume is controllable; one on iOS-like browsers", () => {
  setup();
  expect(audios.length).toBe(2);
  cleanup(); iosLike = true; audios = [];
  setup();
  expect(audios.length).toBe(1);
});
test("preloads the next song on the idle deck only after 5s, and only once", () => {
  const { result } = setup();
  act(() => result.current.playSong(songs[0], songs));
  const [d0, d1] = audios;
  tick(d0, 3);
  expect(id(d1)).toBeNull();
  tick(d0, 6);
  expect(id(d1)).toBe("b");
  expect(d1.load).toHaveBeenCalledTimes(1);
  tick(d0, 7);
  expect(d1.load).toHaveBeenCalledTimes(1);
});
test("no preload for repeat-one, or at the end of the queue", () => {
  const { result } = setup();
  act(() => result.current.playSong(songs[2], songs));
  tick(audios[0], 6);
  expect(id(audios[1])).toBeNull();
  act(() => { result.current.cycleRepeatMode(); result.current.cycleRepeatMode(); });
  act(() => result.current.playSong(songs[0], songs));
  tick(audios[0], 6);
  expect(id(audios[1])).toBeNull();
});
test("ended with the next song buffered: switches decks without reloading, state follows", () => {
  const { result } = setup();
  act(() => result.current.playSong(songs[0], songs));
  const [d0, d1] = audios;
  tick(d0, 6);
  d1.readyState = 4;
  const loadsBefore = d1.load.mock.calls.length;
  fire(d0, "ended");
  expect(result.current.currentSong._id).toBe("b");
  expect(d1.play).toHaveBeenCalled();
  expect(d1.load.mock.calls.length).toBe(loadsBefore);
  expect(id(d1)).toBe("b");
  expect(id(d0)).toBeNull(); // old deck released
  expect(result.current.duration).toBe(200);
  expect(result.current.isPlaying).toBe(true);
  expect(result.current.isLoading).toBe(false);
  // the new deck is now the one that drives state, and the old deck's events are ignored
  tick(d1, 9);
  expect(result.current.currentTime).toBe(9);
  fire(d0, "pause");
  expect(result.current.isPlaying).toBe(true);
  tick(d0, 50);
  expect(result.current.currentTime).toBe(9);
});
test("ended with the next song NOT buffered: falls back to a normal load", () => {
  const { result } = setup();
  act(() => result.current.playSong(songs[0], songs));
  const [d0, d1] = audios;
  tick(d0, 6);
  d1.readyState = 1;
  fire(d0, "ended");
  expect(result.current.currentSong._id).toBe("b");
  expect(id(d0)).toBe("b"); // same deck reloaded
  expect(d0.load).toHaveBeenCalled();
});
test("Next button uses the preloaded deck too; Previous then works on the new active deck", () => {
  const { result } = setup();
  act(() => result.current.playSong(songs[0], songs));
  const [d0, d1] = audios;
  tick(d0, 6);
  d1.readyState = 4;
  act(() => result.current.playNext());
  expect(result.current.currentSong._id).toBe("b");
  expect(d0.pause).toHaveBeenCalled();
  expect(id(d1)).toBe("b");
  d1.currentTime = 20;
  act(() => result.current.playPrevious());
  expect(d1.currentTime).toBe(0); // restarted on the deck that is playing now
});
test("a chain of songs keeps ping-ponging between decks", () => {
  const { result } = setup();
  act(() => result.current.playSong(songs[0], songs));
  const [d0, d1] = audios;
  tick(d0, 6); d1.readyState = 4; fire(d0, "ended");           // a -> b on d1
  tick(d1, 6);
  expect(id(d0)).toBe("c");                                    // c is preloaded on the freed deck
  d0.readyState = 4; fire(d1, "ended");                        // b -> c on d0
  expect(result.current.currentSong._id).toBe("c");
  expect(id(d0)).toBe("c");
  expect(id(d1)).toBeNull();
});
test("sleep timer 'after this song' still stops, even with a song preloaded", () => {
  const { result } = setup();
  act(() => result.current.playSong(songs[0], songs));
  tick(audios[0], 6); audios[1].readyState = 4;
  act(() => result.current.setSleepTimer("song"));
  fire(audios[0], "ended");
  expect(result.current.currentSong._id).toBe("a");
  expect(result.current.isPlaying).toBe(false);
});
test("one-song queue on repeat all loops instead of going silent", () => {
  const { result } = setup();
  act(() => result.current.cycleRepeatMode());
  act(() => result.current.playSong(songs[0], [songs[0]]));
  audios[0].currentTime = 150;
  audios[0].play.mockClear();
  fire(audios[0], "ended");
  expect(audios[0].currentTime).toBe(0);
  expect(audios[0].play).toHaveBeenCalled();
});
test("iOS-like (no volume control): never preloads or swaps; behaves like a single element", () => {
  iosLike = true;
  const { result } = setup();
  act(() => result.current.playSong(songs[0], songs));
  tick(audios[0], 6);
  expect(audios.length).toBe(1);
  fire(audios[0], "ended");
  expect(result.current.currentSong._id).toBe("b");
  expect(id(audios[0])).toBe("b");
});
test("changing the queue re-targets the preload", () => {
  const { result } = setup();
  act(() => result.current.playSong(songs[0], songs));
  tick(audios[0], 6);
  expect(id(audios[1])).toBe("b");
  act(() => result.current.removeFromQueue(1)); // b removed: next is c
  tick(audios[0], 7);
  expect(id(audios[1])).toBe("c");
});
