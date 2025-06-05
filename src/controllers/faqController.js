import { ThrowError } from "../utils/ErrorUtils.js";
import FAQServices from "../services/faqServices.js";
import mongoose from "mongoose";

const faqServices = new FAQServices

//createFaq
export const createFaq = async (req, res) => {
    try {
        const { faqQuestion, faqAnswer } = req.body

        if (!faqQuestion || !faqAnswer) {
            return res.status(400).json({ message: "faqQuestion or faqAnswer must be required!!!" })
        }

        const savedata = await faqServices.addNewFaq({
            faqQuestion,
            faqAnswer
        })

        return res.status(200).json({ message: "Faq created successfully...", data: savedata })

    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
}

//getFaqById
export const getFaqById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await faqServices.getFaqById(id)

        if (!data) {
            return ThrowError(res, 404, "Id not found");
        }

        return res.status(200).json({
            message: "user fetched successfully",
            data: data
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

//getAllUsers
export const getAllFaq = async (req, res) => {
    try {
        const data = await faqServices.getAllFaq()

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

//updateFaq
export const updateFaq = async (req, res) => {
    try {
        const { faqQuestion, faqAnswer } = req.body;

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid FAQ ID" });
        }

        const updateData = { faqQuestion, faqAnswer };

        const updateAbout = await faqServices.updateFaq(id, updateData);

        if (!updateAbout) {
            return res.status(404).json({ message: "FAQ not found" });
        }

        return res.status(200).json({
            message: "FAQ updated successfully",
            data: updateAbout
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


//deleteFaq
export const deleteFaq = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid FAQ ID" });
        }

        const deletedFaq = await faqServices.deleteFaq(id);
        if (!deletedFaq) {
            return res.status(404).json({
                success: false,
                message: "FAQ not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "FAQ deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};