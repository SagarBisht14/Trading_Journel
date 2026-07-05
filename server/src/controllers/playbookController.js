import Playbook from '../models/Playbook.js';
import { saveImageFiles } from '../middleware/upload.js';
import { notFound } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex, parseJSON } from '../utils/parsers.js';

function payload(body) {
  return {
    title: body.title,
    description: body.description || '',
    checklist: parseJSON(body.checklist, Array.isArray(body.checklist) ? body.checklist : []),
    rules: body.rules || '',
    entry: body.entry || '',
    exit: body.exit || '',
    riskRules: body.riskRules || '',
    commonMistakes: body.commonMistakes || ''
  };
}

export const listPlaybooks = asyncHandler(async (req, res) => {
  const filters = { user: req.user._id };
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'i');
    filters.$or = [{ title: regex }, { description: regex }, { rules: regex }, { entry: regex }, { exit: regex }];
  }
  const items = await Playbook.find(filters).sort({ updatedAt: -1 });
  res.json({ items, total: items.length, page: 1, pages: 1 });
});

export const createPlaybook = asyncHandler(async (req, res) => {
  const images = await saveImageFiles({ files: req.files || [], userId: req.user._id, folder: 'playbooks' });
  const item = await Playbook.create({ ...payload(req.body), exampleImages: images, user: req.user._id });
  res.status(201).json({ item });
});

export const getPlaybook = asyncHandler(async (req, res) => {
  const item = await Playbook.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw notFound('Playbook setup not found');
  res.json({ item });
});

export const updatePlaybook = asyncHandler(async (req, res) => {
  const item = await Playbook.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw notFound('Playbook setup not found');
  Object.assign(item, payload(req.body));
  const images = await saveImageFiles({ files: req.files || [], userId: req.user._id, folder: 'playbooks' });
  if (images.length) item.exampleImages.push(...images);
  await item.save();
  res.json({ item });
});

export const deletePlaybook = asyncHandler(async (req, res) => {
  const item = await Playbook.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!item) throw notFound('Playbook setup not found');
  res.json({ message: 'Playbook setup deleted', id: req.params.id });
});
