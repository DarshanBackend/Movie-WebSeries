import express from "express";
import { changeUserPassword, deleteAccout, editProfile, forgotUserPassword, getAllUser, getUserById, loginUser, logoutUser, registerUser, resetPassword, verifyDeleteAccountOtp, verifyOtp } from "../controllers/userController.js";
import upload, { convertJfifToJpeg } from "../middlewares/imageupload.js";
import { userAuth } from "../middlewares/auth.js";

const userRoutes = express.Router()


userRoutes.post("/registerUser", registerUser)
userRoutes.post("/verifyOtp", verifyOtp)
userRoutes.post("/loginUser", loginUser)
userRoutes.post("/forgotUserPassword", userAuth, forgotUserPassword)
userRoutes.post("/resetPassword", userAuth, resetPassword)
userRoutes.post("/editProfile/:id", userAuth, upload.single("image"), convertJfifToJpeg, editProfile)
userRoutes.get("/getUserById/:id", getUserById)
userRoutes.get("/getAllUser", getAllUser)

userRoutes.post("/changeUserPassword/:id", userAuth, changeUserPassword)
userRoutes.post("/deleteAccount", userAuth, deleteAccout)
userRoutes.post("/verifyDeleteAccountOtp", userAuth, verifyDeleteAccountOtp)

userRoutes.post("/logoutUser", userAuth, logoutUser)

export default userRoutes