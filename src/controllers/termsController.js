import { ThrowError } from "../utils/ErrorUtils.js";
import TermsConditionServices from "../services/termsConditionServices.js";
import mongoose from "mongoose";

const termsConditionServices = new TermsConditionServices()

//createTermsCondition
export const createTermsCondition = async (req, res) => {
    try {
        const { tittle, description } = req.body

        if (!tittle || !description) {
            return res.status(400).json({ message: "tittle or description must be required!!!" })
        }

        const savedata = await termsConditionServices.addNewTermsCondition({
            tittle,
            description
        })

        return res.status(200).json({ message: "TermsCondition created successfully...", data: savedata })

    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
}

//getTermsConditionById
export const getTermsConditionById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid TermsCondition ID" });
        }

        const data = await termsConditionServices.getTermsConditionById(id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "TermsCondition not found"
            });
        }

        return res.status(200).json({
            message: "TermsCondition fetched successfully",
            data
        });

    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
};

//getAllTermsCondition
export const getAllTermsCondition = async (req, res) => {
    try {
        const data = await termsConditionServices.getAllTermsCondition()

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

//updateTermsCondition
export const updateTermsCondition = async (req, res) => {
    try {
        const { title, description } = req.body;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid TermsCondition ID" });
        }

        const updateData = { title, description };
        const updated = await termsConditionServices.updateTermsCondition(id, updateData);

        if (!updated) {
            return res.status(404).json({ message: "TermsCondition not found" });
        }

        return res.status(200).json({
            message: "TermsCondition updated successfully",
            data: updated
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};



//deleteTermsCondition
export const deleteTermsCondition = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid TermsCondition ID" });
        }

        const deletedTermsCondition = await termsConditionServices.deleteTermsCondition(id);
        if (!deletedTermsCondition) {
            return res.status(404).json({
                success: false,
                message: "TermsCondition not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "TermsCondition deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};