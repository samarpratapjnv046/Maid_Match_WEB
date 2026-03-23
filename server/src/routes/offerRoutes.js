import express from 'express';
import { getActiveOffers } from '../controllers/offerController.js';

const router = express.Router();

// Public — no auth required
router.get('/', getActiveOffers);

export default router;
