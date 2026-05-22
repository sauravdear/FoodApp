import Store from '../models/Store.js';

/** GET /api/stores — list all stores */
export const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find()
      .populate('inventory.foodItemId', 'name sku expirationDate basePrice')
      .lean();
    return res.status(200).json({ success: true, count: stores.length, stores });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** GET /api/stores/:id — single store with populated inventory */
export const getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate('inventory.foodItemId', 'name sku expirationDate basePrice')
      .lean();

    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });

    return res.status(200).json({ success: true, store });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** POST /api/stores — create a store */
export const createStore = async (req, res) => {
  try {
    const store = await Store.create(req.body);
    return res.status(201).json({ success: true, store });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/stores/:id/inventory/:foodItemId/velocity
 * Update the salesVelocity for a specific item at a store.
 * The velocity engine calls this after re-calculating daily averages.
 */
export const updateSalesVelocity = async (req, res) => {
  const { salesVelocity } = req.body;
  if (salesVelocity === undefined || salesVelocity < 0) {
    return res.status(400).json({ success: false, message: 'A non-negative salesVelocity is required.' });
  }

  try {
    const store = await Store.findOneAndUpdate(
      {
        _id: req.params.id,
        'inventory.foodItemId': req.params.foodItemId,
      },
      { $set: { 'inventory.$.salesVelocity': salesVelocity } },
      { new: true }
    );

    if (!store) return res.status(404).json({ success: false, message: 'Store or inventory entry not found.' });

    return res.status(200).json({ success: true, store });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
