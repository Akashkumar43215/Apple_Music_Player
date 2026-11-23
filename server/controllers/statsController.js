import asyncHandler from "express-async-handler";

import Song from "../models/Song.js";
import PlayEvent from "../models/PlayEvent.js";
import ApiError from "../utils/ApiError.js";
import { artistNames } from "../utils/artists.js";
import { dayKey } from "../utils/dailyMix.js";

const MIN_SECONDS = 5; // shorter listens are skips; they never count

const validTimezone = (tz) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
};

/**
 * @desc    Record a chunk of listening for the current user
 * @route   POST /api/stats/listen   body: { songId, seconds }
 * @access  Private
 */
export const recordListen = asyncHandler(async (req, res) => {
  const { songId } = req.body;
  const seconds = Math.round(Number(req.body.seconds));

  if (seconds < MIN_SECONDS) {
    return res.status(200).json({ success: true, recorded: false });
  }
  if (!(await Song.exists({ _id: songId }))) throw new ApiError(404, "Song not found");

  await PlayEvent.create({ user: req.user._id, song: songId, seconds: Math.min(seconds, 3600) });
  res.status(201).json({ success: true, recorded: true });
});

/**
 * @desc    Listening statistics for the current user
 * @route   GET /api/stats?tz=Asia/Kolkata
 * @access  Private
 */
export const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const tz = req.query.tz ? validTimezone(req.query.tz) : "UTC";
  const now = Date.now();

  const [perSong, perDay] = await Promise.all([
    PlayEvent.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$song", seconds: { $sum: "$seconds" }, lastPlayed: { $max: "$playedAt" } } },
    ]),
    PlayEvent.aggregate([
      { $match: { user: userId, playedAt: { $gte: new Date(now - 8 * 86400000) } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$playedAt", timezone: tz } },
          seconds: { $sum: "$seconds" },
        },
      },
    ]),
  ]);

  // Last 7 calendar days in the user's time zone, oldest first, zero-filled.
  const secondsByDay = new Map(perDay.map((d) => [d._id, d.seconds]));
  const daily = Array.from({ length: 7 }, (_, i) => {
    const date = dayKey(tz, new Date(now - (6 - i) * 86400000));
    return { date, seconds: secondsByDay.get(date) || 0 };
  });

  const songs = await Song.find({ _id: { $in: perSong.map((p) => p._id) } })
    .select("title artist genre coverUrl")
    .lean();
  const byId = new Map(songs.map((s) => [String(s._id), s]));

  const artists = new Map();
  const genres = new Map();
  let totalSeconds = 0;
  for (const p of perSong) {
    totalSeconds += p.seconds;
    const s = byId.get(String(p._id));
    if (!s) continue; // song deleted since
    artistNames(s.artist).forEach((name) => {
      const key = name.toLowerCase();
      artists.set(key, { name, seconds: (artists.get(key)?.seconds || 0) + p.seconds });
    });
    if (s.genre) genres.set(s.genre, (genres.get(s.genre) || 0) + p.seconds);
  }

  const top = (entries, n) => entries.sort((a, b) => b.seconds - a.seconds).slice(0, n);

  res.status(200).json({
    success: true,
    totalSeconds,
    weekSeconds: daily.reduce((sum, d) => sum + d.seconds, 0),
    daily,
    topArtists: top([...artists.values()], 5),
    topGenres: top([...genres].map(([genre, seconds]) => ({ genre, seconds })), 5),
    topSongs: top(
      perSong
        .filter((p) => byId.has(String(p._id)))
        .map((p) => ({ song: byId.get(String(p._id)), seconds: p.seconds, lastPlayed: p.lastPlayed })),
      5
    ),
  });
});
