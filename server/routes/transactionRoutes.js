import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';

const router = express.Router();

// Every route below requires a valid authenticated user.
router.use(protect);

router.route('/').get(getTransactions).post(createTransaction);

router.route('/:id').put(updateTransaction).delete(deleteTransaction);

export default router;
