// Pure title cleaner. Only REMOVES known noise; never invents words.
// Returns { title, flags } - flags list reasons a human should look at the result.
const NOISE = [
  "full audio song", "lyrical video song", "lyric video", "full audio", "audio song", "full video song", "lyrical video", "lyrical audio", "lyrical song", "full video",
  "video song", "music video", "full song", "with lyrics", "lyrics", "lyrical", "official video", "official",
  "8k/4k", "8k", "4k", "pagalnew", "video", "song",
];
const alt = NOISE.map((n) => n.replace("/", "\/")).join("|");
const PAREN_NOISE = new RegExp(String.raw`\s*[(\[]\s*(?:${alt})(?:\s+(?:${alt}))*\s*[)\]]`, "gi");
const TRAILING_NOISE = new RegExp(String.raw`(?:[\s\-–:,]+(?:${alt}))+\s*$`, "i");
const LEADING_NOISE = new RegExp(String.raw`^(?:${alt})\s*:\s*`, "i");

const ONLY_NOISE = new RegExp(String.raw`^(?:${alt}|full)(?:\s+(?:${alt}|full))*$`, "i");

const recase = (s) => {
  const letters = s.replace(/[^A-Za-z]/g, "");
  if (letters.length < 4 || letters !== letters.toUpperCase()) return s;
  return s.toLowerCase().replace(/(^|[\s(\-:"'])([a-z])/g, (_, p, c) => p + c.toUpperCase());
};

export const cleanTitle = (raw) => {
  const flags = [];
  const text = String(raw ?? "").normalize("NFKC").replace(/[\u{1F000}-\u{1FFFF}☀-➿]/gu, "");
  const segs = text.split("|").map((s) => s.trim()).filter(Boolean);
  let t = segs[0] ?? "";

  // Artist-first title ("KK | Song (Lyrical Video) | ..."): the real title is in a later segment
  const hasNoise = (s) => new RegExp(String.raw`\b(?:${alt})\b`, "i").test(s);
  if (segs.length > 1 && !hasNoise(t) && hasNoise(segs[1]) && !ONLY_NOISE.test(segs[1]) && t.split(/\s+/).length <= 3) { flags.push("artist-first?"); t = segs[1]; }

  const before = t;
  t = t.replace(LEADING_NOISE, "").replace(PAREN_NOISE, "");
  let prev;
  do { prev = t; t = t.replace(TRAILING_NOISE, "").trim(); } while (t !== prev);
  t = t.replace(/\s{2,}/g, " ").replace(/[\s\-–:,]+$/, "").replace(/\s+"$/, '"').trim();

  // noise left in the middle (e.g. "Naseeb Se (Video) SatyaPrem Ki Katha") means words got glued together
  if (new RegExp(String.raw`\b(?:${alt})\b`, "i").test(before) && before !== t && /\b(?:video|lyrical|song|full)\b/i.test(t)) flags.push("noise-left");
  t = recase(t);
  if (/\s[-–]\s/.test(t)) flags.push("dash-left");
  if (/:/.test(t)) flags.push("colon");
  if (t.length < 2) flags.push("too-short");
  if (t.length > 100) flags.push("too-long");
  return { title: t, flags };
};
