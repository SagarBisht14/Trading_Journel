import crypto from 'crypto';
import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createAuthResponse } from '../utils/jwt.js';
import { saveImageFiles } from '../middleware/upload.js';
import { toNumber } from '../utils/parsers.js';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

function sendAuth(res, user, status = 200) {
  const payload = createAuthResponse(user);
  res.cookie('token', payload.token, cookieOptions);
  res.status(status).json(payload);
}

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw new ApiError(400, 'Username, email, and password are required');
  }
  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  const passwordHash = await User.hashPassword(password);
  const role = resolveRequestedRole(req.body.adminSecret);
  const user = await User.create({ username, email, passwordHash, role, timezone: req.body.timezone || 'UTC' });
  sendAuth(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+passwordHash');

  if (!user || !(await user.comparePassword(password || ''))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  sendAuth(res, user);
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updates = ['username', 'currency', 'timezone', 'darkMode'].reduce((acc, key) => {
    if (req.body[key] !== undefined) acc[key] = req.body[key];
    return acc;
  }, {});

  if (req.body.riskSettings) {
    updates.riskSettings = {
      maxRiskPerTrade: toNumber(req.body.riskSettings.maxRiskPerTrade, req.user.riskSettings.maxRiskPerTrade),
      maxDailyLoss: toNumber(req.body.riskSettings.maxDailyLoss, req.user.riskSettings.maxDailyLoss),
      maxOpenRisk: toNumber(req.body.riskSettings.maxOpenRisk, req.user.riskSettings.maxOpenRisk)
    };
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ user: user.toSafeJSON() });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+passwordHash');
  const { currentPassword, newPassword } = req.body;

  if (!(await user.comparePassword(currentPassword || ''))) {
    throw new ApiError(401, 'Current password is incorrect');
  }
  if (!newPassword || newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters');
  }

  user.passwordHash = await User.hashPassword(newPassword);
  await user.save();
  res.json({ message: 'Password updated' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase() }).select('+resetPasswordToken +resetPasswordExpires');
  if (!user) {
    res.json({ message: 'If an account exists, a reset token has been created.' });
    return;
  }

  const token = user.createResetToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;

  res.json({
    message: 'Password reset token generated.',
    resetUrl,
    resetToken: process.env.NODE_ENV === 'production' ? undefined : token
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() }
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    throw new ApiError(400, 'Reset token is invalid or expired');
  }
  if (!req.body.password || req.body.password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  user.passwordHash = await User.hashPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  sendAuth(res, user);
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const saved = await saveImageFiles({ files: req.file ? [req.file] : [], userId: req.user._id, folder: 'avatars' });
  if (!saved.length) throw new ApiError(400, 'Avatar image is required');
  req.user.avatar = saved[0].url;
  await req.user.save();
  res.json({ user: req.user.toSafeJSON() });
});

function resolveRequestedRole(adminSecret) {
  if (!adminSecret) return 'user';
  if (!process.env.ADMIN_SETUP_SECRET) {
    throw new ApiError(403, 'Admin registration is not configured');
  }
  if (adminSecret !== process.env.ADMIN_SETUP_SECRET) {
    throw new ApiError(403, 'Invalid admin setup secret');
  }
  return 'admin';
}
