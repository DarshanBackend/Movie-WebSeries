import cookiePolicyModel from "../models/cookiePolicyModel.js";

class CookiePolicyServices {
    // Add CookiePolicy
    async addNewCookiePolicy(body) {
        try {
            return await cookiePolicyModel.create(body);
        } catch (error) {
            return error.message;
        }
    }

    //Get All CookiePolicy
    async getAllCookiePolicy() {
        try {
            return await cookiePolicyModel.find();
        } catch (error) {
            return error.message
        }
    }

    // Get Single CookiePolicy By Id
    async getCookiePolicyById(id) {
        try {
            return await cookiePolicyModel.findById(id);
        } catch (error) {
            return error.message;
        }
    }

    // Update CookiePolicy
    async updateCookiePolicy(id, body) {
        try {
            return await cookiePolicyModel.findByIdAndUpdate(id, { $set: body }, { new: true });
        } catch (error) {
            return error.message;
        }
    }

    // Delete CookiePolicy
    async deleteCookiePolicy(id) {
        try {
            return await cookiePolicyModel.findByIdAndDelete(id);
        }
        catch (error) {
            return error.message;
        }
    }


}

export default CookiePolicyServices;