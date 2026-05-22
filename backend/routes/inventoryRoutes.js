import { Router } from 'express';
import {
  getTransferRecommendations,
  executeTransfer,
  getTransferHistory,
} from '../controllers/inventoryController.js';

const router = Router();

// Run the velocity engine and return recommended transfers
router.get('/recommendations', getTransferRecommendations);

// Atomically move stock between stores and write a TransferLog
router.post('/transfer', executeTransfer);

// Fetch full transfer audit history
router.get('/transfers', getTransferHistory);

export default router;
