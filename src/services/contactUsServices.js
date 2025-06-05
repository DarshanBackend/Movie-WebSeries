import contactUsModel from "../models/contactUsModel.js";

class ContactUsServices {
    // Add contactUs
    async addNewContactUs(body) {
        try {
            return await contactUsModel.create(body);
        } catch (error) {
            return error.message;
        }
    }

    //Get All contactUs
    async getAllContactUs() {
        try {
            return await contactUsModel.find();
        } catch (error) {
            return error.message
        }
    }

    // Get Single contactUs By Id
    async getContactUsById(id) {
        try {
            return await contactUsModel.findById(id);
        } catch (error) {
            return error.message;
        }
    }

    // Update contactUs
    async updateContactUs(id, body) {
        try {
            return await contactUsModel.findByIdAndUpdate(id, { $set: body }, { new: true });
        } catch (error) {
            return error.message;
        }
    }

    // Delete contactUs
    async deleteContactUs(id) {
        try {
            return await contactUsModel.findByIdAndDelete(id);
        }
        catch (error) {
            return error.message;
        }
    }


}

export default ContactUsServices;