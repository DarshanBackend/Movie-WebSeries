import express from 'express';
import upload, { convertJfifToJpeg } from '../middlewares/imageupload.js';
import { createStarring, getAllStarring, getStarringById, updateStarring, deleteStarring, getStarringByMovieId } from '../controllers/starringContoller.js';

const starringRoutes = express.Router();

starringRoutes.post('/createStarring', upload.single('starring_image'), convertJfifToJpeg, createStarring);
starringRoutes.get('/getAllStarring', getAllStarring);
starringRoutes.get('/getStarringById/:id', getStarringById);
starringRoutes.get('/getStarringByMovieId/:movieId', getStarringByMovieId);
starringRoutes.put('/updateStarring/:id', upload.single('starring_image'), convertJfifToJpeg, updateStarring);
starringRoutes.delete('/deleteStarring/:id', deleteStarring);

export default starringRoutes;