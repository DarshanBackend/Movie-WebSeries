import { ThrowError } from "../utils/ErrorUtils.js";
import ContactUsServices from "../services/contactUsServices.js";
import mongoose from "mongoose";

const contactUsServices = new ContactUsServices()

// Create ContactUs
export const createContactUs = async (req, res) => {
    try {
        const { firstName, lastName, email, mobileNo, message } = req.body;

        if (!firstName || !lastName || !email || !mobileNo || !message) {
            return ThrowError(res, 400, "All fields (firstName, lastName, email, mobileNo, message) are required");
        }

        const newContact = await contactUsServices.addNewContactUs({
            firstName,
            lastName,
            email,
            mobileNo,
            message
        });

        return res.status(201).json({
            success: true,
            message: "Contact created successfully",
            data: newContact
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get ContactUsby ID
export const getContactUsById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID " });
        }

        const contact = await contactUsServices.getContactUsById(id);

        if (!contact) {
            return res.status(404).json({ success: false, message: "ContactUs not found" });
        }

        return res.status(200).json({ success: true, data: contact });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get All ContactsUs
export const getAllContactUs = async (req, res) => {
    try {
        const contacts = await contactUsServices.getAllContactUs();

        if (!contacts || contacts.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No contact data found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Data fetched successfully",
            data: contacts
        });

    } catch (error) {
        return ThrowError(res, 500, error.message); 
    }
};


//update ContactUs
export const updateContactUs = async (req, res) => {
    try {
        const { firstName, lastName, email, mobileNo, message } = req.body;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: "Invalid Id" });
        }

        const updateData = { firstName, lastName, email, mobileNo, message };
        const updated = await contactUsServices.updateContactUs(id, updateData);

        if (!updated) {
            return res.status(404).json({ message: "ContactUs not found" });
        }

        return res.status(200).json({
            message: "ContactUs updated successfully",
            data: updated
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


//deleteContactUs
export const deleteContactUs = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ContactUs ID" });
        }

        const deleteContactUs = await contactUsServices.deleteContactUs(id);
        if (!deleteContactUs) {
            return res.status(404).json({
                success: false,
                message: "ContactUs not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "ContactUs deleted successfully"
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};