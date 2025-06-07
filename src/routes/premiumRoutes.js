import express from 'express';
import { createPremium, getAllPremium, getPremiumById, updatePremium, deletePremium } from '../controllers/premiumController.js';

const premiumRoutes = express.Router();

premiumRoutes.post('/createPremium', createPremium);
premiumRoutes.get('/getAllPremium/', getAllPremium);
premiumRoutes.get('/getPremiumById/:id', getPremiumById);
premiumRoutes.put('/updatePremium/:id', updatePremium);
premiumRoutes.delete('/deletePremium/:id', deletePremium);

export default premiumRoutes