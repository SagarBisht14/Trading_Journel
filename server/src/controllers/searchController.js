import Trade from '../models/Trade.js';
import Journal from '../models/Journal.js';
import Watchlist from '../models/Watchlist.js';
import Playbook from '../models/Playbook.js';
import Note from '../models/Note.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/parsers.js';

export const globalSearch = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) {
    res.json({ trades: [], journals: [], watchlist: [], playbooks: [], notes: [] });
    return;
  }

  const regex = new RegExp(escapeRegex(q), 'i');
  const user = req.user._id;
  const tradeOr = [{ instrument: regex }, { strategy: regex }, { setup: regex }, { notes: regex }, { lessonsLearned: regex }];
  if (/^[a-f\d]{24}$/i.test(q)) tradeOr.unshift({ _id: q });
  const [trades, journals, watchlist, playbooks, notes] = await Promise.all([
    Trade.find({
      user,
      deletedAt: null,
      $or: tradeOr
    }).limit(8),
    Journal.find({ user, $or: [{ mood: regex }, { marketBias: regex }, { lessons: regex }, { reflection: regex }] }).limit(5),
    Watchlist.find({ user, $or: [{ instrument: regex }, { reason: regex }, { notes: regex }] }).limit(5),
    Playbook.find({ user, $or: [{ title: regex }, { description: regex }, { rules: regex }] }).limit(5),
    Note.find({ user, $or: [{ title: regex }, { content: regex }, { tags: regex }] }).limit(5)
  ]);

  res.json({ trades, journals, watchlist, playbooks, notes });
});
