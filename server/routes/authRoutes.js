import express from 'express';
import {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import {
  signupValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} from '../utils/validators/authValidators.js';

const router = express.Router();

// Public routes
router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);

// Private routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfileValidation, validate, updateProfile);
router.put('/change-password', protect, changePasswordValidation, validate, changePassword);

export default router;
