import mongoose from "mongoose";

const PremiumSchema = mongoose.Schema({
    type: {
        type: String,
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
        type: String,
        required: true
    },
    cancel_anytime: {
        type: String,
        required: true
    },
    ad_free: {
        type: String,
        required: true
    },
    family_sharing: {
        type: String,
        required: true
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