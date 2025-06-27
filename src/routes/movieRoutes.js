import express from 'express';
import {
    createMovie,
    getAllMovies,
    getMovieById,
    updateMovie,
    deleteMovie,
    getTrendingMovies,
    getPopularSeries,
    getPopularMovies,
    getMoviesGroupedByGenre,
    getTopMoviesThisWeek,
    getRecommendedContent,
    getTop10Content,
    rateMovie,
    getMovieRatingDetails,
    getTopRatedMovies,
    updateMovieRating,
    deleteMovieRating,
    incrementMovieViews,
    getWatchAgainMovies,
    getPopularMoviesByCategory,
    getLatestFiveContent
} from '../controllers/movieController.js';
import { userAuth } from '../middlewares/auth.js';
import { upload } from '../middlewares/imageupload.js';

const movieRoutes = express.Router();

// Create movie with file upload
movieRoutes.post('/createMovie', userAuth, upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'bg_image', maxCount: 1 }
]), createMovie);

// Get all movies
movieRoutes.get('/getAllMovies', getAllMovies);

// Get movie by ID
movieRoutes.get('/getMovieById/:id', getMovieById);

// Update movie
movieRoutes.put('/updateMovie/:id', userAuth, upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'bg_image', maxCount: 1 }
]), updateMovie);

// Delete movie
movieRoutes.delete('/deleteMovie/:id', userAuth, deleteMovie);

// New routes for movie listings
movieRoutes.get('/getTrendingMovies', getTrendingMovies);
movieRoutes.get('/getPopularSeries', getPopularSeries);
movieRoutes.get('/getPopularMovies', getPopularMovies);
movieRoutes.get('/getMoviesGroupedByGenre', getMoviesGroupedByGenre);
movieRoutes.get('/getTopMoviesThisWeek', getTopMoviesThisWeek);
movieRoutes.get('/getRecommendedContent', userAuth, getRecommendedContent);
movieRoutes.get('/getTop10Content', getTop10Content);
movieRoutes.post('/rateMovie/:movieId', userAuth, rateMovie);
movieRoutes.put('/updateMovieRating/:movieId', userAuth, updateMovieRating);
movieRoutes.delete('/deleteMovieRating/:movieId', userAuth, deleteMovieRating);
movieRoutes.get('/getMovieRatingDetails/:movieId', getMovieRatingDetails);
movieRoutes.get('/getTopRatedMovie', getTopRatedMovies);
movieRoutes.post('/incrementViews/:movieId', userAuth, incrementMovieViews);
movieRoutes.get('/getWatchAgainMovies', userAuth, getWatchAgainMovies);
movieRoutes.get('/getPopularMoviesByCategory',userAuth, getPopularMoviesByCategory);
movieRoutes.get('/getLatestFiveContent', userAuth, getLatestFiveContent);


export default movieRoutes;