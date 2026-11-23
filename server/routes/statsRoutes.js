import express from 'express';
import { body } from 'express-validator';
import { recordListen, getStats } from '../controllers/statsController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getStats);
router.post(
  '/listen',
  [
    body('songId').isMongoId().withMessage('songId must be a valid id'),
    body('seconds').isFloat({ min: 0, max: 3600 }).withMessage('seconds must be between 0 and 3600'),
  ],
  validate,
  recordListen
);

export default router;
