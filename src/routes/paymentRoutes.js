import express from 'express';
import { createPayment, getAllPayments, getPaymentById, updatePayment, deletePayment } from '../controllers/paymentController.js';
import { userAuth } from '../middlewares/auth.js';

const paymentRoutes = express.Router();

paymentRoutes.post('/createPayment', userAuth, createPayment);
paymentRoutes.get('/getAllPayments', getAllPayments);
paymentRoutes.get('/getPaymentById/:id', getPaymentById);
paymentRoutes.put('/updatePayment/:id', updatePayment);
paymentRoutes.delete('/deletePayment/:id', deletePayment);

export default paymentRoutes; 