import express from 'express';
import { adminOverview, deleteClientRecord, getAdminUserData, listAdminUsers } from '../controllers/adminController.js';
import { adminOnly, protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, adminOnly);
router.get('/overview', adminOverview);
router.get('/users', listAdminUsers);
router.get('/users/:userId/data', getAdminUserData);
router.delete('/users/:userId/:collection/:recordId', deleteClientRecord);

export default router;
