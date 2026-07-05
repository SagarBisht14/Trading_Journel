import express from 'express';
import Note from '../models/Note.js';
import { crudController } from '../controllers/crudFactory.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const controller = crudController(Note, {
  name: 'Note',
  searchFields: ['title', 'content', 'tags'],
  dateField: 'updatedAt',
  beforeSave: (payload) => {
    if (typeof payload.tags === 'string') {
      payload.tags = payload.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
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
