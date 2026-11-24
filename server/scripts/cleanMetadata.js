// Usage: node scripts/cleanMetadata.js [--out dir]       dry-run (default): writes preview + review report, changes nothing
//        node scripts/cleanMetadata.js --apply           writes backup JSON first, then updates titles
//        node scripts/cleanMetadata.js --restore <file>  puts titles back from a backup file
//        node scripts/cleanMetadata.js --from-file <json> [--apply]  applies hand-checked [{id, title}] edits (dry-run unless --apply)
// Titles only. Artist/album are never touched (shortcut: add --singers/--with-albums if wanted later).
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import Song from "../models/Song.js";
import { cleanTitle } from "../utils/cleanTitle.js";

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const val = (n) => args[args.indexOf(n) + 1];
const outDir = val("--out") || path.join(process.cwd(), "clean-output");
fs.mkdirSync(outDir, { recursive: true });

await mongoose.connect(process.env.MONGO_URI);
try {
  if (flag("--restore")) {
    const backup = JSON.parse(fs.readFileSync(val("--restore"), "utf8"));
    for (const { id, title } of backup) await Song.updateOne({ _id: id }, { $set: { title } });
    console.log(`Restored ${backup.length} titles.`);
  } else if (flag("--from-file")) {
    const edits = JSON.parse(fs.readFileSync(val("--from-file"), "utf8"));
    const current = await Song.find({ _id: { $in: edits.map((e) => e.id) } }, "title").lean();
    const before = new Map(current.map((x) => [String(x._id), x.title]));
    // only songs that still exist, with a sensible new title
    const valid = edits.filter((e) => before.has(e.id) && typeof e.title === "string" && e.title.trim().length >= 2 && e.title.length <= 100);
    console.log(`${valid.length} of ${edits.length} edits are valid`);
    valid.forEach((e) => console.log(`  ${before.get(e.id)}\n  -> ${e.title}`));
    if (flag("--apply")) {
      const backupFile = path.join(outDir, `backup-${Date.now()}.json`);
      fs.writeFileSync(backupFile, JSON.stringify(valid.map((e) => ({ id: e.id, title: before.get(e.id) })), null, 2));
      for (const e of valid) await Song.updateOne({ _id: e.id }, { $set: { title: e.title.trim() } });
      console.log(`Applied ${valid.length} edits. Undo: node scripts/cleanMetadata.js --restore ${backupFile}`);
    } else {
      console.log("Dry run: nothing written. Add --apply to write.");
    }
  } else {
    const songs = await Song.find({}, "title artist").sort({ createdAt: 1 }).lean();
    const rows = songs.map((s) => ({ id: String(s._id), artist: s.artist, before: s.title, ...cleanTitle(s.title) }));
    const changed = rows.filter((r) => r.before !== r.title);

    const seen = new Map();
    rows.forEach((r) => seen.set(r.title.toLowerCase(), [...(seen.get(r.title.toLowerCase()) || []), r.before]));
    const dupes = [...seen.entries()].filter(([, v]) => v.length > 1);
    const review = rows.filter((r) => r.flags.length);

    fs.writeFileSync(path.join(outDir, "preview.json"), JSON.stringify(rows, null, 2));
    const report = [
      `Songs: ${rows.length} | would change: ${changed.length} | need review: ${review.length} | duplicate titles after cleaning: ${dupes.length}`,
      "", "== NEED REVIEW ==", ...review.map((r) => `[${r.flags.join(",")}]\n  before: ${r.before}\n  after : ${r.title}`),
      "", "== DUPLICATES ==", ...dupes.map(([t, v]) => `${t}\n  ${v.join("\n  ")}`),
    ].join("\n");
    fs.writeFileSync(path.join(outDir, "review.txt"), report);
    console.log(report.split("\n")[0], "\nFiles in", outDir);

    if (flag("--apply")) {
      const backupFile = path.join(outDir, `backup-${Date.now()}.json`);
      fs.writeFileSync(backupFile, JSON.stringify(songs.map((s) => ({ id: String(s._id), title: s.title })), null, 2));
      const toApply = flag("--only-clean") ? changed.filter((r) => !r.flags.length) : changed;
      for (const r of toApply) await Song.updateOne({ _id: r.id }, { $set: { title: r.title } });
      console.log(`Applied ${toApply.length} changes. Undo: node scripts/cleanMetadata.js --restore ${backupFile}`);
    }
  }
} finally {
  await mongoose.disconnect();
}
