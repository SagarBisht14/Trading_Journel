import express from 'express';
import Watchlist from '../models/Watchlist.js';
import { crudController } from '../controllers/crudFactory.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const controller = crudController(Watchlist, {
  name: 'Watchlist item',
  searchFields: ['instrument', 'reason', 'target', 'invalidation', 'notes'],
  filterFields: ['status'],
  dateField: 'updatedAt'
});

router.use(protect);
router.get('/', controller.list);
router.post('/', controller.create);
router.post('/bulk-delete', controller.bulkDelete);
router.get('/:id', controller.get);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
