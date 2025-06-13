import express from 'express';
import { addToWatchlist , removeFromWatchlist , getWatchlist } from '../controllers/watchlistController.js';
import { userAuth } from '../middlewares/auth.js';

const watchlistRouter  = express.Router();

watchlistRouter.post('/add', userAuth, addToWatchlist);
watchlistRouter.post('/remove', userAuth, removeFromWatchlist);
watchlistRouter.get('/', userAuth, getWatchlist);

export default watchlistRouter;