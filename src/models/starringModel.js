import mongoose from "mongoose";

const starringSchema = new mongoose.Schema({
    name: { type: String, required: true },
    starring_image: { type: String },
    moviesId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }]
}, { timestamps: true });

export default mongoose.model("Starring", starringSchema);