import express from 'express';
import {
  createPlaybook,
  deletePlaybook,
  getPlaybook,
  listPlaybooks,
  updatePlaybook
} from '../controllers/playbookController.js';
import { protect } from '../middleware/auth.js';
import { runMulter, uploadTradeImages } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);
router.get('/', listPlaybooks);
router.post('/', runMulter(uploadTradeImages), createPlaybook);
router.get('/:id', getPlaybook);
router.put('/:id', runMulter(uploadTradeImages), updatePlaybook);
router.delete('/:id', deletePlaybook);

export default router;
