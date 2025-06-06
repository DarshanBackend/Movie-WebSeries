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

movieRoutes.post('/createMovie', upload.single('thumbnail'), convertJfifToJpeg, createMovie);
movieRoutes.get('/getAllMovies', getAllMovies);
movieRoutes.get('/getMovieById/:id', getMovieById);
movieRoutes.put('/updateMovie/:id', upload.single('thumbnail'), convertJfifToJpeg, updateMovie);
movieRoutes.delete('/deleteMovie/:id', deleteMovie);

export default movieRoutes;