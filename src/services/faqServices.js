import faqModel from "../models/faqModel.js";

class FAQServices {
    // Add Faq
    async addNewFaq(body) {
        try {
            return await faqModel.create(body);
        } catch (error) {
            return error.message;
        }
    }

    //Get All Faq
    async getAllFaq() {
        try {
            return await faqModel.find();
        } catch (error) {
            return error.message
        }
    }

    // Get Single Faq By Id
    async getFaqById(id) {
        try {
            return await faqModel.findById(id);
        } catch (error) {
            return error.message;
        }
    }

    // Update Faq
    async updateFaq(id, body) {
        try {
            return await faqModel.findByIdAndUpdate(id, { $set: body }, { new: true });
        } catch (error) {
            return error.message;
        }
    }

    // Delete Faq
    async deleteFaq(id) {
        try {
            return await faqModel.findByIdAndDelete(id);
        }
        catch (error) {
            return error.message;
        }
    }

 
}

export default FAQServices;