import express from 'express';
import { aiInsights, analyticsSummary } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/summary', analyticsSummary);
router.get('/insights', aiInsights);

export default router;
