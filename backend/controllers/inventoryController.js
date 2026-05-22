import Store from '../models/Store.js';
import TransferLog from '../models/TransferLog.js';
import { analyzeInventory } from '../services/velocityEngine.js';

/**
 * GET /api/inventory/recommendations
 *
 * Query params (all optional):
 *   - expiryWindowDays  (default 3)  : flag items expiring within N days
 *   - velocityThreshold (default 5)  : min units/day to classify a store as "fast"
 *   - lowStockGuard     (default 20) : max current stock to be considered "low"
 */
export const getTransferRecommendations = async (req, res) => {
  try {
    const expiryWindowDays = Number(req.query.expiryWindowDays) || 3;
    const velocityThreshold = Number(req.query.velocityThreshold) || 5;
    const lowStockGuard = Number(req.query.lowStockGuard) || 20;

    const result = await analyzeInventory({ expiryWindowDays, velocityThreshold, lowStockGuard });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('getTransferRecommendations error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/inventory/transfer
 *
 * Sequentially:
 *   1. Decrements stock at sourceStoreId (with a stock-sufficiency guard)
 *   2. Increments stock at destinationStoreId
 *   3. Creates a TransferLog record
 *
 * NOTE: Uses sequential writes without a Mongoose session transaction so it
 * works on a standalone MongoDB instance. When connected to a replica set
 * (e.g. MongoDB Atlas), wrap these three ops in a session transaction for
 * full atomicity.
 *
 * Body: { foodItemId, sourceStoreId, destinationStoreId, quantity }
 */
export const executeTransfer = async (req, res) => {
  const { foodItemId, sourceStoreId, destinationStoreId, quantity } = req.body;

  if (!foodItemId || !sourceStoreId || !destinationStoreId || !quantity) {
    return res.status(400).json({
      success: false,
      message: 'foodItemId, sourceStoreId, destinationStoreId, and quantity are all required.',
    });
  }

  const qty = Number(quantity);
  if (qty <= 0) {
    return res.status(400).json({ success: false, message: 'Quantity must be greater than 0.' });
  }

  try {
    // 1. Decrement source — atomic $inc only fires if stock is sufficient
    const sourceUpdate = await Store.findOneAndUpdate(
      {
        _id: sourceStoreId,
        inventory: {
          $elemMatch: { foodItemId, currentStock: { $gte: qty } },
        },
      },
      { $inc: { 'inventory.$.currentStock': -qty } },
      { new: true }
    );

    if (!sourceUpdate) {
      return res.status(400).json({
        success: false,
        message: 'Source store not found or insufficient stock for this item.',
      });
    }

    // 2. Increment destination — update existing entry or push a new one
    const destHasItem = await Store.findOne({
      _id: destinationStoreId,
      'inventory.foodItemId': foodItemId,
    });

    if (destHasItem) {
      await Store.findOneAndUpdate(
        { _id: destinationStoreId, 'inventory.foodItemId': foodItemId },
        { $inc: { 'inventory.$.currentStock': qty } }
      );
    } else {
      await Store.findByIdAndUpdate(destinationStoreId, {
        $push: { inventory: { foodItemId, currentStock: qty, salesVelocity: 0 } },
      });
    }

    // 3. Audit log
    const log = await TransferLog.create({
      foodItemId,
      sourceStoreId,
      destinationStoreId,
      quantity: qty,
      status: 'Completed',
      timestamp: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: `Successfully transferred ${qty} unit(s).`,
      transferLog: log,
    });
  } catch (error) {
    console.error('executeTransfer error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/inventory/transfers
 * Returns full transfer history, newest first.
 */
export const getTransferHistory = async (req, res) => {
  try {
    const logs = await TransferLog.find()
      .populate('foodItemId', 'name sku expirationDate')
      .populate('sourceStoreId', 'storeName location')
      .populate('destinationStoreId', 'storeName location')
      .sort({ timestamp: -1 })
      .lean();

    return res.status(200).json({ success: true, count: logs.length, transfers: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
