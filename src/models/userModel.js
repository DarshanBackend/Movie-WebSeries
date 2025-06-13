import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    mobileNo: { type: Number },
    email: { type: String },
    password: { type: String },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"]
    },
    image: { type: String },
    otp: { type: String },
    otpExpiry: { type: Date },

    // ⬇️ Premium subscription plan tracking
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Premium"
    },
    isSubscribed: {
        type: Boolean,
        default: false
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },

    // ⬇️ Movie watchlist
    watchlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie"
    }],
    devices: [
  {
    type: String,     // e.g., "mobile", "desktop", "tablet"
    os: String,       // e.g., "Windows", "Android"
    browser: String,  // e.g., "Chrome"
    loggedInAt: Date
  }
],
    planStatus: {
        type: String,
        enum: ["Active", "Expired", "No Subscription"],
        default: "No Subscription"
    }
}, { timestamps: true });

//  JWT token create method
userSchema.methods.getJWT = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h"
    });
    return token;
};

//  Password validation method
userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    return await bcrypt.compare(passwordInputByUser, user.password);
};

export default mongoose.model("User", userSchema);
