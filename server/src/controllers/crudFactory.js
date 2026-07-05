import { ApiError, notFound } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/parsers.js';

export function crudController(Model, options = {}) {
  const {
    name = 'Record',
    searchFields = [],
    filterFields = [],
    dateField = 'createdAt',
    beforeSave = (payload) => payload
  } = options;

  const list = asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 100);
    const filters = { user: req.user._id };

    if (req.query.search && searchFields.length) {
      const regex = new RegExp(escapeRegex(req.query.search), 'i');
      filters.$or = searchFields.map((field) => ({ [field]: regex }));
    }

    for (const field of filterFields) {
      if (req.query[field]) filters[field] = req.query[field];
    }

    if (req.query.dateFrom || req.query.dateTo) {
      filters[dateField] = {};
      if (req.query.dateFrom) filters[dateField].$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) filters[dateField].$lte = new Date(req.query.dateTo);
    }

    const [items, total] = await Promise.all([
      Model.find(filters)
        .sort({ [dateField]: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Model.countDocuments(filters)
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  });

  const create = asyncHandler(async (req, res) => {
    const payload = beforeSave({ ...req.body }, req);
    stripMetadata(payload);
    const item = await Model.create({ ...payload, user: req.user._id });
    res.status(201).json({ item });
  });

  const get = asyncHandler(async (req, res) => {
    const item = await Model.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) throw notFound(`${name} not found`);
    res.json({ item });
  });

  const update = asyncHandler(async (req, res) => {
    const payload = beforeSave({ ...req.body }, req);
    stripMetadata(payload);
    const item = await Model.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, payload, {
      new: true,
      runValidators: true
    });
    if (!item) throw notFound(`${name} not found`);
    res.json({ item });
  });

  const remove = asyncHandler(async (req, res) => {
    const item = await Model.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) throw notFound(`${name} not found`);
    res.json({ message: `${name} deleted`, id: req.params.id });
  });

  const bulkDelete = asyncHandler(async (req, res) => {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    if (!ids.length) throw new ApiError(400, 'ids array is required');
    const result = await Model.deleteMany({ _id: { $in: ids }, user: req.user._id });
    res.json({ message: `${name}s deleted`, count: result.deletedCount });
  });

  return { list, create, get, update, remove, bulkDelete };
}

function stripMetadata(payload) {
  delete payload._id;
  delete payload.id;
  delete payload.user;
  delete payload.createdAt;
  delete payload.updatedAt;
  delete payload.__v;
}
