import express from 'express';
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  me,
  register,
  resetPassword,
  updateAvatar,
  updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { runMulter, uploadAvatar } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, me);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.put('/avatar', protect, runMulter(uploadAvatar), updateAvatar);

export default router;
