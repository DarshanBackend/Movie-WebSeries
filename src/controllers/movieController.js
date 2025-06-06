import Movie from '../models/movieModel.js';
import MovieCategory from '../models/movieCategoriesModel.js';
import { ThrowError } from '../utils/ErrorUtils.js';
import mongoose from 'mongoose';
import fs from 'fs';

// CREATE
export const createMovie = async (req, res) => {
    try {
        const {
            title, releaseYear, duration, category, languages,
            description, genre, contentDescriptor, director, long_description, type
        } = req.body;

        // Validate category
        if (!mongoose.Types.ObjectId.isValid(category)) {
            if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return ThrowError(res, 400, 'Invalid category ID');
        }
        const categoryExists = await MovieCategory.findById(category);
        if (!categoryExists) {
            if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return ThrowError(res, 404, 'Category not found');
        }

        // Handle thumbnail upload
        const thumbnail = req.file ? req.file.path : undefined;

        // Check for duplicate movie (by title)
        const existingMovie = await Movie.findOne({ title });
        if (existingMovie) {
            if (thumbnail && fs.existsSync(thumbnail)) fs.unlinkSync(thumbnail);
            return ThrowError(res, 400, 'A movie with this title already exists');
        }

        const movie = new Movie({
            title,
            thumbnail,
            releaseYear,
            duration,
            category,
            languages: Array.isArray(languages) ? languages : [languages],
            description,
            genre,
            contentDescriptor,
            director,
            long_description,
            type
        });

        const savedMovie = await movie.save();
        res.status(201).json(savedMovie);
    } catch (error) {
        if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return ThrowError(res, 500, error.message);
    }
};

// GET ALL
export const getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find().populate('category');
        if (!movies || movies.length === 0) return ThrowError(res, 404, 'No movies found');
        res.json(movies);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// GET BY ID
export const getMovieById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return ThrowError(res, 400, 'Invalid movie ID');
        }
        const movie = await Movie.findById(req.params.id).populate('category');
        if (!movie) return ThrowError(res, 404, 'Movie not found');
        res.json(movie);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// UPDATE
export const updateMovie = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return ThrowError(res, 400, 'Invalid movie ID');
        }

        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return ThrowError(res, 404, 'Movie not found');
        }

        // Handle new thumbnail upload
        if (req.file?.path) {
            if (movie.thumbnail && fs.existsSync(movie.thumbnail)) {
                fs.unlinkSync(movie.thumbnail);
            }
            movie.thumbnail = req.file.path;
        }

        // Update fields
        movie.title = req.body.title ?? movie.title;
        movie.releaseYear = req.body.releaseYear ?? movie.releaseYear;
        movie.duration = req.body.duration ?? movie.duration;
        movie.category = req.body.category ?? movie.category;
        movie.languages = req.body.languages ?? movie.languages;
        movie.description = req.body.description ?? movie.description;
        movie.genre = req.body.genre ?? movie.genre;
        movie.contentDescriptor = req.body.contentDescriptor ?? movie.contentDescriptor;
        movie.director = req.body.director ?? movie.director;
        movie.long_description = req.body.long_description ?? movie.long_description;
        movie.type = req.body.type ?? movie.type;

        await movie.save();

        return res.status(200).json({
            message: "Movie updated successfully",
            data: movie
        });

    } catch (error) {
        if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return ThrowError(res, 500, error.message);
    }
};

// DELETE
export const deleteMovie = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return ThrowError(res, 400, 'Invalid movie ID');
        }
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        if (!deletedMovie) return ThrowError(res, 404, 'Movie not found');

        // Delete the thumbnail if it exists
        if (deletedMovie.thumbnail && fs.existsSync(deletedMovie.thumbnail)) {
            fs.unlinkSync(deletedMovie.thumbnail);
        }

        res.json({ message: 'Movie deleted' });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};
