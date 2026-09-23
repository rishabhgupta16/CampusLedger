import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getGoals, createGoal, updateGoal, deleteGoal, addMoney } from '../controllers/goalController.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getGoals).post(createGoal);
router.route('/:id').put(updateGoal).delete(deleteGoal);
router.post('/:id/add-money', addMoney);

export default router;
