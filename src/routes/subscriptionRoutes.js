import express from 'express';
import { subscribeToPlan } from '../controllers/subscriptionController';

const router = express.Router();

// Correct route definition
router.post('/subscribe', subscribeToPlan);

export default router;
