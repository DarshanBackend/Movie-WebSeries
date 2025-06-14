import express from 'express';
import { subscribeToPlan } from '../controllers/subscriptionController.js';

const subscribeRouter = express.Router();

subscribeRouter.post('/subscribe', subscribeToPlan);

export default subscribeRouter;
