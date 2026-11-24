import test from "node:test";
import assert from "node:assert/strict";
import Song from "../models/Song.js";
import { MOODS, GENRES } from "../config/constants.js";

const base = { title: "t", artist: "a", audioUrl: "u", audioPublicId: "p", uploadedBy: "64b000000000000000000001" };

test("mood is optional, so old songs and old clients still validate", () => {
  const s = new Song(base);
  assert.equal(s.mood, undefined);
  assert.equal(s.validateSync(), undefined);
});

test("mood must be one of MOODS", () => {
  assert.equal(new Song({ ...base, mood: MOODS[0] }).validateSync(), undefined);
  assert.ok(new Song({ ...base, mood: "Bollywood" }).validateSync().errors.mood);
});

test("every mood is still a valid genre until the data is migrated", () => {
  for (const m of MOODS) assert.ok(GENRES.includes(m), m);
});

import { moodFromGenre } from "../utils/mood.js";
test("moodFromGenre: moods map to themselves, genres and Other to null", () => {
  assert.equal(moodFromGenre("💔 Heartbreak"), "💔 Heartbreak");
  assert.equal(moodFromGenre("💃 Dance"), null);
  assert.equal(moodFromGenre("🎼 Other"), null);
  assert.equal(moodFromGenre(undefined), null);
});

import { moodOf, genreOf } from "../utils/mood.js";
import { buildDailyMix } from "../utils/dailyMix.js";

test("moodOf / genreOf: own mood wins, old mood-style genre still counts, no double matching", () => {
  assert.equal(moodOf({ mood: "😌 Chill", genre: "💕 Romantic" }), "😌 Chill");
  assert.equal(moodOf({ genre: "💔 Heartbreak" }), "💔 Heartbreak");
  assert.equal(moodOf({ genre: "💃 Dance" }), null);
  assert.equal(moodOf({ mood: "🎼 Other" }), null);
  assert.equal(genreOf({ genre: "💃 Dance" }), "💃 Dance");
  assert.equal(genreOf({ genre: "💕 Romantic" }), null);
  assert.equal(genreOf({ genre: "🎼 Other" }), null);
});

test("daily mix works on songs with and without mood", () => {
  const songs = Array.from({ length: 30 }, (_, i) => ({
    _id: String(i), artist: `a${i % 5}`, album: "Single", playCount: i,
    genre: i % 3 ? "💕 Romantic" : "💃 Dance", ...(i % 2 ? { mood: "💕 Romantic" } : {}),
  }));
  const weights = new Map([["1", 5], ["2", 3]]);
  const mix = buildDailyMix({ songs, weights, seed: "u:2026-01-01", size: 10 });
  assert.equal(mix.length, 10);
  assert.equal(new Set(mix.map((s) => s._id)).size, 10);
});
