import test from "node:test";
import assert from "node:assert/strict";
import { cleanTitle } from "../utils/cleanTitle.js";

const ok = (raw, want) => assert.equal(cleanTitle(raw).title, want);
test("real titles", () => {
  ok("Khuda Jaane | Full Song | Bachna Ae Haseeno | Ranbir Kapoor", "Khuda Jaane");
  ok("Ve Junoon - PagalNew", "Ve Junoon");
  ok("Mujhko Barsaat Bana Lo Full Video Song | Junooniyat | T-Series", "Mujhko Barsaat Bana Lo");
  ok("JAB TAK Video Song | M.S. DHONI", "Jab Tak");
  ok("Tera Hoke Rahoon -Lyrical | Arijit Singh", "Tera Hoke Rahoon");
  ok("Lyrical: Labon Ko | Bhool Bhulaiyaa | Pritam", "Labon Ko");
  ok("Tujhe Sochta Hoon (Lyrical Audio) | KK", "Tujhe Sochta Hoon");
  ok("Teri Saanson Mein (From \"Karle Pyaar Karle\")", "Teri Saanson Mein (From \"Karle Pyaar Karle\")");
  ok("𝗞𝗵𝘄𝗮𝗮𝗯 𝗗𝗲𝗸𝗵𝗼𝗼𝗻 - 𝗘𝗸 𝗗𝗶𝗻 | Sai Pallavi", "Khwaab Dekhoon - Ek Din");
});
test("flags", () => {
  assert.ok(cleanTitle("KK | Dil Ibaadat Kar Raha Hai (Lyrical Video) | Tum Mile").flags.includes("artist-first?"));
  assert.ok(cleanTitle("Kabhi Na Kabhi - Aditya Narayan (Lyrics) | Shaapit").flags.includes("dash-left"));
});
