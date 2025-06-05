import privacyPolicyModel from "../models/privacyPolicyModel.js";

class PrivacyPolicyServices {
    // Add PrivacyPolicy
    async addNewPrivacyPolicy(body) {
        try {
            return await privacyPolicyModel.create(body);
        } catch (error) {
            return error.message;
        }
    }

    //Get All PrivacyPolicy
    async getAllPrivacyPolicy() {
        try {
            return await privacyPolicyModel.find();
        } catch (error) {
            return error.message
        }
    }

    // Get Single PrivacyPolicy By Id
    async getPrivacyPolicyById(id) {
        try {
            return await privacyPolicyModel.findById(id);
        } catch (error) {
            return error.message;
        }
    }

    // Update PrivacyPolicy
    async updatePrivacyPolicy(id, body) {
        try {
            return await privacyPolicyModel.findByIdAndUpdate(id, { $set: body }, { new: true });
        } catch (error) {
            return error.message;
        }
    }

    // Delete PrivacyPolicy
    async deletePrivacyPolicy(id) {
        try {
            return await privacyPolicyModel.findByIdAndDelete(id);
        }
        catch (error) {
            return error.message;
        }
    }


}

export default PrivacyPolicyServices;