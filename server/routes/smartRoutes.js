import express from 'express';
import { getSmartPlaylists } from '../controllers/smartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getSmartPlaylists);

export default router;
