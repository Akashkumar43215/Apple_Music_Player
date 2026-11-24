// Usage: node scripts/cleanMetadata.js [--out dir]       dry-run (default): writes preview + review report, changes nothing
//        node scripts/cleanMetadata.js --apply           writes backup JSON first, then updates titles
//        node scripts/cleanMetadata.js --restore <file>  puts titles back from a backup file
//        node scripts/cleanMetadata.js --from-file <json> [--apply]  applies hand-checked [{id, title?, artist?, album?}] edits (dry-run unless --apply)
// The automatic mode only cleans titles. Artist and album change only through a hand-checked --from-file list.
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
    for (const { id, ...fields } of backup) await Song.updateOne({ _id: id }, { $set: fields });
    console.log(`Restored ${backup.length} titles.`);
  } else if (flag("--from-file")) {
    const FIELDS = { title: 2, artist: 1, album: 1 }; // field -> minimum length (all max 100, like the schema)
    const edits = JSON.parse(fs.readFileSync(val("--from-file"), "utf8"));
    const current = await Song.find({ _id: { $in: edits.map((e) => e.id) } }, "title artist album").lean();
    const byId = new Map(current.map((x) => [String(x._id), x]));

    // keep only songs that still exist and fields with sensible values
    const valid = edits
      .map((e) => {
        const set = {};
        for (const [field, min] of Object.entries(FIELDS)) {
          const v = typeof e[field] === "string" ? e[field].trim() : null;
          if (v && v.length >= min && v.length <= 100 && v !== byId.get(e.id)?.[field]) set[field] = v;
        }
        return { id: e.id, set };
      })
      .filter((e) => byId.has(e.id) && Object.keys(e.set).length);
    const count = (field) => valid.filter((e) => field in e.set).length;
    console.log(`${valid.length} of ${edits.length} edits will change something (titles: ${count("title")}, artists: ${count("artist")}, albums: ${count("album")})`);

    if (flag("--apply")) {
      // backup holds the current value of every field we are about to change
      const backupFile = path.join(outDir, `backup-${Date.now()}.json`);
      fs.writeFileSync(backupFile, JSON.stringify(valid.map((e) => ({ id: e.id, ...Object.fromEntries(Object.keys(e.set).map((k) => [k, byId.get(e.id)[k]])) })), null, 2));
      for (const e of valid) await Song.updateOne({ _id: e.id }, { $set: e.set });
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
