import userModel from "../models/userModel.js";
import nodemailer from "nodemailer"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import UserServices from "../services/userServices.js";
import { ThrowError } from "../utils/ErrorUtils.js"
import fs from "fs"
import mongoose from 'mongoose';
import premiumModel from "../models/premiumModel.js";

const userServices = new UserServices()

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

//registerUser
export const registerUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            mobileNo,
            email,
            password,
        } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // hash password
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);


        const newUser = new userModel({
            firstName,
            lastName,
            mobileNo,
            email,
            password: hashedPassword,
            otp,
            otpExpiry,
        });

        await newUser.save();

        await sendOtpEmail(email, otp);

        return res.status(200).json({
            message: 'OTP sent to email',
            data: newUser
        });

    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
}

//sendOtpEmail
const sendOtpEmail = async (toEmail, otp) => {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 3000,
            auth: {
                user: process.env.MY_GMAIL,
                pass: process.env.MY_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        await transporter.verify();
        let mailOptions = {
            from: process.env.MY_GMAIL,
            to: toEmail,
            subject: 'Your Otp Code',
            text: `Your OTP code is ${otp}`,
        }

        await transporter.sendMail(mailOptions);

    } catch (error) {
        console.log(error);
        throw new Error('Failed to send OTP email');
    }
}

