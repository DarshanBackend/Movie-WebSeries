import MovieCategory from '../models/movieCategoriesModel.js';
import { ThrowError } from '../utils/ErrorUtils.js';
import mongoose from 'mongoose';
import fs from "fs"
// Create a new category
export const createCategory = async (req, res) => {
    try {
        const { categoryName, category_description } = req.body;
        const category_image = req.file ? req.file.path : undefined;

        const category = new MovieCategory({
            categoryName,
            category_image,
            category_description
        });

        const savedCategory = await category.save();
        if (!savedCategory) return ThrowError(res, 404, 'Category not created');
        res.status(201).json(savedCategory);
    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
};

// Get a single category by ID
export const getCategoryById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return ThrowError(res, 400, 'Invalid category ID');
        }
        const category = await MovieCategory.findById(req.params.id);
        if (!category) return ThrowError(res, 404, 'Category not found');
        res.json(category);
    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
};

// Get all categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = await MovieCategory.find();
        if (!categories || categories.length === 0) return ThrowError(res, 404, 'No categories found');
        res.json(categories);
    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
};

// Update a category by ID
export const updateCategory = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            if (req.file?.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return ThrowError(res, 400, 'Invalid category ID');
        }

        const category = await MovieCategory.findById(req.params.id);
        if (!category) {
            if (req.file?.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return ThrowError(res, 404, 'Category not found');
        }

        // If a new image is uploaded, delete the old one
        if (req.file?.path) {
            if (category.category_image && fs.existsSync(category.category_image)) {
                fs.unlinkSync(category.category_image);
            }
            category.category_image = req.file.path;
        }

        // Update other fields
        category.categoryName = req.body.categoryName ?? category.categoryName;
        category.category_description = req.body.category_description ?? category.category_description;

        await category.save();

        return res.status(200).json({
            message: "Category updated successfully",
            data: category
        });

    } catch (error) {
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return ThrowError(res, 500, error.message);
    }
};

// Delete a category by ID
export const deleteCategory = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return ThrowError(res, 400, 'Invalid category ID');
        }
        const deletedCategory = await MovieCategory.findByIdAndDelete(req.params.id);
        if (!deletedCategory) return ThrowError(res, 404, 'Category not found');
        res.json({ message: 'Category deleted' });
    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
}; 