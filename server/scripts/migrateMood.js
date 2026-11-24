// Usage: node scripts/migrateMood.js [--out dir]       dry-run (default): prints a summary, writes preview.json, changes nothing
//        node scripts/migrateMood.js --apply            writes a backup first, then sets `mood` where the old `genre` is a mood
//        node scripts/migrateMood.js --restore <file>   removes `mood` again from the songs listed in a backup file
// Only fills `mood` on songs that have none; `genre` is never touched.
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import Song from "../models/Song.js";
import { moodFromGenre } from "../utils/mood.js";

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const val = (n) => args[args.indexOf(n) + 1];
const outDir = val("--out") || path.join(process.cwd(), "clean-output");
fs.mkdirSync(outDir, { recursive: true });

await mongoose.connect(process.env.MONGO_URI);
try {
  if (flag("--restore")) {
    const backup = JSON.parse(fs.readFileSync(val("--restore"), "utf8"));
    const r = await Song.updateMany({ _id: { $in: backup.map((b) => b.id) } }, { $unset: { mood: "" } });
    console.log(`Restored ${r.modifiedCount} songs (mood removed).`);
  } else {
    const songs = await Song.find({}, "title genre mood").sort({ createdAt: 1 }).lean();
    const todo = songs.filter((s) => !s.mood).map((s) => ({ id: String(s._id), title: s.title, genre: s.genre, mood: moodFromGenre(s.genre) }));
    const changes = todo.filter((t) => t.mood);
    const skipped = todo.filter((t) => !t.mood);

    const count = (rows) => rows.reduce((m, r) => m.set(r.genre, (m.get(r.genre) || 0) + 1), new Map());
    console.log(`Songs: ${songs.length} | already have a mood: ${songs.length - todo.length} | would get a mood: ${changes.length} | left without mood: ${skipped.length}`);
    console.log("would get a mood, by genre:", Object.fromEntries(count(changes)));
    console.log("left without mood, by genre:", Object.fromEntries(count(skipped)));
    fs.writeFileSync(path.join(outDir, "mood-preview.json"), JSON.stringify({ changes, skipped }, null, 2));

    if (flag("--apply")) {
      const backupFile = path.join(outDir, `backup-mood-${Date.now()}.json`);
      fs.writeFileSync(backupFile, JSON.stringify(changes.map((c) => ({ id: c.id })), null, 2));
      for (const c of changes) await Song.updateOne({ _id: c.id, mood: { $exists: false } }, { $set: { mood: c.mood } });
      console.log(`Applied ${changes.length}. Undo: node scripts/migrateMood.js --restore ${backupFile}`);
    } else {
      console.log("Dry run: nothing written. Preview in", path.join(outDir, "mood-preview.json"));
    }
  }
} finally {
  await mongoose.disconnect();
}
