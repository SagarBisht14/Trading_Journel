import express from 'express';
import Goal from '../models/Goal.js';
import { crudController } from '../controllers/crudFactory.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const controller = crudController(Goal, {
  name: 'Goal',
  searchFields: ['title', 'description'],
  filterFields: ['type', 'completed'],
  dateField: 'targetDate',
  beforeSave: (payload) => {
    if (payload.completed === true || payload.completed === 'true') payload.completedAt = new Date();
    if (payload.completed === false || payload.completed === 'false') payload.completedAt = null;
    return payload;
  }
});

router.use(protect);
router.get('/', controller.list);
router.post('/', controller.create);
router.post('/bulk-delete', controller.bulkDelete);
router.get('/:id', controller.get);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
