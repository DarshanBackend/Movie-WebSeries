import termsConditionModel from "../models/termsConditionModel.js";

class TermsConditionServices {
    // Add termsCondition
    async addNewTermsCondition(body) {
        try {
            return await termsConditionModel.create(body);
        } catch (error) {
            return error.message;
        }
    }

    //Get All termsCondition
    async getAllTermsCondition() {
        try {
            return await termsConditionModel.find();
        } catch (error) {
            return error.message
        }
    }

    // Get Single termsCondition By Id
    async getTermsConditionById(id) {
        try {
            return await termsConditionModel.findById(id);
        } catch (error) {
            return error.message;
        }
    }

    // Update termsCondition
    async updateTermsCondition(id, body) {
        try {
            return await termsConditionModel.findByIdAndUpdate(id, { $set: body }, { new: true });
        } catch (error) {
            return error.message;
        }
    }

    // Delete termsCondition
    async deleteTermsCondition(id) {
        try {
            return await termsConditionModel.findByIdAndDelete(id);
        }
        catch (error) {
            return error.message;
        }
    }


}

export default TermsConditionServices;