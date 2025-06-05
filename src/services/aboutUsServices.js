import aboutUsModel from "../models/aboutUsModel.js";

class AboutUsServices {
    // Add user
    async addNewAboutUs(body) {
        try {
            return await aboutUsModel.create(body);
        } catch (error) {
            return error.message;
        }
    }

    //Get All AboutUs
    async getAllAboutUs() {
        try {
            return await aboutUsModel.find();
        } catch (error) {
            return error.message
        }
    }

    // Get Single AboutUs By Id
    async getAboutusById(id) {
        try {
            return await aboutUsModel.findById(id);
        } catch (error) {
            return error.message;
        }
    }

    // Update AboutUs
    async updateAboutUs(id, body) {
        try {
            return await aboutUsModel.findByIdAndUpdate(id, { $set: body }, { new: true });
        } catch (error) {
            return error.message;
        }
    }

    // Delete AboutUs
    async deleteAboutUs(id) {
        try {
            return await aboutUsModel.findByIdAndDelete(id);
        }
        catch (error) {
            return error.message;
        }
    }

 
}

export default AboutUsServices;