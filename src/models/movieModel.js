import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    thumbnail: { type: String },
    releaseYear: { type: Number },
    duration: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "MovieCategory", required: true },
    languages: [{ type: String }],
    description: { type: String },
    genre: { type: String },
    contentDescriptor: { type: String },
    director: { type: String },
    long_description: { type: String },
    type: { type: String, enum: ['movie', 'webseries'], required: true }
}, { timestamps: true });

export default mongoose.model("Movie", movieSchema);