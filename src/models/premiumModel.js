import mongoose from "mongoose";

const PremiumSchema = mongoose.Schema({
    type: {
        type: String
    },
    price: {
        type: Number
    },
    content: {
        type: String
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
        require: true
    }
}, {
    timestamps: true
})

export default mongoose.model("Premium", PremiumSchema)