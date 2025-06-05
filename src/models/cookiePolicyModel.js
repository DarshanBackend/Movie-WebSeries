import mongoose from "mongoose";

const cookiePolicySchema = mongoose.Schema({
    tittle: {
        type: String,
        required: true,
    },
    description: [{
        type: String,
        required: true,
    }]
}, { timestamps: true });

export default mongoose.model("CookiePolicy", cookiePolicySchema);
