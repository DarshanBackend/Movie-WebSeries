import userModel from "../models/userModel.js";
import nodemailer from "nodemailer"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { ThrowError } from "../utils/ErrorUtils.js"

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
            return res.status(400).json({ status: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // hash password
        const otp = Math.floor(1000 + Math.random() * 9000);
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

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const userData = await userModel.findOne({ email });

        if (!userData) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        // First check if OTP expired
        if (userData.otpExpiry < Date.now()) {
            return res.status(400).json({ status: false, message: 'OTP has expired' });
        }

        // Then check if OTP is correct
        if (userData.otp != otp) {
            return res.status(400).json({ status: false, message: 'Invalid OTP' });
        }

        // Update user verification status
        userData.isVerified = true;
        userData.otp = null;
        userData.otpExpiry = null;
        await userData.save();

        // Generate JWT token for immediate login
        const token = jwt.sign({ _id: userData._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        return res.status(200).json({
            status: true,
            message: 'Registration completed successfully',
            user: userData,
            token
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message });
    }
}

// installation and register api created 04-06-2025