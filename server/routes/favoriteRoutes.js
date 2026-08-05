import express from "express";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
} from "../controllers/favoriteController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getFavorites);

router.get("/check/:songId", protect, checkFavorite);

router.post("/:songId", protect, addFavorite);

router.delete("/:songId", protect, removeFavorite);

export default router;