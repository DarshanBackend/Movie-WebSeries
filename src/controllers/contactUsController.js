import { ThrowError } from "../utils/ErrorUtils.js";
import ContactUsServices from "../services/contactUsServices.js";

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
            return res.status(400).json({ success: false, message: "Invalid ID format" });
        }

        const contact = await contactUsServices.getContactUsById(id);

        if (!contact) {
            return res.status(404).json({ success: false, message: "Contact not found" });
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
        return res.status(200).json({ success: true, data: contacts });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Update ContactUs
export const updateContactUs = async (req, res) => {
    try {
        const updated = await contactUsServices.updateContactUs(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ success: false, message: "Contact not found" });
        }
        return res.status(200).json({
            success: true,
            message: "Contact updated successfully",
            data: updated
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Delete ContactUs
export const deleteContactUs = async (req, res) => {
    try {
        const deleted = await contactUsServices.deleteContactUs(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Contact not found" });
        }
        return res.status(200).json({
            success: true,
            message: "Contact deleted successfully"
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};
