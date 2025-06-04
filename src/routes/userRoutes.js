import express from "express";
import { registerUser, verifyOtp } from "../controllers/userController.js";

const userRoutes = express.Router()


userRoutes.post("/registerUser",registerUser)
userRoutes.post("/verifyOtp",verifyOtp)


export default userRoutes