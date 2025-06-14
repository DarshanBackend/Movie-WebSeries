import { ThrowError } from "../utils/ErrorUtils.js";
import PrivacyPolicyServices from "../services/privacyPolicyServices.js";
import mongoose from "mongoose";

const privacyPolicyServices = new PrivacyPolicyServices()

//createprivacyPolicy
export const createprivacyPolicy = async (req, res) => {
    try {
        const { tittle, description } = req.body

        if (!tittle || !description) {
            return res.status(400).json({ message: "tittle or description must be required!!!" })
        }

        const savedata = await privacyPolicyServices.addNewPrivacyPolicy({
            tittle,
            description
        })

        return res.status(200).json({ message: "privacyPolicy created successfully...", data: savedata })

    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
}

//getprivacyPolicyById
export const getprivacyPolicyById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid privacyPolicy ID" });
        }

        const data = await privacyPolicyServices.getPrivacyPolicyById(id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "privacyPolicy not found"
            });
        }

        return res.status(200).json({
            message: "privacyPolicy fetched successfully",
            data
        });

    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
};

//getAllprivacyPolicy
export const getAllprivacyPolicy = async (req, res) => {
    try {
        const data = await privacyPolicyServices.getAllPrivacyPolicy()

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

//updateprivacyPolicy
export const updateprivacyPolicy = async (req, res) => {
    try {
        const { title, description } = req.body;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid privacyPolicy ID" });
        }

        const updateData = { title, description };
        const updated = await privacyPolicyServices.updatePrivacyPolicy(id, updateData);

        if (!updated) {
            return res.status(404).json({ message: "privacyPolicy not found" });
        }

        return res.status(200).json({
            message: "privacyPolicy updated successfully",
            data: updated
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

//deleteprivacyPolicy
export const deleteprivacyPolicy = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid privacyPolicy ID" });
        }

        const deletedprivacyPolicy = await privacyPolicyServices.deletePrivacyPolicy(id);
        if (!deletedprivacyPolicy) {
            return res.status(404).json({
                success: false,
                message: "privacyPolicy not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "privacyPolicy deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};