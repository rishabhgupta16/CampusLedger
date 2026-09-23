import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getBudget, updateBudget } from '../controllers/budgetController.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getBudget).put(updateBudget);

export default router;
