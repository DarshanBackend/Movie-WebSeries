import mongoose from "mongoose";

const faqSchema = mongoose.Schema({
    faqQuestion: {
        type: String,
        require: true,
    },
    faqAnswer: {
        type: String,
        require: true,
    },
}, {
    timestamps: true,
});

export default mongoose.model("Faq", faqSchema)