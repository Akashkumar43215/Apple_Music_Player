import express from 'express';
import { recordPlay, getRecentlyPlayed, clearRecentlyPlayed } from '../controllers/recentlyPlayedController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // every route here requires a logged-in user

router.get('/', getRecentlyPlayed);
router.post('/:songId', recordPlay);
router.delete('/', clearRecentlyPlayed);

export default router;
