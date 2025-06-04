import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    mobileNo: {
        type: Number
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"]
    },
    image: {
        type: String
    },
    otp: {
        type: String
    },
    otpExpiry: {
        type: Date
    },

}, { timestamps: true })

export default mongoose.model("User", userSchema)