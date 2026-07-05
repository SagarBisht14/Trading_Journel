import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose from 'mongoose';

const riskSettingsSchema = new mongoose.Schema(
  {
    maxRiskPerTrade: { type: Number, default: 1 },
    maxDailyLoss: { type: Number, default: 3 },
    maxOpenRisk: { type: Number, default: 5 }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 2, maxlength: 40 },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    avatar: { type: String, default: '' },
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'UTC' },
    darkMode: { type: Boolean, default: true },
    riskSettings: { type: riskSettingsSchema, default: () => ({}) },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    currency: this.currency,
    timezone: this.timezone,
    darkMode: this.darkMode,
    riskSettings: this.riskSettings
  };
};

userSchema.methods.createResetToken = function createResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 20);
  return token;
};

userSchema.statics.hashPassword = async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export default mongoose.model('User', userSchema);
