import mongoose from 'mongoose';

const inventoryEntrySchema = new mongoose.Schema(
  {
    foodItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: true,
    },
    // How many units are physically on the shelf right now
    currentStock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    // Average units sold per day for this item at this store.
    // Recalculated by the velocity engine on each analysis run.
    salesVelocity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const storeSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
    },
    location: {
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
    },
    inventory: [inventoryEntrySchema],
  },
  { timestamps: true }
);

const Store = mongoose.model('Store', storeSchema);
export default Store;
