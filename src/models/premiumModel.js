import mongoose from "mongoose";

const PremiumSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ["Basic", "Standard", "Premium"],
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    content: {
        type: String,
        required: true
    },
    devices: {
        type: String
    },
    cancel_anytime: {
        type: String
    },
    ad_free: {
        type: String
    },
    family_sharing: {
        type: String
    },
    duration: {
        type: String,
        enum: ["Weekly", "Monthly", "Yearly"],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model("Premium", PremiumSchema);