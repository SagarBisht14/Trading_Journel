import express from 'express';
import Journal from '../models/Journal.js';
import { crudController } from '../controllers/crudFactory.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const controller = crudController(Journal, {
  name: 'Journal',
  searchFields: ['mood', 'marketBias', 'lessons', 'goals', 'reflection'],
  filterFields: ['mood'],
  dateField: 'date'
});

router.use(protect);
router.get('/', controller.list);
router.post('/', controller.create);
router.post('/bulk-delete', controller.bulkDelete);
router.get('/:id', controller.get);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
