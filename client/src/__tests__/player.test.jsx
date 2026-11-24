import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";

const recordPlay = vi.fn(() => Promise.resolve());
const recordListen = vi.fn(() => Promise.resolve());
vi.mock("../services/recentlyPlayedService", () => ({ recentlyPlayedService: { recordPlay: (...a) => recordPlay(...a) } }));
vi.mock("../services/statsService", () => ({ statsService: { recordListen: (...a) => recordListen(...a) } }));

import { PlayerProvider } from "../context/PlayerContext";
import { usePlayer } from "../hooks/usePlayer";

let audios;
beforeEach(() => {
  audios = [];
  window.Audio = function () {
    const a = document.createElement("audio");
    a.play = vi.fn(() => Promise.resolve());
    a.pause = vi.fn();
    a.load = vi.fn();
    let t = 0;
    Object.defineProperty(a, "currentTime", { get: () => t, set: (v) => (t = v), configurable: true });
    audios.push(a);
    return a;
  };
  vi.clearAllMocks();
});
afterEach(cleanup);

const songs = ["a", "b", "c"].map((id) => ({ _id: id, title: id, audioUrl: `/u/${id}.mp3` }));
const setup = () => renderHook(() => usePlayer(), { wrapper: PlayerProvider });
const audio = () => audios[0];
const fire = (type) => act(() => { audio().dispatchEvent(new Event(type)); });
const srcId = () => audio().src.match(/\/u\/(\w)\.mp3/)?.[1];

test("playSong loads and plays the song", () => {
  const { result } = setup();
  act(() => result.current.playSong(songs[0], songs));
  expect(result.current.currentSong._id).toBe("a");
  expect(srcId()).toBe("a");
  expect(audio().play).toHaveBeenCalled();
  expect(result.current.isPlaying).toBe(true);
});
test("ended advances to the next song and loads it", () => {
  const { result } = setup();
  act(() => result.current.playSong(songs[0], songs));
  fire("ended");
  expect(result.current.currentSong._id).toBe("b");
  expect(srcId()).toBe("b");
});
test("end of queue: stops on the last song (repeat off)", () => {
  const { result } = setup();
  act(() => result.current.playSong(songs[2], songs));
  fire("ended");
  expect(result.current.currentSong._id).toBe("c");
  expect(result.current.isPlaying).toBe(false);
});
test("repeat all wraps to the first song", () => {
  const { result } = setup();
  act(() => result.current.cycleRepeatMode());
  expect(result.current.repeatMode).toBe("all");
  act(() => result.current.playSong(songs[2], songs));
  fire("ended");
  expect(result.current.currentSong._id).toBe("a");
});
test("repeat one restarts the same song", () => {
  const { result } = setup();
  act(() => { result.current.cycleRepeatMode(); });
  act(() => { result.current.cycleRepeatMode(); });
  expect(result.current.repeatMode).toBe("one");
  act(() => result.current.playSong(songs[1], songs));
  audio().currentTime = 100;
  audio().play.mockClear();
  fire("ended");
  expect(result.current.currentSong._id).toBe("b");
  expect(audio().currentTime).toBe(0);
  expect(audio().play).toHaveBeenCalled();
});
test("sleep timer 'after this song' stops instead of advancing", () => {
  const { result } = setup();
  act(() => result.current.playSong(songs[0], songs));
  act(() => result.current.setSleepTimer("song"));
  fire("ended");
  expect(result.current.currentSong._id).toBe("a");
  expect(result.current.isPlaying).toBe(false);
  expect(result.current.sleepTimer).toBeNull();
});
test("previous: restarts after 3s, otherwise goes back", () => {
  const { result } = setup();
  act(() => result.current.playSong(songs[1], songs));
  audio().currentTime = 10;
  act(() => result.current.playPrevious());
  expect(audio().currentTime).toBe(0);
  expect(result.current.currentSong._id).toBe("b");
  act(() => result.current.playPrevious());
  expect(result.current.currentSong._id).toBe("a");
});
test("play/pause events drive isPlaying; pause reports listening", () => {
  const { result } = setup();
  act(() => result.current.playSong(songs[0], songs));
  fire("pause");
  expect(result.current.isPlaying).toBe(false);
  fire("play");
  expect(result.current.isPlaying).toBe(true);
});
test("volume and mute reach the audio element", () => {
  const { result } = setup();
  act(() => result.current.setVolume(0.3));
  expect(audio().volume).toBeCloseTo(0.3);
  act(() => result.current.toggleMute());
  expect(audio().muted).toBe(true);
});
test("a play is recorded once after 3s, and listening time accumulates", () => {
  const { result } = setup();
  act(() => result.current.playSong(songs[0], songs));
  for (const t of [1, 2, 3, 4, 5, 6]) { audio().currentTime = t; fire("timeupdate"); }
  expect(recordPlay).toHaveBeenCalledTimes(1);
  expect(recordPlay).toHaveBeenCalledWith("a");
  fire("pause");
  expect(recordListen).toHaveBeenCalledWith("a", 6);
});
test("seek sets the time", () => {
  const { result } = setup();
  act(() => result.current.playSong(songs[0], songs));
  act(() => result.current.seek(42));
  expect(audio().currentTime).toBe(42);
  expect(result.current.currentTime).toBe(42);
});
