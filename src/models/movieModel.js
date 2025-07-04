import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    thumbnail: { type: String },
    bg_image: { type: String },
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
    views: {
        type: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            timestamp: { type: Date, default: Date.now }
        }],
        default: []
    },
    rating: { type: Number, default: 0 },
    ratings: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

movieSchema.virtual('formattedDuration').get(function () {
    if (typeof this.duration !== 'number' || this.duration < 0) {
        return null; // Or handle as appropriate
    }
    const totalMinutes = Math.floor(this.duration / 600);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        return `${hours}h ${minutes} min`;
    } else {
        return `${minutes} min`;
    }
});

// Add a pre-save middleware to handle the views field
movieSchema.pre('save', function (next) {
    // If views is a number, convert it to the new format
    if (typeof this.views === 'number') {
        this.views = [];
    }
    next();
});

export default mongoose.model("Movie", movieSchema);