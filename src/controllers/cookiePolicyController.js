import { ThrowError } from "../utils/ErrorUtils.js";
import CookiePolicyServices from "../services/cookiePolicyServices.js";
import mongoose from "mongoose";

const cookiePolicyServices = new CookiePolicyServices()

//createcookiePolicy
export const createcookiePolicy = async (req, res) => {
    try {
        const { tittle, description } = req.body

        if (!tittle || !description) {
            return res.status(400).json({ message: "tittle or description must be required!!!" })
        }

        const savedata = await cookiePolicyServices.addNewCookiePolicy({
            tittle,
            description
        })

        return res.status(200).json({ message: "cookiePolicy created successfully...", data: savedata })

    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
}

//getcookiePolicyById
export const getcookiePolicyById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid privacyPolicy ID" });
        }

        const data = await cookiePolicyServices.getCookiePolicyById(id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "cookiePolicy not found"
            });
        }

        return res.status(200).json({
            message: "cookiePolicy fetched successfully",
            data
        });

    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
};

//getAllcookiePolicy
export const getAllcookiePolicy = async (req, res) => {
    try {
        const data = await cookiePolicyServices.getAllCookiePolicy()

        if (!data) {
            return res.status(200).json({ message: "No any data found!!" })
        }

        return res.status(200).json({
            message: "data fetched successfully",
            data: data
        });

    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
}

//updatecookiePolicy
export const updatecookiePolicy = async (req, res) => {
    try {
        const { title, description } = req.body;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid cookiePolicy ID" });
        }

        const updateData = { title, description };
        const updated = await cookiePolicyServices.updateCookiePolicy(id, updateData);

        if (!updated) {
            return res.status(404).json({ message: "cookiePolicy not found" });
        }

        return res.status(200).json({
            message: "cookiePolicy updated successfully",
            data: updated
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};



//deletecookiePolicy
export const deletecookiePolicy = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid cookiePolicy ID" });
        }

        const deletedprivacyPolicy = await cookiePolicyServices.deleteCookiePolicy(id);
        if (!deletedprivacyPolicy) {
            return res.status(404).json({
                success: false,
                message: "cookiePolicy not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "cookiePolicy deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};