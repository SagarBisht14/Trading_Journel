import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['Daily', 'Weekly', 'Monthly'], required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    targetDate: { type: Date, default: null },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

goalSchema.index({ user: 1, type: 1, targetDate: -1 });

export default mongoose.model('Goal', goalSchema);
