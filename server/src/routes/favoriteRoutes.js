import express from 'express';
import { toggleFavorite, getFavorites } from '../controllers/favoriteController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect, authorize('customer'));

router.get('/', getFavorites);
router.post('/:workerId', toggleFavorite);

export default router;
