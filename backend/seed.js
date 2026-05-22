import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '8.8.4.4']);
import FoodItem from './models/FoodItem.js';
import Store from './models/Store.js';
import TransferLog from './models/TransferLog.js';

await mongoose.connect(process.env.MONGO_URI);
console.log('Connected — seeding...');

await Promise.all([FoodItem.deleteMany(), Store.deleteMany(), TransferLog.deleteMany()]);

const now = new Date();
const days = (n) => new Date(now.getTime() + n * 86400000);

const [yogurt, milk, cheese, bread] = await FoodItem.insertMany([
  { name: 'Greek Yogurt',   sku: 'YOGURT-001', batchNumber: 'B001', expirationDate: days(1.5), basePrice: 3.99 },
  { name: 'Whole Milk',     sku: 'MILK-002',   batchNumber: 'B002', expirationDate: days(2),   basePrice: 1.99 },
  { name: 'Cheddar Cheese', sku: 'CHSE-003',   batchNumber: 'B003', expirationDate: days(2.5), basePrice: 5.49 },
  { name: 'Sourdough Bread',sku: 'BRED-004',   batchNumber: 'B004', expirationDate: days(1),   basePrice: 4.25 },
]);

await Store.insertMany([
  {
    storeName: 'Downtown Fresh',
    location: { address: '12 Main St', city: 'Chicago', state: 'IL', zipCode: '60601' },
    inventory: [
      { foodItemId: yogurt._id, currentStock: 80,  salesVelocity: 1  }, // SLOW
      { foodItemId: milk._id,   currentStock: 120, salesVelocity: 2  }, // SLOW
      { foodItemId: cheese._id, currentStock: 60,  salesVelocity: 1  }, // SLOW
      { foodItemId: bread._id,  currentStock: 50,  salesVelocity: 0  }, // SLOW
    ],
  },
  {
    storeName: 'North Side Market',
    location: { address: '88 Oak Ave', city: 'Chicago', state: 'IL', zipCode: '60614' },
    inventory: [
      { foodItemId: yogurt._id, currentStock: 8,  salesVelocity: 30 }, // FAST
      { foodItemId: milk._id,   currentStock: 10, salesVelocity: 40 }, // FAST
      { foodItemId: cheese._id, currentStock: 5,  salesVelocity: 20 }, // FAST
      { foodItemId: bread._id,  currentStock: 6,  salesVelocity: 25 }, // FAST
    ],
  },
  {
    storeName: 'West Loop Grocer',
    location: { address: '300 Randolph St', city: 'Chicago', state: 'IL', zipCode: '60606' },
    inventory: [
      { foodItemId: yogurt._id, currentStock: 12, salesVelocity: 15 }, // FAST
      { foodItemId: milk._id,   currentStock: 15, salesVelocity: 18 }, // FAST
      { foodItemId: bread._id,  currentStock: 4,  salesVelocity: 22 }, // FAST
    ],
  },
]);

console.log('Seeded: 4 food items, 3 stores');
await mongoose.disconnect();
