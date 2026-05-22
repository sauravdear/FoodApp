import { Router } from 'express';
import {
  getAllStores,
  getStoreById,
  createStore,
  updateSalesVelocity,
} from '../controllers/storeController.js';

const router = Router();

router.get('/', getAllStores);
router.post('/', createStore);
router.get('/:id', getStoreById);
router.patch('/:id/inventory/:foodItemId/velocity', updateSalesVelocity);

export default router;
