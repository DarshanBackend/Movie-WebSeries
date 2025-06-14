import User from '../models/userModel.js';
import {
    ThrowError
} from '../utils/ErrorUtils.js';
import mongoose from 'mongoose';

// ADD TO WATCHLIST
export const addToWatchlist = async (req, res) => {
    const {
        movieId
    } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
        return ThrowError(res, 400, 'Invalid ID')
    }

    const user = await User.findById(userId);
    if (!user) return ThrowError(res, 404, 'User not found');

    if (user.watchlist.includes(movieId)) {
        return ThrowError(res, 404, 'Already in watchlist')
    }

    user.watchlist.push(movieId);
    await user.save();
    res.status(200).json({
        status: true,
        message: 'Added to watchlist'
    })
};

// REMOVE FROM WATCHLIST
export const removeFromWatchlist = async (req, res) => {
    const { movieId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return ThrowError(res, 404, 'User not found');

    user.watchlist = user.watchlist.filter(id => id.toString() !== movieId);
    await user.save();

    res.status(200).json({ status: true, message: 'Removed from watchlist' });
};

// GET WATCHLIST
export const getWatchlist = async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).populate('watchlist');
    if (!user) return ThrowError(res, 404, 'User not found');

    res.status(200).json({
        status: true,
        watchlist: user.watchlist
    });
};