import Starring from "../models/starringModel.js";
import { ThrowError } from '../utils/ErrorUtils.js';
import mongoose from 'mongoose';

// CREATE
export const createStarring = async (req, res) => {
    try {
        const { name, movieId } = req.body;
        const starring_image = req.file ? req.file.location : undefined;

        // Check for duplicate by name
        const existingStarring = await Starring.findOne({ name });
        if (existingStarring) {
            return ThrowError(res, 400, 'Starring with this name already exists');
        }

        // Validate movieId if provided
        if (movieId && !mongoose.Types.ObjectId.isValid(movieId)) {
            return ThrowError(res, 400, 'Invalid movie ID');
        }

        const starringDoc = new Starring({
            name,
            starring_image,
            moviesId: movieId ? [movieId] : []
        });
        const savedStarring = await starringDoc.save();
        res.status(201).json(savedStarring);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// GET ALL
export const getAllStarring = async (req, res) => {
    try {
        const starrings = await Starring.find();
        if (!starrings || starrings.length === 0) return ThrowError(res, 404, 'No starrings found');
        res.json(starrings);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// GET BY ID
export const getStarringById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return ThrowError(res, 400, 'Invalid starring ID');
        }
        const starringDoc = await Starring.findById(req.params.id);
        if (!starringDoc) return ThrowError(res, 404, 'Starring not found');
        res.json(starringDoc);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// UPDATE
export const updateStarring = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return ThrowError(res, 400, 'Invalid starring ID');
        }
        const starringDoc = await Starring.findById(req.params.id);
        if (!starringDoc) {
            return ThrowError(res, 404, 'Starring not found');
        }

        // Handle image update
        if (req.file?.location) {
            starringDoc.starring_image = req.file.location;
        }

        // Handle name update
        starringDoc.name = req.body.name ?? starringDoc.name;

        // Handle moviesId update
        if (req.body.movieId) {
            // Validate movieId
            if (!mongoose.Types.ObjectId.isValid(req.body.movieId)) {
                return ThrowError(res, 400, 'Invalid movie ID');
            }

            // Check if movieId already exists in the array
            if (!starringDoc.moviesId.includes(req.body.movieId)) {
                starringDoc.moviesId.push(req.body.movieId);
            }
        }

        // Handle removing movieId if provided
        if (req.body.removeMovieId) {
            starringDoc.moviesId = starringDoc.moviesId.filter(
                id => id.toString() !== req.body.removeMovieId
            );
        }

        await starringDoc.save();
        res.status(200).json(starringDoc);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// DELETE
export const deleteStarring = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return ThrowError(res, 400, 'Invalid starring ID');
        }
        const starringDoc = await Starring.findByIdAndDelete(req.params.id);
        if (!starringDoc) return ThrowError(res, 404, 'Starring not found');
        res.json({ message: 'Starring deleted' });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get Starring by Movie ID
export const getStarringByMovieId = async (req, res) => {
    try {
        const { movieId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            return ThrowError(res, 400, 'Invalid movie ID');
        }

        const starrings = await Starring.find({ moviesId: movieId })
            .select('name starring_image moviesId createdAt updatedAt');

        if (!starrings || starrings.length === 0) {
            return res.status(200).json({
                status: true,
                message: "No starring found for this movie",
                data: []
            });
        }

        // Transform the data to ensure starring_image is included
        const transformedStarrings = starrings.map(starring => ({
            _id: starring._id,
            name: starring.name,
            starring_image: starring.starring_image || null,
            moviesId: starring.moviesId,
            createdAt: starring.createdAt,
            updatedAt: starring.updatedAt
        }));

        return res.status(200).json({
            status: true,
            message: "Starring fetched successfully",
            data: transformedStarrings
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};
