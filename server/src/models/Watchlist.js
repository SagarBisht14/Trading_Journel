import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    instrument: { type: String, required: true, trim: true, index: true },
    reason: { type: String, default: '' },
    target: { type: String, default: '' },
    invalidation: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['Watching', 'Triggered', 'Invalidated', 'Archived'], default: 'Watching' }
  },
  { timestamps: true }
);

watchlistSchema.index({ instrument: 'text', reason: 'text', notes: 'text' });

export default mongoose.model('Watchlist', watchlistSchema);
