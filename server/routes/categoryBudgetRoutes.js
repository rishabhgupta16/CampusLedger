import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getCategoryBudgets,
  createCategoryBudget,
  updateCategoryBudget,
  deleteCategoryBudget,
} from '../controllers/categoryBudgetController.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getCategoryBudgets).post(createCategoryBudget);
router.route('/:id').put(updateCategoryBudget).delete(deleteCategoryBudget);

export default router;
