import Trade from '../models/Trade.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { computeAnalytics } from '../utils/tradeCalculations.js';
import { buildTradeQuery } from './tradeController.js';

export const analyticsSummary = asyncHandler(async (req, res) => {
  const filters = buildTradeQuery(req.user._id, req.query);
  const trades = await Trade.find(filters).sort({ tradeDate: 1 });
  res.json(computeAnalytics(trades));
});

export const aiInsights = asyncHandler(async (req, res) => {
  const trades = await Trade.find({ user: req.user._id, deletedAt: null }).sort({ tradeDate: 1 });
  const analytics = computeAnalytics(trades);
  res.json({ insights: analytics.insights, summary: analytics.summary });
});
