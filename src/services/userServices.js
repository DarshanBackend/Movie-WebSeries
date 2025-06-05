import userModel from "../models/userModel.js";

class UserServices {
    // Add user
    async addNewUser(body) {
        try {
            return await userModel.create(body);
        } catch (error) {
            return error.message;
        }
    }

    // Get Single user
    async getUser(body) {
        try {
            return await userModel.findOne(body);
        } catch (error) {
            return error.message;
        }
    }

    //Get All user
    async getAllUser() {
        try {
            return await userModel.find();
        } catch (error) {
            return error.message
        }
    }

    // Get Single user By Id
    async getUserById(id) {
        try {
            return await userModel.findById(id);
        } catch (error) {
            return error.message;
        }
    }

    // Update user
    async updateUser(id, body) {
        try {
            return await userModel.findByIdAndUpdate(id, { $set: body }, { new: true });
        } catch (error) {
            return error.message;
        }
    }

    // Delete user
    async deleteUser(id) {
        try {
            return await userModel.findByIdAndDelete(id);
        }
        catch (error) {
            return error.message;
        }
    }

    // Get user By Email
    async getUserByEmail(Email) {
        try {
            return await userModel.findOne({ Email }).exec();
        } catch (error) {
            return error.message;
        }
    }
}

export default UserServices;