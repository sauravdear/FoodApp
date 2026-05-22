import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import storeRoutes from './routes/storeRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// --- Routes ---
app.use('/api/inventory', inventoryRoutes);
app.use('/api/stores', storeRoutes);

// --- Health check ---
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// --- 404 fallback ---
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// --- Global error handler ---
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// --- Start ---
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
