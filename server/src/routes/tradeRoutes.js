import express from 'express';
import {
  bulkDeleteTrades,
  createTrade,
  deleteScreenshot,
  deleteTrade,
  duplicateTrade,
  getTrade,
  listTrades,
  restoreTrade,
  updateTrade
} from '../controllers/tradeController.js';
import { exportTradesCsv, exportTradesExcel, importTradesFile } from '../controllers/backupController.js';
import { protect } from '../middleware/auth.js';
import { runMulter, uploadDataFile, uploadTradeImages } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/', listTrades);
router.get('/export/csv', exportTradesCsv);
router.get('/export/excel', exportTradesExcel);
router.post('/import', runMulter(uploadDataFile), importTradesFile);
router.post('/', runMulter(uploadTradeImages), createTrade);
router.post('/bulk-delete', bulkDeleteTrades);
router.get('/:id', getTrade);
router.put('/:id', runMulter(uploadTradeImages), updateTrade);
router.delete('/:id', deleteTrade);
router.post('/:id/restore', restoreTrade);
router.post('/:id/duplicate', duplicateTrade);
router.delete('/:tradeId/screenshots/:imageId', deleteScreenshot);

export default router;
