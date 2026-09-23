import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDB, getDbStatus } from './config/db.js';
import { notFound } from './middleware/notFoundMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import categoryBudgetRoutes from './routes/categoryBudgetRoutes.js';
import userRoutes from './routes/userRoutes.js';
import recurringRoutes from './routes/recurringRoutes.js';
import goalRoutes from './routes/goalRoutes.js';

// Load server/.env explicitly (by absolute path) so it loads correctly
// regardless of which directory `node`/`nodemon` was launched from.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// --- Core middleware ---
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// --- Health check ---
// GET /api/health — used to verify the API (and optionally the DB) is reachable.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampusLedger API is running',
    dbStatus: getDbStatus(),
  });
});

// --- Feature routes ---
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/category-budgets', categoryBudgetRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/goals', goalRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Server] CampusLedger API listening on http://localhost:${PORT}`);
    console.log(`[Server] Allowing requests from CLIENT_URL: ${CLIENT_URL}`);
  });
}

start();
