import Trade from '../models/Trade.js';
import { saveImageFiles } from '../middleware/upload.js';
import { ApiError, notFound } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex, parseJSON, toBoolean, toOptionalNumber } from '../utils/parsers.js';

const numericFields = [
  'entryPrice',
  'stopLoss',
  'takeProfit',
  'exitPrice',
  'riskAmount',
  'rewardAmount',
  'rrRatio',
  'positionSize',
  'fees',
  'slippage',
  'grossProfit',
  'netProfit',
  'tradeDuration',
  'confidenceRating'
];

const booleanFields = ['didFollowPlan', 'wasEntryValid', 'wasExitValid', 'didRevengeTrade', 'wasNewsInvolved'];

function tradePayload(body) {
  const allowed = [
    'tradeDate',
    'tradeTime',
    'instrument',
    'market',
    'broker',
    'strategy',
    'setup',
    'timeframe',
    'direction',
    'result',
    'emotionBefore',
    'emotionDuring',
    'emotionAfter',
    'mistakeCategory',
    'lessonsLearned',
    'notes',
    'sleepQuality',
    'mood'
  ];

  const payload = {};
  for (const field of allowed) {
    if (body[field] !== undefined) payload[field] = body[field];
  }
  for (const field of numericFields) {
    const number = toOptionalNumber(body[field]);
    if (number !== undefined) payload[field] = number;
  }
  for (const field of booleanFields) {
    if (body[field] !== undefined) payload[field] = toBoolean(body[field]);
  }
  return payload;
}

function buildTradeQuery(userId, query) {
  const filters = { user: userId, deletedAt: null };
  if (query.includeDeleted === 'true') delete filters.deletedAt;
  if (query.search) {
    const regex = new RegExp(escapeRegex(query.search), 'i');
    filters.$or = [
      { instrument: regex },
      { strategy: regex },
      { setup: regex },
      { notes: regex },
      { lessonsLearned: regex }
    ];
  }
  if (query.instrument) filters.instrument = new RegExp(escapeRegex(query.instrument), 'i');
  if (query.strategy) filters.strategy = new RegExp(escapeRegex(query.strategy), 'i');
  if (query.setup) filters.setup = new RegExp(escapeRegex(query.setup), 'i');
  if (query.timeframe) filters.timeframe = query.timeframe;
  if (query.result) filters.result = query.result;
  if (query.broker) filters.broker = new RegExp(escapeRegex(query.broker), 'i');
  if (query.market) filters.market = query.market;
  if (query.direction) filters.direction = query.direction;

  if (query.dateFrom || query.dateTo || query.month || query.year) {
    filters.tradeDate = {};
    if (query.dateFrom) filters.tradeDate.$gte = new Date(query.dateFrom);
    if (query.dateTo) filters.tradeDate.$lte = new Date(query.dateTo);
    if (query.year && !query.month) {
      filters.tradeDate.$gte = new Date(Number(query.year), 0, 1);
      filters.tradeDate.$lte = new Date(Number(query.year), 11, 31, 23, 59, 59);
    }
    if (query.month && query.year) {
      const month = Number(query.month) - 1;
      filters.tradeDate.$gte = new Date(Number(query.year), month, 1);
      filters.tradeDate.$lte = new Date(Number(query.year), month + 1, 0, 23, 59, 59);
    }
  }

  const pnl = {};
  if (query.pnlMin !== undefined && query.pnlMin !== '') pnl.$gte = Number(query.pnlMin);
  if (query.pnlMax !== undefined && query.pnlMax !== '') pnl.$lte = Number(query.pnlMax);
  if (Object.keys(pnl).length) filters.netProfit = pnl;

  const rr = {};
  if (query.rrMin !== undefined && query.rrMin !== '') rr.$gte = Number(query.rrMin);
  if (query.rrMax !== undefined && query.rrMax !== '') rr.$lte = Number(query.rrMax);
  if (Object.keys(rr).length) filters.rrRatio = rr;

  return filters;
}

export const listTrades = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 12), 1), 100);
  const sortBy = req.query.sortBy || 'tradeDate';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const filters = buildTradeQuery(req.user._id, req.query);

  const [items, total] = await Promise.all([
    Trade.find(filters)
      .sort({ [sortBy]: sortOrder, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Trade.countDocuments(filters)
  ]);

  res.json({
    items,
    total,
    page,
    pages: Math.ceil(total / limit)
  });
});

export const createTrade = asyncHandler(async (req, res) => {
  const types = parseJSON(req.body.imageTypes, []);
  const screenshots = await saveImageFiles({ files: req.files || [], userId: req.user._id, folder: 'trades', types });
  const trade = await Trade.create({ ...tradePayload(req.body), screenshots, user: req.user._id });
  res.status(201).json({ trade });
});

export const getTrade = asyncHandler(async (req, res) => {
  const trade = await Trade.findOne({ _id: req.params.id, user: req.user._id, deletedAt: null });
  if (!trade) throw notFound('Trade not found');
  res.json({ trade });
});

export const updateTrade = asyncHandler(async (req, res) => {
  const trade = await Trade.findOne({ _id: req.params.id, user: req.user._id, deletedAt: null });
  if (!trade) throw notFound('Trade not found');

  Object.assign(trade, tradePayload(req.body));
  const types = parseJSON(req.body.imageTypes, []);
  const screenshots = await saveImageFiles({ files: req.files || [], userId: req.user._id, folder: 'trades', types });
  if (screenshots.length) trade.screenshots.push(...screenshots);
  await trade.save();

  res.json({ trade });
});

export const deleteTrade = asyncHandler(async (req, res) => {
  const trade = await Trade.findOne({ _id: req.params.id, user: req.user._id, deletedAt: null });
  if (!trade) throw notFound('Trade not found');
  trade.deletedAt = new Date();
  await trade.save();
  res.json({ message: 'Trade deleted', tradeId: trade._id });
});

export const restoreTrade = asyncHandler(async (req, res) => {
  const trade = await Trade.findOne({ _id: req.params.id, user: req.user._id });
  if (!trade) throw notFound('Trade not found');
  trade.deletedAt = null;
  await trade.save();
  res.json({ trade });
});

export const bulkDeleteTrades = asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  if (!ids.length) throw new ApiError(400, 'ids array is required');
  const result = await Trade.updateMany({ _id: { $in: ids }, user: req.user._id }, { deletedAt: new Date() });
  res.json({ message: 'Trades deleted', count: result.modifiedCount });
});

export const duplicateTrade = asyncHandler(async (req, res) => {
  const trade = await Trade.findOne({ _id: req.params.id, user: req.user._id, deletedAt: null }).lean();
  if (!trade) throw notFound('Trade not found');
  delete trade._id;
  delete trade.createdAt;
  delete trade.updatedAt;
  trade.tradeDate = new Date();
  trade.notes = `${trade.notes || ''}\nDuplicated from previous trade.`.trim();
  const duplicate = await Trade.create(trade);
  res.status(201).json({ trade: duplicate });
});

export const deleteScreenshot = asyncHandler(async (req, res) => {
  const trade = await Trade.findOne({ _id: req.params.tradeId, user: req.user._id, deletedAt: null });
  if (!trade) throw notFound('Trade not found');
  trade.screenshots = trade.screenshots.filter((image) => String(image._id) !== req.params.imageId);
  await trade.save();
  res.json({ trade });
});

export { buildTradeQuery };
