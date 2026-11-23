import mongoose from "mongoose";
import asyncHandler from "express-async-handler";

import Song from "../models/Song.js";
import Favorite from "../models/Favorite.js";
import RecentlyPlayed from "../models/RecentlyPlayed.js";
import PlayEvent from "../models/PlayEvent.js";
import ApiError from "../utils/ApiError.js";
import { artistTokens } from "../utils/artists.js";
import { buildDailyMix, dayKey } from "../utils/dailyMix.js";

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const POPULATE = ["uploadedBy", "name avatar"];

/**
 * @desc    Songs similar to the given song, best match first
 * @route   GET /api/songs/:id/similar?limit=10
 * @access  Public
 *
 * Score: shared artist +3, same genre +2, same (real) album +2, plus up to +1
 * for popularity so ties favour well-played songs. Only songs sharing at least
 * one of artist/genre/album are considered, so the list never contains random filler.
 */
export const getSimilarSongs = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid song id");

  const limit = Math.min(parseInt(req.query.limit) || 10, 30);
  const song = await Song.findById(id).lean();
  if (!song) throw new ApiError(404, "Song not found");

  const tokens = artistTokens(song.artist);
  const hasRealAlbum = song.album && song.album !== "Single";

  const or = [];
  if (song.genre) or.push({ genre: song.genre });
  if (hasRealAlbum) or.push({ album: song.album });
  tokens.forEach((t) => or.push({ artist: new RegExp(escapeRegex(t), "i") }));

  const candidates = await Song.find({ _id: { $ne: song._id }, $or: or })
    .limit(300)
    .populate(...POPULATE)
    .lean();

  const mine = new Set(tokens);
  const scored = candidates
    .map((c) => {
      let score = 0;
      if (artistTokens(c.artist).some((t) => mine.has(t))) score += 3;
      if (c.genre === song.genre) score += 2;
      if (hasRealAlbum && c.album === song.album) score += 2;
      score += Math.min(c.playCount || 0, 10) / 10;
      return { c, score };
    })
    .sort((a, b) => b.score - a.score || String(b.c._id).localeCompare(String(a.c._id)));

  res.status(200).json({ success: true, songs: scored.slice(0, limit).map((s) => s.c) });
});

const GENRE_MIXES = [
  ["romantic-mix", "Romantic Mix", "Love songs, handpicked", ["💕 Romantic"]],
  ["heartbreak-mix", "Heartbreak Mix", "Songs for the heavy days", ["💔 Heartbreak"]],
  ["chill-mix", "Chill Mix", "Slow down and unwind", ["😌 Chill"]],
  ["party-mix", "Party Mix", "Dance floor ready", ["🎉 Party", "💃 Dance"]],
  ["workout-mix", "Workout Mix", "Power through your set", ["🏋️ Workout"]],
];
const SIZE = 12;

const topSongs = (filter, sort) =>
  Song.find(filter).sort(sort).limit(SIZE).populate(...POPULATE).lean();

/**
 * @desc    Auto-generated playlists (Most Played, Recently Added, genre mixes, Your Top Artists)
 * @route   GET /api/smart
 * @access  Private
 * Empty playlists are left out, so the UI never shows a blank row.
 */
export const getSmartPlaylists = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [mostPlayed, recent, ...mixes] = await Promise.all([
    topSongs({ playCount: { $gt: 0 } }, { playCount: -1, _id: -1 }),
    topSongs({}, { createdAt: -1, _id: -1 }),
    ...GENRE_MIXES.map(([, , , genres]) => topSongs({ genre: { $in: genres } }, { playCount: -1, _id: -1 })),
  ]);

  // "Your Top Artists": artists across the user's history + favorites, most frequent first
  const [history, favs] = await Promise.all([
    RecentlyPlayed.find({ user: userId }).populate("song", "artist").lean(),
    Favorite.find({ user: userId }).populate("song", "artist").lean(),
  ]);
  const counts = new Map();
  [...history, ...favs].forEach((e) => {
    if (e.song) artistTokens(e.song.artist).forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
  });
  const topArtists = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
  const topArtistSongs = topArtists.length
    ? await topSongs({ $or: topArtists.map((t) => ({ artist: new RegExp(escapeRegex(t), "i") })) }, { playCount: -1, _id: -1 })
    : [];

  // Daily Mix: weights say how much this user likes each song (favourite 3, recent play 1, +1 per 2 min listened)
  const events = await PlayEvent.aggregate([
    { $match: { user: userId } },
    { $group: { _id: "$song", seconds: { $sum: "$seconds" } } },
  ]);
  const weights = new Map();
  const add = (id, w) => weights.set(String(id), (weights.get(String(id)) || 0) + w);
  history.forEach((e) => e.song && add(e.song._id, 1));
  favs.forEach((e) => e.song && add(e.song._id, 3));
  events.forEach((e) => add(e._id, e.seconds / 120));

  const allSongs = await Song.find({}).populate(...POPULATE).lean();
  const today = dayKey(req.query.tz);
  const dailyMix = buildDailyMix({ songs: allSongs, weights, seed: `${userId}:${today}`, size: 20 });

  const playlists = [
    { key: "daily-mix", title: "Daily Mix", subtitle: `Made for you · ${today}`, songs: dailyMix },
    { key: "top-artists", title: "Your Top Artists", subtitle: topArtists.join(" · "), songs: topArtistSongs },
    { key: "most-played", title: "Most Played", subtitle: "What everyone is listening to", songs: mostPlayed },
    { key: "recently-added", title: "Recently Added", subtitle: "Fresh in the library", songs: recent },
    ...GENRE_MIXES.map(([key, title, subtitle], i) => ({ key, title, subtitle, songs: mixes[i] })),
  ].filter((p) => p.songs.length > 0);

  res.status(200).json({ success: true, playlists });
});
