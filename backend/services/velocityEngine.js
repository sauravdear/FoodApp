import FoodItem from '../models/FoodItem.js';
import Store from '../models/Store.js';

/**
 * VELOCITY ENGINE
 *
 * Core analysis service. Given a threshold window (days), it:
 *   1. Finds food items expiring within that window.
 *   2. For each expiring item, scans every store's inventory.
 *   3. Computes days-until-expiry and compares it against
 *      how long the current stock would last at the store's
 *      current salesVelocity:
 *
 *        daysToSellOut = currentStock / salesVelocity
 *
 *      If daysToSellOut > daysUntilExpiry the store cannot
 *      sell its stock before the item expires → SLOW store.
 *
 *   4. Tags stores as HIGH_VELOCITY when salesVelocity > the
 *      provided threshold AND currentStock is below a low-stock
 *      guard (default: 20 units).
 *
 * Returns a structured array ready to be sent as a JSON payload.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * @param {number} expirationDate  - JS Date of item expiry
 * @returns {number} days remaining (can be negative if already expired)
 */
const getDaysUntilExpiry = (expirationDate) => {
  const diff = new Date(expirationDate) - Date.now();
  return diff / MS_PER_DAY; // fractional days, not rounded
};

/**
 * Classify every store's inventory entry for a given food item.
 *
 * @param {Object[]} stores         - All Store documents (populated or raw)
 * @param {string}   foodItemId     - ObjectId string of the food item
 * @param {number}   daysUntilExpiry
 * @param {number}   velocityThreshold - min units/day to be considered "fast"
 * @param {number}   lowStockGuard     - max units to be considered "low stock"
 */
const classifyStores = (stores, foodItemId, daysUntilExpiry, velocityThreshold, lowStockGuard) => {
  const slowStores = [];
  const fastStores = [];

  for (const store of stores) {
    const entry = store.inventory.find(
      (inv) => inv.foodItemId.toString() === foodItemId.toString()
    );

    if (!entry || entry.currentStock === 0) continue;

    const { currentStock, salesVelocity } = entry;

    // Days needed to fully sell current stock at this store's velocity.
    // Treat velocity=0 as "will never sell" → Infinity days to sell out.
    const daysToSellOut = salesVelocity > 0 ? currentStock / salesVelocity : Infinity;

    const isSlow =
      salesVelocity < velocityThreshold ||
      daysToSellOut > daysUntilExpiry; // stock will outlast the item

    const isFast =
      salesVelocity >= velocityThreshold &&
      currentStock <= lowStockGuard; // selling fast but running low

    if (isSlow) {
      // Units that will be unsellable before expiry at this store's pace
      const surplusUnits =
        salesVelocity > 0
          ? Math.max(0, Math.floor(currentStock - salesVelocity * daysUntilExpiry))
          : currentStock;

      slowStores.push({
        storeId: store._id,
        storeName: store.storeName,
        location: store.location,
        currentStock,
        salesVelocity,
        daysToSellOut: isFinite(daysToSellOut) ? +daysToSellOut.toFixed(2) : null,
        surplusUnits,
      });
    }

    if (isFast) {
      // Demand gap: units needed to keep selling at current pace until expiry
      const demandGap = Math.ceil(salesVelocity * daysUntilExpiry - currentStock);

      fastStores.push({
        storeId: store._id,
        storeName: store.storeName,
        location: store.location,
        currentStock,
        salesVelocity,
        demandGap: Math.max(0, demandGap),
      });
    }
  }

  return { slowStores, fastStores };
};

/**
 * Build transfer recommendations pairing slow stores with fast stores.
 * Greedy allocation: take as many units as possible from the biggest
 * surplus slow store to satisfy each fast store's demand gap.
 *
 * @param {Object}   foodItem
 * @param {Object[]} slowStores
 * @param {Object[]} fastStores
 * @param {number}   daysUntilExpiry
 */
const buildRecommendations = (foodItem, slowStores, fastStores, daysUntilExpiry) => {
  const recommendations = [];

  // Work on mutable copies so we can track remaining surplus
  const surplusPool = slowStores.map((s) => ({ ...s, available: s.surplusUnits }));

  for (const fast of fastStores) {
    let remaining = fast.demandGap;

    for (const slow of surplusPool) {
      if (remaining <= 0) break;
      if (slow.available <= 0) continue;

      const transferQty = Math.min(slow.available, remaining);
      slow.available -= transferQty;
      remaining -= transferQty;

      recommendations.push({
        foodItem: {
          id: foodItem._id,
          name: foodItem.name,
          sku: foodItem.sku,
          batchNumber: foodItem.batchNumber,
          expirationDate: foodItem.expirationDate,
          daysUntilExpiry: +daysUntilExpiry.toFixed(1),
        },
        sourceStore: {
          id: slow.storeId,
          name: slow.storeName,
          location: slow.location,
          currentStock: slow.currentStock,
          salesVelocity: slow.salesVelocity,
          surplusUnits: slow.surplusUnits,
        },
        destinationStore: {
          id: fast.storeId,
          name: fast.storeName,
          location: fast.location,
          currentStock: fast.currentStock,
          salesVelocity: fast.salesVelocity,
          demandGap: fast.demandGap,
        },
        recommendedTransferQty: transferQty,
        reason: `Move ${transferQty} units of "${foodItem.name}" (SKU: ${foodItem.sku}) from slow store "${slow.storeName}" to fast store "${fast.storeName}" — item expires in ${daysUntilExpiry.toFixed(1)} day(s).`,
      });
    }
  }

  return recommendations;
};

/**
 * Main export: run the full velocity analysis.
 *
 * @param {Object} options
 * @param {number} [options.expiryWindowDays=3]      - Flag items expiring within N days
 * @param {number} [options.velocityThreshold=5]     - Min units/day to be "fast"
 * @param {number} [options.lowStockGuard=20]        - Max stock to be considered "low"
 */
export const analyzeInventory = async ({
  expiryWindowDays = 3,
  velocityThreshold = 5,
  lowStockGuard = 20,
} = {}) => {
  const windowDate = new Date(Date.now() + expiryWindowDays * MS_PER_DAY);

  // 1. Fetch items expiring within the threshold window
  const expiringItems = await FoodItem.find({
    expirationDate: { $lte: windowDate, $gte: new Date() },
  }).lean();

  if (expiringItems.length === 0) {
    return { expiringItems: [], recommendations: [] };
  }

  // 2. Fetch all stores that carry at least one of the expiring items
  const expiringIds = expiringItems.map((item) => item._id);
  const stores = await Store.find({
    'inventory.foodItemId': { $in: expiringIds },
  }).lean();

  // 3. For each expiring item, classify stores and build recommendations
  const allRecommendations = [];

  for (const item of expiringItems) {
    const daysUntilExpiry = getDaysUntilExpiry(item.expirationDate);
    if (daysUntilExpiry <= 0) continue; // already expired, skip

    const { slowStores, fastStores } = classifyStores(
      stores,
      item._id,
      daysUntilExpiry,
      velocityThreshold,
      lowStockGuard
    );

    const recs = buildRecommendations(item, slowStores, fastStores, daysUntilExpiry);
    allRecommendations.push(...recs);
  }

  return {
    analysisWindow: { days: expiryWindowDays, cutoffDate: windowDate },
    expiringItemCount: expiringItems.length,
    recommendations: allRecommendations,
  };
};
