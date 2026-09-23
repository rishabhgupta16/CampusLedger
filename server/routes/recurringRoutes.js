import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  markRecurringExpensePaid,
} from '../controllers/recurringController.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getRecurringExpenses).post(createRecurringExpense);
router.route('/:id').put(updateRecurringExpense).delete(deleteRecurringExpense);
router.post('/:id/pay', markRecurringExpensePaid);

export default router;