//verifyOtp
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const userData = await userModel.findOne({ email });

        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }

        // First check if OTP expired
        if (userData.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Then check if OTP is correct
        if (userData.otp != otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Update user verification status
        userData.isVerified = true;
        userData.otp = null;
        userData.otpExpiry = null;
        await userData.save();

        // Generate JWT token for immediate login
        const token = jwt.sign({ _id: userData._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        return res.status(200).json({
            message: 'Registration completed successfully',
            user: userData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

//loginUser
export const loginUser = async (req, res) => {
    try {
        const { emailOrMobile, password } = req.body;

        if (!emailOrMobile || !password) {
            return res.status(400).json({ message: "Email/Mobile and password are required" });
        }

        const isMobile = /^[0-9]{10}$/.test(emailOrMobile);

        // Search user by email or mobile
        const query = isMobile
            ? { mobileNo: Number(emailOrMobile) }
            : { email: emailOrMobile.toLowerCase() };

        const user = await userModel.findOne(query);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Validate password
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate JWT token
        const token = await user.getJWT();
        if (!token) {
            return res.status(500).json({ message: "Failed to generate token" });
        }

        // Set token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            expires: new Date(Date.now() + 8 * 3600000), // 8 hours
        });

        // Send success response
        return res.status(200).json({
            message: "Login successfull",
            user: {
                id: user._id,
                email: user.email,
                mobileNo: user.mobileNo,
            },
        });

    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
};

//forgotPassword
export const forgotUserPassword = async (req, res) => {
    try {
        const { emailOrMobile } = req.body;
        if (!emailOrMobile) {
            return res.status(400).json({ message: "Email or Mobile Number is required" });
        }

        const isMobile = /^[0-9]{10}$/.test(emailOrMobile);
        const query = isMobile
            ? { mobileNo: Number(emailOrMobile) }
            : { email: emailOrMobile.toLowerCase() };

        const user = await userModel.findOne(query);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ status: true, message: "You can now Forgot Your Password" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

//resetPassword
export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        if (!newPassword || !confirmPassword) {
            return res
                .status(400)
                .json({ message: "Please provide email , newpassword and confirmpassword." });
        }

        const user = req.user;
        if (!user) {
            return res.status(400).json({ message: "User Not Found" });
        }

        if (!(newPassword === confirmPassword)) {
            return res
                .status(400)
                .json({ message: "Please check newpassword and confirmpassword." });
        }

        // Hash new password
        await userServices.updateUser({ password: newPassword });
        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return res.status(200).json({
            message: "Password reset successfully.",
            User: { id: user._id, email: user.email },
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

//getUserById
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel
            .findById(id)
            .select("-password")

        if (!user) {
            return ThrowError(res, 404, "user not found");
        }

        return res.status(200).json({
            message: "user fetched successfully",
            data: user
        });
    } catch (error) {
        console.error("Error in getUserById:", error);
        return ThrowError(res, 500, error.message);
    }
};

//getAllUsers
export const getAllUser = async (req, res) => {
    try {
        const user = await userServices.getAllUser()

        if (!user) {
            return res.status(200).json({ message: "No any user found!!" })
        }

        return res.status(200).json({
            message: "user fetched successfully",
            data: user
        });

    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
}

//edit Profile
export const editProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            firstName,
            lastName,
            mobileNo,
            email,
            gender
        } = req.body;

        const newImagePath = req.file?.path;

        const user = req.user;
        if (!user) {
            if (newImagePath && fs.existsSync(newImagePath)) {
                fs.unlinkSync(newImagePath);
            }
            return ThrowError(res, 404, "user not found");
        }

        if (newImagePath && user.image && fs.existsSync(user.image)) {
            fs.unlinkSync(user.image);
        }

        // Update fields
        user.firstName = firstName ?? user.firstName;
        user.lastName = lastName ?? user.lastName;
        user.mobileNo = mobileNo ?? user.mobileNo;
        user.email = email ?? user.email;
        user.gender = gender ?? user.gender;

        if (newImagePath) user.image = newImagePath;

        await user.save();

        return res.status(200).json({
            message: "user updated successfully",
            data: user
        });

    } catch (error) {
        console.error("Error in edituser:", error);
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return ThrowError(res, 500, error.message);
    }
};

export const changeUserPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "oldPassword, newPassword, and confirmPassword are required."
            });
        }

        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: "user not found." });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect." });
        }

        if (newPassword === oldPassword) {
            return res.status(400).json({
                message: "New password cannot be the same as current password."
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "New password and confirm password do not match."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password changed successfully." });

    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

//deleteAccout
export const deleteAccout = async (req, res) => {
    try {
        const { emailOrMobile } = req.body;
        if (!emailOrMobile) {
            return res.status(400).json({ message: "Email or Mobile Number is required" });
        }

        const isMobile = /^[0-9]{10}$/.test(emailOrMobile);
        const query = isMobile
            ? { mobileNo: Number(emailOrMobile) }
            : { email: emailOrMobile.toLowerCase() };

        const user = await userModel.findOne(query);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
        await user.save();

        await sendOtpEmail(user.email, otp)

        return res.status(200).json({ message: "OTP sent to email " });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

//verifyDeleteAccountOtp
export const verifyDeleteAccountOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const userData = await userModel.findOne({ email });
        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP expired
        if (userData.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Check if OTP is correct
        if (userData.otp != otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const deletedUser = await userModel.findByIdAndDelete(userData._id);

        return res.status(200).json({
            message: `Account deleted successfully for ${deletedUser.firstName}`,
            user: deletedUser
        });

    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
};

//logoutUser
export const logoutUser = async (req, res) => {
    try {
        res.cookie("token", null, { expires: new Date(Date.now()) });

        res.send("User logout successfully...✅");
    } catch (error) {
        res.status(400).send("ERROR: " + error.message);
    }
};

export const updateCategory = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            if (req.file?.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return ThrowError(res, 400, 'Invalid category ID');
        }

        const category = await MovieCategory.findById(req.params.id);
        if (!category) {
            if (req.file?.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return ThrowError(res, 404, 'Category not found');
        }

        // If a new image is uploaded, delete the old one
        if (req.file?.path) {
            if (category.category_image && fs.existsSync(category.category_image)) {
                fs.unlinkSync(category.category_image);
            }
            category.category_image = req.file.path;
        }

        // Update other fields
        category.categoryName = req.body.categoryName ?? category.categoryName;
        category.category_description = req.body.category_description ?? category.category_description;

        await category.save();

        return res.status(200).json({
            message: "Category updated successfully",
            data: category
        });

    } catch (error) {
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return ThrowError(res, 500, error.message);
    }
};

