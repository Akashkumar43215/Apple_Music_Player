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
