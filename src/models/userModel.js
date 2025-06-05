import mongoose from "mongoose";
import jwt  from "jsonwebtoken"
import bcrypt from "bcryptjs";

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


userSchema.methods.getJWT = async function () {
    const user = this;

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const passwordhash = user.password;

    const isPasswordValid = await bcrypt.compare(
        passwordInputByUser,
        passwordhash
    );

    return isPasswordValid;
};
export default mongoose.model("User", userSchema)