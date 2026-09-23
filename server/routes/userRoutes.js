import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile } from '../controllers/userController.js';

const router = express.Router();

router.use(protect);

router.route('/profile').get(getProfile).put(updateProfile);

export default router;
