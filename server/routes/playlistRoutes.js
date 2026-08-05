import express from "express";
import {
  createPlaylist,
  getPlaylists,
  getPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from "../controllers/playlistController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Playlist CRUD
router
  .route("/")
  .get(protect, getPlaylists)
  .post(protect, createPlaylist);

router
  .route("/:id")
  .get(protect, getPlaylist)
  .put(protect, updatePlaylist)
  .delete(protect, deletePlaylist);

// Playlist Songs
router.post(
  "/:id/songs",
  protect,
  addSongToPlaylist
);

router.delete(
  "/:id/songs/:songId",
  protect,
  removeSongFromPlaylist
);

export default router;