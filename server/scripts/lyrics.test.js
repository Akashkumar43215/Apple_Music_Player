import test from "node:test";
import assert from "node:assert/strict";
import { pickLyrics } from "../utils/lyrics.js";

const r = (trackName, duration, extra = {}) => ({ trackName, artistName: "X", duration, syncedLyrics: "[00:01.00] a", ...extra });
const pick = (title, dur, results) => pickLyrics({ title, duration: dur }, results)?.trackName ?? null;

test("accepts exact titles, ignoring brackets and case", () => {
  assert.equal(pick("Tujhko", 200, [r('Tujhko (From “Cocktail 2”)', 201)]), 'Tujhko (From “Cocktail 2”)');
  assert.equal(pick("Deewana kar Raha Hai", 250, [r("Deewana kar raha hai", 250)]), "Deewana kar raha hai");
  assert.equal(pick("Khali Khali Dil", 240, [r("KHALI KHALI DIL", 239)]), "KHALI KHALI DIL");
});
test("tries the part of the title before ' - ' or ':'", () => {
  assert.equal(pick("Shayad - Love Aaj Kal", 250, [r("Shayad", 250)]), "Shayad");
  assert.equal(pick('Tera Intezaar: "Khali Khali Dil"', 240, [r("Tera Intezaar", 240)]), "Tera Intezaar");
});
test("rejects the wrong songs seen in real data", () => {
  assert.equal(pick("Baarish Yaariyan", 260, [r("Baarish", 260)]), null);
  assert.equal(pick("Mera Hua", 230, [r("Hua Mera", 230)]), null);
  assert.equal(pick("Salamat", 200, [r("Mitsa (Salamat)", 200)]), null);
  assert.equal(pick("Tum Mere Ho", 200, [r("Mere Ho Tum", 200)]), null);
});
test("rejects other versions and wrong lengths", () => {
  assert.equal(pick("Khoobsurat", 200, [r("Khoobsurat - LoFi Mix", 200)]), null);
  assert.equal(pick("Ishq Wala Love", 200, [r("Ishq Wala Love (Slowed Reverb)", 200)]), null);
  assert.equal(pick("Pal", 200, [r("Pal", 260)]), null);
});
test("prefers synced over plain; ignores results without lyrics", () => {
  const plain = r("Sooiyan", 200, { syncedLyrics: null, plainLyrics: "la la" });
  const synced = r("Sooiyan", 201);
  assert.equal(pickLyrics({ title: "Sooiyan", duration: 200 }, [plain, synced]), synced);
  assert.equal(pick("Sooiyan", 200, [r("Sooiyan", 200, { syncedLyrics: null })]), null);
  assert.equal(pick("Sooiyan", 200, "not an array"), null);
});
