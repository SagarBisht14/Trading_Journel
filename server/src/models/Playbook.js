import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    originalName: { type: String, default: '' }
  },
  { timestamps: true }
);

const playbookSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    checklist: [{ type: String }],
    rules: { type: String, default: '' },
    entry: { type: String, default: '' },
    exit: { type: String, default: '' },
    riskRules: { type: String, default: '' },
    commonMistakes: { type: String, default: '' },
    exampleImages: [imageSchema]
  },
  { timestamps: true }
);

playbookSchema.index({ title: 'text', description: 'text', rules: 'text', entry: 'text', exit: 'text', commonMistakes: 'text' });

export default mongoose.model('Playbook', playbookSchema);
