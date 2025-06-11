import Movie from '../models/movieModel.js';
import MovieCategory from '../models/movieCategoriesModel.js';
import { ThrowError } from '../utils/ErrorUtils.js';
import mongoose from 'mongoose';
// import fs from 'fs'; // Removed fs as local file operations are no longer needed
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Helper function to delete file from S3
const deleteFromS3 = async (fileUrl) => {
    if (!fileUrl || !fileUrl.startsWith('http')) return;

    try {
        const key = fileUrl.split('/').slice(-2).join('/');
        await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        }));
    } catch (error) {
        // Silently handle S3 errors
        console.log('S3 delete error:', error.message);
    }
};

// CREATE MOVIE WITH FILE UPLOAD
export const createMovie = async (req, res) => {
    try {
        const {
            title, releaseYear, duration, category, languages,
            description, genre, contentDescriptor, director, long_description, type
        } = req.body;

        // Input validation
        if (!title || !category || !languages || !description) {
            // No local file cleanup needed as files are directly uploaded to S3
            return ThrowError(res, 400, 'Missing required fields');
        }

        let parsedReleaseYear = undefined;
        if (releaseYear) {
            parsedReleaseYear = parseInt(releaseYear);
            if (isNaN(parsedReleaseYear)) {
                // No local file cleanup needed
                return ThrowError(res, 400, 'Invalid releaseYear. Must be a number.');
            }
        }

        let parsedDuration = undefined;
        if (duration) {
            parsedDuration = parseInt(duration);
            if (isNaN(parsedDuration)) {
                // No local file cleanup needed
                return ThrowError(res, 400, 'Invalid duration. Must be a number.');
            }
        }

        // Validate category
        if (!mongoose.Types.ObjectId.isValid(category)) {
            // No local file cleanup needed
            return ThrowError(res, 400, 'Invalid category ID');
        }
        const categoryExists = await MovieCategory.findById(category);
        if (!categoryExists) {
            // No local file cleanup needed
            return ThrowError(res, 404, 'Category not found');
        }

        // Handle file uploads
        let thumbnail = undefined;
        let video = undefined;

        if (req.files) {
            if (req.files.thumbnail && req.files.thumbnail[0]) {
                thumbnail = req.files.thumbnail[0].location; // Use .location for S3 URL
            }
            if (req.files.video && req.files.video[0]) {
                video = req.files.video[0].location; // Use .location for S3 URL
            }
        }

        // Check for duplicate movie (by title)
        const existingMovie = await Movie.findOne({ title });
        if (existingMovie) {
            // No local file cleanup needed
            return ThrowError(res, 400, 'A movie with this title already exists');
        }

        const movie = new Movie({
            title,
            thumbnail,
            video,
            releaseYear: parsedReleaseYear,
            duration: parsedDuration,
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

        return res.status(201).json({
            status: true,
            message: "Movie created successfully",
            data: {
                movie: savedMovie,
                fileInfo: req.files ? {
                    thumbnail: req.files.thumbnail ? {
                        url: req.files.thumbnail[0].location,
                        type: req.files.thumbnail[0].mimetype
                    } : null,
                    video: req.files.video ? {
                        url: req.files.video[0].location,
                        type: req.files.video[0].mimetype
                    } : null
                } : null
            }
        });
    } catch (error) {
        // No local file cleanup needed
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
            // No local file cleanup needed
            return ThrowError(res, 400, 'Invalid movie ID');
        }

        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            // No local file cleanup needed
            return ThrowError(res, 404, 'Movie not found');
        }

        // Handle new thumbnail upload
        if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
            // Delete old thumbnail from S3 if it exists
            if (movie.thumbnail) {
                await deleteFromS3(movie.thumbnail);
            }
            // Set new thumbnail from S3 URL
            movie.thumbnail = req.files.thumbnail[0].location; 
        }

        // Handle new video upload
        if (req.files && req.files.video && req.files.video[0]) {
            // Delete old video from S3 if it exists
            if (movie.video) {
                await deleteFromS3(movie.video);
            }
            // Set new video from S3 URL
            movie.video = req.files.video[0].location;
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
            status: true,
            message: "Movie updated successfully",
            data: {
                movie,
                fileInfo: req.files ? {
                    thumbnail: req.files.thumbnail ? {
                        url: req.files.thumbnail[0].location,
                        type: req.files.thumbnail[0].mimetype
                    } : null,
                    video: req.files.video ? {
                        url: req.files.video[0].location,
                        type: req.files.video[0].mimetype
                    } : null
                } : null
            }
        });

    } catch (error) {
        // No local file cleanup needed
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

        // Delete files from S3 only
        if (deletedMovie.thumbnail) {
            await deleteFromS3(deletedMovie.thumbnail);
        }

        if (deletedMovie.video) {
            await deleteFromS3(deletedMovie.video);
        }

        res.json({
            status: true,
            message: 'Movie deleted successfully'
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};


