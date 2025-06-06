import express from 'express';
import {
    createCategory,
    getCategoryById,
    getAllCategories,
    updateCategory,
    deleteCategory
} from '../controllers/movieCategoryController.js';
import upload, { convertJfifToJpeg } from '../middlewares/imageupload.js';

const movieCategoryRoutes = express.Router();

movieCategoryRoutes.post('/createCategory', upload.single('category_image'), convertJfifToJpeg, createCategory);
movieCategoryRoutes.get('/getCategoryById/:id', getCategoryById);
movieCategoryRoutes.get('/getAllCategories', getAllCategories);
movieCategoryRoutes.put('/updateCategory/:id', upload.single('category_image'), convertJfifToJpeg, updateCategory);
movieCategoryRoutes.delete('/deleteCategory/:id', deleteCategory);

export default movieCategoryRoutes; 