import Movie from '../models/movieModel.js';
import MovieCategory from '../models/movieCategoriesModel.js';
import userModel from '../models/userModel.js';
import { ThrowError } from '../utils/ErrorUtils.js';
import mongoose from 'mongoose';
import { S3Client, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { URL } from 'url';

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
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
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key
        }));
    } catch (error) {
        // Silently handle S3 errors
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
        const { id } = req.params;
        const user = req.user; // Will be undefined for non-authenticated users

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return ThrowError(res, 400, 'Invalid movie ID');
        }

        const movie = await Movie.findById(id).populate('category');
        if (!movie) {
            return ThrowError(res, 404, 'Movie not found');
        }

        // Check if movie is premium content
        const isPremium = movie.category?.isPremium || false;

        // If movie is premium, check user subscription
        if (isPremium) {
            if (!user) {
                return ThrowError(res, 401, "Please login to access premium content");
            }

            // Check if user has active subscription
            const hasActiveSubscription = user.isSubscribed &&
                user.endDate &&
                new Date() <= new Date(user.endDate);

            if (!hasActiveSubscription) {
                return ThrowError(res, 403, "Please subscribe to access premium content");
            }
        }

        // Generate video URL
        let videoUrl = null;
        if (movie.video) {
            videoUrl = `/api/movies/streamVideo/${movie._id}`;
        }

        // Return movie data with video URL
        return res.status(200).json({
            status: true,
            message: "Movie fetched successfully",
            data: {
                ...movie.toObject(),
                video: videoUrl
            }
        });
    } catch (error) {
        console.error('Error in getMovieById:', error);
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

// Get Trending Movies
export const getTrendingMovies = async (req, res) => {
    try {
        const trendingMovies = await Movie.find({ type: 'movie' })
            .sort({ views: -1, rating: -1 })
            .limit(10)
            .populate('category');

        return res.status(200).json({
            status: true,
            message: "Trending movies fetched successfully",
            data: trendingMovies
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get Popular Series
export const getPopularSeries = async (req, res) => {
    try {
        const popularSeries = await Movie.find({ type: 'webseries' })
            .sort({ views: -1, rating: -1 })
            .limit(10)
            .populate('category');

        // If no series found, return empty array with message
        if (!popularSeries || popularSeries.length === 0) {
            return res.status(200).json({
                status: true,
                message: "No popular series found",
                data: []
            });
        }

        return res.status(200).json({
            status: true,
            message: "Popular series fetched successfully",
            data: popularSeries
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get Popular Movies
export const getPopularMovies = async (req, res) => {
    try {
        const popularMovies = await Movie.find({ type: 'movie' })
            .sort({ rating: -1, views: -1 })
            .limit(20)
            .populate('category');

        return res.status(200).json({
            status: true,
            message: "Popular movies fetched successfully",
            data: popularMovies
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get Movies Grouped By Genre
export const getMoviesGroupedByGenre = async (req, res) => {
    try {
        const movies = await Movie.find()
            .populate('category');

        if (!movies || movies.length === 0) {
            return res.status(200).json({
                status: true,
                message: "No movies found",
                data: {}
            });
        }

        // Group movies by genre
        const groupedMovies = movies.reduce((acc, movie) => {
            // Handle both string and array genres
            let genres = movie.genre;
            if (typeof genres === 'string') {
                genres = [genres];
            } else if (!Array.isArray(genres)) {
                genres = ['Uncategorized'];
            }

            genres.forEach(genre => {
                if (!genre) return; // Skip if genre is null or undefined

                if (!acc[genre]) {
                    acc[genre] = [];
                }
                acc[genre].push({
                    _id: movie._id,
                    title: movie.title,
                    thumbnail: movie.thumbnail,
                    description: movie.description,
                    type: movie.type,
                    views: movie.views || [],
                    rating: movie.rating || 0,
                    category: movie.category
                });
            });
            return acc;
        }, {});

        // Sort movies within each genre by rating and views
        Object.keys(groupedMovies).forEach(genre => {
            groupedMovies[genre].sort((a, b) => {
                const ratingDiff = (b.rating || 0) - (a.rating || 0);
                if (ratingDiff !== 0) return ratingDiff;
                return (b.views || 0) - (a.views || 0);
            });
        });

        return res.status(200).json({
            status: true,
            message: "Movies grouped by genre fetched successfully",
            data: groupedMovies
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get Top Movies This Week
export const getTopMoviesThisWeek = async (req, res) => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const topMovies = await Movie.find({
            createdAt: { $gte: oneWeekAgo }
        })
            .sort({ views: -1, rating: -1 })
            .limit(10)
            .populate('category');

        return res.status(200).json({
            status: true,
            message: "Top movies this week fetched successfully",
            data: topMovies
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get Recommended Content
export const getRecommendedContent = async (req, res) => {
    try {
        // Check if user exists in request
        if (!req.user) {
            return ThrowError(res, 401, "User not authenticated");
        }

        // Get user's watch history and preferences
        const user = await userModel.findById(req.user._id)
            .populate({
                path: 'watchlist',
                populate: {
                    path: 'category'
                }
            });

        if (!user) {
            return ThrowError(res, 404, "User not found");
        }

        // If user has no watchlist, return popular movies
        if (!user.watchlist || user.watchlist.length === 0) {
            const popularMovies = await Movie.find()
                .sort({ rating: -1, views: -1 })
                .limit(10)
                .populate('category');

            return res.status(200).json({
                status: true,
                message: "Recommended content based on popularity",
                data: popularMovies
            });
        }

        // Get genres from user's watchlist
        const userGenres = new Set();
        const userCategories = new Set();

        user.watchlist.forEach(movie => {
            if (movie.genre) {
                if (Array.isArray(movie.genre)) {
                    movie.genre.forEach(genre => userGenres.add(genre));
                } else {
                    userGenres.add(movie.genre);
                }
            }
            if (movie.category && movie.category._id) {
                userCategories.add(movie.category._id.toString());
            }
        });

        // Find movies with similar genres or categories
        const recommendedMovies = await Movie.find({
            $or: [
                { genre: { $in: Array.from(userGenres) } },
                { category: { $in: Array.from(userCategories) } }
            ],
            _id: { $nin: user.watchlist.map(m => m._id) }
        })
            .sort({ rating: -1, views: -1 })
            .limit(10)
            .populate('category');

        // If not enough recommendations, add some popular movies
        if (recommendedMovies.length < 10) {
            const additionalMovies = await Movie.find({
                _id: {
                    $nin: [...user.watchlist.map(m => m._id), ...recommendedMovies.map(m => m._id)]
                }
            })
                .sort({ rating: -1, views: -1 })
                .limit(10 - recommendedMovies.length)
                .populate('category');

            recommendedMovies.push(...additionalMovies);
        }

        return res.status(200).json({
            status: true,
            message: "Recommended content fetched successfully",
            data: recommendedMovies
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get Top 10 Content
export const getTop10Content = async (req, res) => {
    try {
        const top10Content = await Movie.find({})
            .sort({ views: -1, rating: -1 }) // Sort by views first, then rating
            .limit(10)
            .populate('category');
        if (!top10Content || top10Content.length === 0) {
            return ThrowError(res, 404, 'No top 10 content found');
        }
        return res.status(200).json({
            status: true,
            message: "Top 10 content fetched successfully",
            data: top10Content
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Rate a movie
export const rateMovie = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return ThrowError(res, 401, "User not authenticated");
        }

        const { movieId } = req.params;
        const { rating } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            return ThrowError(res, 400, 'Invalid movie ID');
        }

        if (!rating || rating < 1 || rating > 5) {
            return ThrowError(res, 400, 'Rating must be between 1 and 5');
        }

        const movie = await Movie.findById(movieId);
        if (!movie) {
            return ThrowError(res, 404, 'Movie not found');
        }

        // Check if user has already rated
        const existingRatingIndex = movie.ratings.findIndex(r => r.userId.toString() === userId.toString());

        if (existingRatingIndex !== -1) {
            return ThrowError(res, 400, 'You have already rated this movie. Use update rating endpoint to change your rating.');
        }

        // Add new rating
        movie.ratings.push({
            userId,
            rating,
            createdAt: new Date()
        });

        // Calculate new average rating
        const totalRatings = movie.ratings.length;
        const sumRatings = movie.ratings.reduce((sum, r) => sum + r.rating, 0);
        movie.rating = totalRatings > 0 ? sumRatings / totalRatings : 0;

        await movie.save();

        return res.status(200).json({
            status: true,
            message: "Rating added successfully",
            data: {
                rating: movie.rating,
                totalRatings: totalRatings,
                userRating: rating
            }
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Update movie rating
export const updateMovieRating = async (req, res) => {
    try {
        if (!req.user) {
            return ThrowError(res, 401, "User not authenticated");
        }

        const { movieId } = req.params;
        const { rating } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            return ThrowError(res, 400, 'Invalid movie ID');
        }

        if (!rating || rating < 1 || rating > 5) {
            return ThrowError(res, 400, 'Rating must be between 1 and 5');
        }

        const movie = await Movie.findById(movieId);
        if (!movie) {
            return ThrowError(res, 404, 'Movie not found');
        }

        // Find user's existing rating
        const existingRatingIndex = movie.ratings.findIndex(r => r.userId.toString() === userId.toString());

        if (existingRatingIndex === -1) {
            return ThrowError(res, 404, 'You have not rated this movie yet');
        }

        // Update the rating
        movie.ratings[existingRatingIndex].rating = rating;
        movie.ratings[existingRatingIndex].createdAt = new Date();

        // Recalculate average rating
        const totalRatings = movie.ratings.length;
        const sumRatings = movie.ratings.reduce((sum, r) => sum + r.rating, 0);
        movie.rating = totalRatings > 0 ? sumRatings / totalRatings : 0;

        await movie.save();

        return res.status(200).json({
            status: true,
            message: "Rating updated successfully",
            data: {
                rating: movie.rating,
                totalRatings: totalRatings,
                userRating: rating
            }
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Delete movie rating
export const deleteMovieRating = async (req, res) => {
    try {
        if (!req.user) {
            return ThrowError(res, 401, "User not authenticated");
        }

        const { movieId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            return ThrowError(res, 400, 'Invalid movie ID');
        }

        const movie = await Movie.findById(movieId);
        if (!movie) {
            return ThrowError(res, 404, 'Movie not found');
        }

        // Find user's existing rating
        const existingRatingIndex = movie.ratings.findIndex(r => r.userId.toString() === userId.toString());

        if (existingRatingIndex === -1) {
            return ThrowError(res, 404, 'You have not rated this movie yet');
        }

        // Remove the rating
        movie.ratings.splice(existingRatingIndex, 1);

        // Recalculate average rating
        const totalRatings = movie.ratings.length;
        const sumRatings = movie.ratings.reduce((sum, r) => sum + r.rating, 0);
        movie.rating = totalRatings > 0 ? sumRatings / totalRatings : 0;

        await movie.save();

        return res.status(200).json({
            status: true,
            message: "Rating deleted successfully",
            data: {
                rating: movie.rating,
                totalRatings: totalRatings
            }
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get movie rating details
export const getMovieRatingDetails = async (req, res) => {
    try {
        const { movieId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            return ThrowError(res, 400, 'Invalid movie ID');
        }

        const movie = await Movie.findById(movieId)
            .populate('ratings.userId', 'firstName lastName');

        if (!movie) {
            return ThrowError(res, 404, 'Movie not found');
        }

        const ratingDetails = {
            averageRating: movie.rating || 0,
            totalRatings: movie.ratings.length,
            ratingDistribution: {
                5: movie.ratings.filter(r => r.rating === 5).length,
                4: movie.ratings.filter(r => r.rating === 4).length,
                3: movie.ratings.filter(r => r.rating === 3).length,
                2: movie.ratings.filter(r => r.rating === 2).length,
                1: movie.ratings.filter(r => r.rating === 1).length
            },
            recentRatings: movie.ratings
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 5)
        };

        return res.status(200).json({
            status: true,
            message: "Rating details fetched successfully",
            data: ratingDetails
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get Top Rated Movies
export const getTopRatedMovies = async (req, res) => {
    try {
        const topRatedMovies = await Movie.find()
            .sort({ rating: -1 })
            .populate('category');

        if (!topRatedMovies || topRatedMovies.length === 0) {
            return ThrowError(res, 404, 'No movies found');
        }

        return res.status(200).json({
            status: true,
            message: "Top rated content fetched successfully",
            data: topRatedMovies
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get movies user might want to watch again (based on view history)
export const getWatchAgainMovies = async (req, res) => {
    try {
        if (!req.user) {
            return ThrowError(res, 401, "User not authenticated");
        }

        const userId = req.user._id;

        // Find movies that the user has viewed, and sort them by the latest view timestamp
        const watchAgainMovies = await Movie.aggregate([
            { $match: { 'views.userId': userId } },
            { $unwind: '$views' },
            { $match: { 'views.userId': userId } }, // Filter unwound views to only include current user's views
            { $sort: { 'views.timestamp': -1 } }, // Sort by most recent view by the user
            { 
                $group: {
                    _id: '$_id',
                    title: { $first: '$title' },
                    thumbnail: { $first: '$thumbnail' },
                    video: { $first: '$video' },
                    releaseYear: { $first: '$releaseYear' },
                    duration: { $first: '$duration' },
                    category: { $first: '$category' },
                    languages: { $first: '$languages' },
                    description: { $first: '$description' },
                    genre: { $first: '$genre' },
                    contentDescriptor: { $first: '$contentDescriptor' },
                    director: { $first: '$director' },
                    long_description: { $first: '$long_description' },
                    type: { $first: '$type' },
                    rating: { $first: '$rating' },
                    lastViewed: { $first: '$views.timestamp' } // Capture the latest view timestamp for sorting
                }
            },
            { $sort: { 'lastViewed': -1 } }, // Final sort to ensure most recent overall for the user
            { $limit: 20 } // Limit to a reasonable number of recommendations
        ]);

        // Populate category manually since aggregation doesn't support populate directly
        await Movie.populate(watchAgainMovies, { path: 'category' });

        if (!watchAgainMovies || watchAgainMovies.length === 0) {
            return res.status(200).json({
                status: true,
                message: "No watch history found or no movies to watch again",
                data: []
            });
        }

        return res.status(200).json({
            status: true,
            message: "Watch again movies fetched successfully",
            data: watchAgainMovies
        });
    } catch (error) {
        console.error('Error in getWatchAgainMovies:', error);
        return ThrowError(res, 500, error.message);
    }
};

// Increment movie views
export const incrementMovieViews = async (req, res) => {
    try {
        if (!req.user) {
            return ThrowError(res, 401, "User not authenticated");
        }

        const { movieId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            return ThrowError(res, 400, 'Invalid movie ID');
        }

        const movie = await Movie.findById(movieId);
        if (!movie) {
            return ThrowError(res, 404, 'Movie not found');
        }

        // Ensure views is an array and filter out any invalid entries
        if (!Array.isArray(movie.views)) {
            movie.views = [];
        } else {
            movie.views = movie.views.filter(view => typeof view === 'object' && view !== null && view.userId && view.timestamp);
        }

        // Check if user has ever viewed this movie
        const hasViewed = movie.views.some(view => view.userId.toString() === userId.toString());

        if (hasViewed) {
            return res.status(200).json({
                status: true,
                message: "User has already viewed this movie",
                data: {
                    movieId: movie._id,
                    title: movie.title,
                    views: movie.views.length
                }
            });
        }

        // Add new view
        movie.views.push({
            userId: userId,
            timestamp: new Date()
        });

        await movie.save();

        return res.status(200).json({
            status: true,
            message: "View count updated successfully",
            data: {
                movieId: movie._id,
                title: movie.title,
                views: movie.views.length
            }
        });
    } catch (error) {
        console.error('Error in incrementMovieViews:', error);
        return ThrowError(res, 500, error.message);
    }
};

// Get Popular Movies by Category
export const getPopularMoviesByCategory = async (req, res) => {
    try {
        // Get all categories
        const categories = await MovieCategory.find();
        
        if (!categories || categories.length === 0) {
            return res.status(200).json({
                status: true,
                message: "No categories found",
                data: {}
            });
        }

        // Get popular movies for each category
        const popularMoviesByCategory = {};
        
        for (const category of categories) {
            const popularMovies = await Movie.find({ category: category._id })
                .sort({ rating: -1, views: -1 })
                .limit(10)
                .populate('category');

            if (popularMovies && popularMovies.length > 0) {
                popularMoviesByCategory[category.categoryName] = popularMovies.map(movie => ({
                    _id: movie._id,
                    title: movie.title,
                    thumbnail: movie.thumbnail,
                    description: movie.description,
                    type: movie.type,
                    views: movie.views.length,
                    rating: movie.rating,
                    category: movie.category
                }));
            }
        }

        return res.status(200).json({
            status: true,
            message: "Popular movies by category fetched successfully",
            data: popularMoviesByCategory
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get Top 5 Most Recently Added Movies or Webseries
export const getLatestFiveContent = async (req, res) => {
    try {
        const latestContent = await Movie.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('category');

        return res.status(200).json({
            status: true,
            message: "Top 5 most recently added movies or webseries fetched successfully",
            data: latestContent
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};