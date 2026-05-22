import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food item name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    batchNumber: {
      type: String,
      required: [true, 'Batch number is required'],
      trim: true,
    },
    expirationDate: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative'],
    },
  },
  { timestamps: true }
);

// Virtual: days remaining until expiration from today
foodItemSchema.virtual('daysUntilExpiry').get(function () {
  const now = new Date();
  const diff = this.expirationDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
export default FoodItem;
