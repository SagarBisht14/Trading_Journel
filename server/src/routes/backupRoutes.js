import express from 'express';
import { exportJson, importJson, importTradesFile } from '../controllers/backupController.js';
import { protect } from '../middleware/auth.js';
import { runMulter, uploadDataFile } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);
router.get('/export/json', exportJson);
router.post('/import/json', importJson);
router.post('/import/csv', runMulter(uploadDataFile), importTradesFile);

export default router;
