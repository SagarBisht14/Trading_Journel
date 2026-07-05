import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    mood: { type: String, default: '' },
    sleep: { type: String, default: '' },
    focus: { type: String, default: '' },
    marketBias: { type: String, default: '' },
    lessons: { type: String, default: '' },
    goals: { type: String, default: '' },
    reflection: { type: String, default: '' }
  },
  { timestamps: true }
);

journalSchema.index({ user: 1, date: -1 });
journalSchema.index({ mood: 'text', marketBias: 'text', lessons: 'text', goals: 'text', reflection: 'text' });

export default mongoose.model('Journal', journalSchema);
