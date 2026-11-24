// "[01:23.45] some line" -> { t: 83.45, text: "some line" }, sorted by time. Metadata tags like [ar:...] are skipped.
export const parseLrc = (lrc = '') =>
  lrc
    .split(/\r?\n/)
    .flatMap((line) => {
      const stamps = [...line.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
      const text = line.replace(/\[[^\]]*\]/g, '').trim();
      return stamps.map((m) => ({ t: Number(m[1]) * 60 + Number(m[2]), text }));
    })
    .sort((a, b) => a.t - b.t);

/** Index of the line being sung at `time` (-1 before the first line). */
export const activeLineIndex = (lines, time) => {
  let lo = 0, hi = lines.length - 1, ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lines[mid].t <= time) { ans = mid; lo = mid + 1; } else hi = mid - 1;
  }
  return ans;
};
