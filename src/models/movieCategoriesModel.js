import mongoose from "mongoose";

const movieCategory = mongoose.Schema({
    categoryName: {
        type: String,
        unique: true
    },
    category_image: {
        type: String
    },
    category_description: {
        type: String
    }
}, {
    timestamps: true
})

export default mongoose.model("MovieCategory", movieCategory)