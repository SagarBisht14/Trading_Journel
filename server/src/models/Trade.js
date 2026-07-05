import mongoose from 'mongoose';
import { normalizeTradeFinancials } from '../utils/tradeCalculations.js';

const screenshotSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Before Entry', 'After Entry', 'Exit', 'TradingView Chart', 'MT5 Screenshot', 'Broker Screenshot', 'Other'],
      default: 'Other'
    },
    url: { type: String, required: true },
    filename: { type: String, required: true },
    originalName: { type: String, default: '' },
    mimeType: { type: String, default: 'image/webp' },
    size: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const tradeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tradeDate: { type: Date, required: true, index: true },
    tradeTime: { type: String, default: '' },
    instrument: { type: String, required: true, trim: true, index: true },
    market: { type: String, enum: ['Forex', 'Crypto', 'Stocks', 'Futures', 'Indices'], required: true },
    broker: { type: String, default: '', trim: true },
    strategy: { type: String, default: '', trim: true, index: true },
    setup: { type: String, default: '', trim: true, index: true },
    timeframe: { type: String, default: '', trim: true },
    direction: { type: String, enum: ['Long', 'Short'], required: true },
    entryPrice: { type: Number, default: 0 },
    stopLoss: { type: Number, default: 0 },
    takeProfit: { type: Number, default: 0 },
    exitPrice: { type: Number, default: 0 },
    riskAmount: { type: Number, default: 0 },
    rewardAmount: { type: Number, default: 0 },
    rrRatio: { type: Number, default: 0 },
    positionSize: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    slippage: { type: Number, default: 0 },
    grossProfit: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0, index: true },
    tradeDuration: { type: Number, default: 0 },
    result: { type: String, enum: ['Win', 'Loss', 'Break-even'], default: 'Break-even', index: true },
    emotionBefore: { type: String, default: '' },
    emotionDuring: { type: String, default: '' },
    emotionAfter: { type: String, default: '' },
    confidenceRating: { type: Number, min: 1, max: 10, default: 5 },
    mistakeCategory: { type: String, default: '' },
    lessonsLearned: { type: String, default: '' },
    notes: { type: String, default: '' },
    didFollowPlan: { type: Boolean, default: false },
    wasEntryValid: { type: Boolean, default: false },
    wasExitValid: { type: Boolean, default: false },
    didRevengeTrade: { type: Boolean, default: false },
    wasNewsInvolved: { type: Boolean, default: false },
    sleepQuality: { type: String, default: '' },
    mood: { type: String, default: '' },
    screenshots: [screenshotSchema],
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true }
);

tradeSchema.index({ user: 1, tradeDate: -1, instrument: 1 });
tradeSchema.index({ instrument: 'text', strategy: 'text', setup: 'text', notes: 'text', lessonsLearned: 'text' });

tradeSchema.pre('validate', function normalizeTrade(next) {
  normalizeTradeFinancials(this);
  next();
});

export default mongoose.model('Trade', tradeSchema);
