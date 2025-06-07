import Premium from '../models/premiumModel.js';
import { ThrowError } from '../utils/ErrorUtils.js';
import mongoose from 'mongoose';

// Create new premium plan
export const createPremium = async (req, res) => {
    try {
        const { type, price, content, devices, cancel_anytime, ad_free, family_sharing } = req.body;

        // Check if required fields are present
        if (!type || !price) {
            return ThrowError(res, 400, "Type and price are required fields");
        }

        const newPremium = new Premium({
            type,
            price,
            content,
            devices,
            cancel_anytime,
            ad_free,
            family_sharing
        });

        const savedPremium = await newPremium.save();
        res.status(201).json(savedPremium);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get all premium plans
export const getAllPremium = async (req, res) => {
    try {
        const premiums = await Premium.find();

        if (!premiums || premiums.length === 0) {
            return res.status(200).json({ message: "No premium plans found" });
        }

        res.status(200).json(premiums);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get single premium plan by ID
export const getPremiumById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return ThrowError(res, 400, 'Invalid Premium ID format');
        }

        const premium = await Premium.findById(id);

        if (!premium) {
            return ThrowError(res, 404, 'Premium plan not found');
        }

        res.status(200).json(premium);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Update premium plan
export const updatePremium = async (req, res) => {
    try {
        const { id } = req.params;


        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return ThrowError(res, 400, 'Invalid Premium ID format');
        }

        const premium = await Premium.findById(id);

        if (!premium) {
            return ThrowError(res, 404, 'Premium plan not found');
        }

        const updatedPremium = await Premium.findByIdAndUpdate(
            id,
            {
                ...req.body
            },
            { new: true }
        );

        res.status(200).json(updatedPremium);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Delete premium plan
export const deletePremium = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return ThrowError(res, 400, 'Invalid Premium ID format');
        }

        const premium = await Premium.findById(id);

        if (!premium) {
            return ThrowError(res, 404, 'Premium plan not found');
        }

        await Premium.findByIdAndDelete(id);
        res.status(200).json({ message: "Premium plan deleted successfully" });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};
