import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            throw new Error("Token is not valid!!!");
        }

        const decodedObj = await jwt.verify(token, "Darshan@123");

        const { _id } = decodedObj;

        const user = await userModel.findById(_id);

        if (!user) {
            throw new Error("User not Found!!!");
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(400).send("ERROR: " + error.message);
    }
};
