import express from 'express';
import upload, { convertJfifToJpeg } from '../middlewares/imageupload.js';
import {
    createMovie,
    getAllMovies,
    getMovieById,
    updateMovie,
    deleteMovie
} from '../controllers/movieController.js';

const movieRoutes = express.Router();

// Handle both thumbnail and video uploads
movieRoutes.post('/createMovie', 
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'video', maxCount: 1 }
    ]), 
    convertJfifToJpeg, 
    createMovie
);

movieRoutes.get('/getAllMovies', getAllMovies);
movieRoutes.get('/getMovieById/:id', getMovieById);

movieRoutes.put('/updateMovie/:id', 
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'video', maxCount: 1 }
    ]), 
    convertJfifToJpeg, 
    updateMovie
);

movieRoutes.delete('/deleteMovie/:id', deleteMovie);

export default movieRoutes;