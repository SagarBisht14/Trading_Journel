import User from '../models/User.js';
import Trade from '../models/Trade.js';
import Journal from '../models/Journal.js';
import Watchlist from '../models/Watchlist.js';
import Goal from '../models/Goal.js';
import Playbook from '../models/Playbook.js';
import Note from '../models/Note.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/parsers.js';
import { computeAnalytics } from '../utils/tradeCalculations.js';

const collections = {
  trades: Trade,
  journals: Journal,
  watchlist: Watchlist,
  goals: Goal,
  playbooks: Playbook,
  notes: Note
};

function safeUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    currency: user.currency,
    timezone: user.timezone,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export const adminOverview = asyncHandler(async (_req, res) => {
  const [totalUsers, adminUsers, totalTrades, activeTrades, pnl] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    Trade.countDocuments(),
    Trade.countDocuments({ deletedAt: null }),
    Trade.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: null, totalPnl: { $sum: '$netProfit' }, averageRR: { $avg: '$rrRatio' } } }
    ])
  ]);

  const topClients = await Trade.aggregate([
    { $match: { deletedAt: null } },
    { $group: { _id: '$user', totalPnl: { $sum: '$netProfit' }, trades: { $sum: 1 } } },
    { $sort: { totalPnl: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    {
      $project: {
        userId: '$_id',
        username: '$user.username',
        email: '$user.email',
        totalPnl: 1,
        trades: 1
      }
    }
  ]);

  res.json({
    totalUsers,
    clientUsers: totalUsers - adminUsers,
    adminUsers,
    totalTrades,
    activeTrades,
    totalPnl: Number((pnl[0]?.totalPnl || 0).toFixed(2)),
    averageRR: Number((pnl[0]?.averageRR || 0).toFixed(2)),
    topClients
  });
});

export const listAdminUsers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const filters = {};

  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'i');
    filters.$or = [{ username: regex }, { email: regex }];
  }
  if (req.query.role) filters.role = req.query.role;

  const [users, total] = await Promise.all([
    User.find(filters).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filters)
  ]);

  const ids = users.map((user) => user._id);
  const stats = await Trade.aggregate([
    { $match: { user: { $in: ids }, deletedAt: null } },
    { $group: { _id: '$user', trades: { $sum: 1 }, pnl: { $sum: '$netProfit' }, averageRR: { $avg: '$rrRatio' }, lastTrade: { $max: '$tradeDate' } } }
  ]);
  const statsMap = new Map(stats.map((item) => [String(item._id), item]));

  res.json({
    items: users.map((user) => {
      const item = statsMap.get(String(user._id));
      return {
        ...safeUser(user),
        stats: {
          trades: item?.trades || 0,
          pnl: Number((item?.pnl || 0).toFixed(2)),
          averageRR: Number((item?.averageRR || 0).toFixed(2)),
          lastTrade: item?.lastTrade || null
        }
      };
    }),
    total,
    page,
    pages: Math.ceil(total / limit)
  });
});

export const getAdminUserData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).lean();
  if (!user) throw new ApiError(404, 'Client not found');

  const [trades, journals, watchlist, goals, playbooks, notes] = await Promise.all([
    Trade.find({ user: user._id, deletedAt: null }).sort({ tradeDate: -1 }).limit(100).lean(),
    Journal.find({ user: user._id }).sort({ date: -1 }).limit(100).lean(),
    Watchlist.find({ user: user._id }).sort({ updatedAt: -1 }).limit(100).lean(),
    Goal.find({ user: user._id }).sort({ targetDate: -1 }).limit(100).lean(),
    Playbook.find({ user: user._id }).sort({ updatedAt: -1 }).limit(100).lean(),
    Note.find({ user: user._id }).sort({ updatedAt: -1 }).limit(100).lean()
  ]);

  res.json({
    user: safeUser(user),
    analytics: computeAnalytics(trades),
    data: {
      trades,
      journals,
      watchlist,
      goals,
      playbooks,
      notes
    }
  });
});

export const deleteClientRecord = asyncHandler(async (req, res) => {
  const Model = collections[req.params.collection];
  if (!Model) throw new ApiError(400, 'Unknown collection');

  const query = { _id: req.params.recordId, user: req.params.userId };
  if (req.params.collection === 'trades') {
    const trade = await Trade.findOne(query);
    if (!trade) throw new ApiError(404, 'Record not found');
    trade.deletedAt = new Date();
    await trade.save();
  } else {
    const deleted = await Model.findOneAndDelete(query);
    if (!deleted) throw new ApiError(404, 'Record not found');
  }

  res.json({ message: 'Client record removed' });
});
