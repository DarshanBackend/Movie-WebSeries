import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    thumbnail: { type: String },
    video: { type: String },
    releaseYear: { type: Number },
    duration: { type: Number },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "MovieCategory", required: true },
    languages: [{ type: String }],
    description: { type: String },
    genre: { type: String },
    contentDescriptor: { type: String },
    director: { type: String },
    long_description: { type: String },
    type: { type: String, enum: ['movie', 'webseries'], required: true },
}, { timestamps: true });

movieSchema.virtual('formattedDuration').get(function() {
    if (typeof this.duration !== 'number' || this.duration < 0) {
        return null; // Or handle as appropriate
    }
    const totalMinutes = Math.floor(this.duration / 60000); // Convert milliseconds to minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        return `${hours}h ${minutes} min`;
    } else {
        return `${minutes} min`;
    }
});

export default mongoose.model("Movie", movieSchema);