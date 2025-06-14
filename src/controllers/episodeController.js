import Episode from "../models/episodeModel.js";
import mongoose from "mongoose";
import { ThrowError } from "../utils/ErrorUtils.js";
import Movie from "../models/movieModel.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();

// Configure S3 client
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY.trim(),
        secretAccessKey: process.env.S3_SECRET_KEY.trim()
    },
    region: process.env.S3_REGION || "us-east-1"
});

// Helper function to delete file from S3
const deleteFileFromS3 = async (fileUrl) => {
    try {
        if (!fileUrl) return;

        // Extract the key from the URL
        const key = fileUrl.split('.com/')[1];
        if (!key) return;

        const deleteParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key
        };

        await s3.send(new DeleteObjectCommand(deleteParams));
    } catch (error) {
        console.error('Error deleting file from S3:', error);
        throw error;
    }
};

// Create a new episode
export const createEpisode = async (req, res) => {
    try {
        const { movieId, title, description, duration, seasonNo, episodeNo } = req.body;
        
        // Validate required fields
        if (!movieId || !title || !seasonNo || !episodeNo) {
            return ThrowError(res, 400, "Missing required fields: movieId, title, seasonNo, and episodeNo are required");
        }

        // Validate files
        if (!req.files) {
            return ThrowError(res, 400, "No files were uploaded. Please upload both thumbnail and video files.");
        }

        // Check if thumbnail exists in files
        if (!req.files.thumbnail || !req.files.thumbnail[0]) {
            return ThrowError(res, 400, "Thumbnail file is missing. Please upload a thumbnail image.");
        }

        // Check if video exists in files
        if (!req.files.video || !req.files.video[0]) {
            return ThrowError(res, 400, "Video file is missing. Please upload a video file.");
        }

        // Get file URLs from req.files
        const thumbnail = req.files.thumbnail[0].location;
        const video = req.files.video[0].location;

        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            return ThrowError(res, 400, "Invalid movie/webseries ID");
        }

        // Check if the movie/webseries exists
        const parentContent = await Movie.findById(movieId);
        if (!parentContent) {
            return ThrowError(res, 404, "Parent movie or webseries not found");
        }

        // Check for duplicate title in the same movie
        const existingEpisodeWithTitle = await Episode.findOne({ 
            movieId, 
            title: { $regex: new RegExp(`^${title}$`, 'i') } // Case-insensitive match
        });
        
        if (existingEpisodeWithTitle) {
            return ThrowError(res, 400, "An episode with this title already exists for this movie/webseries");
        }

        // Check for duplicate episode number in the same season
        const existingEpisodeWithNumber = await Episode.findOne({
            movieId,
            seasonNo,
            episodeNo
        });
        
        if (existingEpisodeWithNumber) {
            return ThrowError(res, 400, "An episode with this season and episode number already exists");
        }

        const episode = new Episode({
            movieId,
            thumbnail,
            title,
            description,
            duration: duration ? parseInt(duration) : undefined,
            video,
            seasonNo,
            episodeNo
        });

        const savedEpisode = await episode.save();
        
        // Return a more detailed response
        res.status(201).json({
            status: true,
            message: "Episode created successfully",
            data: {
                episode: savedEpisode,
                fileInfo: {
                    thumbnail: {
                        url: thumbnail,
                        type: req.files.thumbnail[0].mimetype,
                        size: req.files.thumbnail[0].size
                    },
                    video: {
                        url: video,
                        type: req.files.video[0].mimetype,
                        size: req.files.video[0].size
                    }
                }
            }
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get all episodes (optional: filter by movieId)
export const getAllEpisodes = async (req, res) => {
    try {
        const { movieId } = req.query;
        let query = {};
        if (movieId) {
            if (!mongoose.Types.ObjectId.isValid(movieId)) {
                return ThrowError(res, 400, "Invalid movie/webseries ID");
            }
            query.movieId = movieId;
        }
        const episodes = await Episode.find(query).populate('movieId');
        if (!episodes || episodes.length === 0) {
            return ThrowError(res, 404, 'No episodes found');
        }
        res.status(200).json(episodes);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get episode by ID
export const getEpisodeById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return ThrowError(res, 400, "Invalid episode ID");
        }
        const episode = await Episode.findById(req.params.id).populate('movieId');
        if (!episode) {
            return ThrowError(res, 404, "Episode not found");
        }
        res.status(200).json(episode);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Update an episode
export const updateEpisode = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return ThrowError(res, 400, "Invalid episode ID");
        }

        const { movieId, title, description, duration, seasonNo, episodeNo, thumbnail, video } = req.body;

        const episode = await Episode.findById(req.params.id);
        if (!episode) {
            return ThrowError(res, 404, "Episode not found");
        }

        if (movieId && !mongoose.Types.ObjectId.isValid(movieId)) {
            return ThrowError(res, 400, "Invalid movie/webseries ID");
        }

        if (movieId) {
            const parentContent = await Movie.findById(movieId);
            if (!parentContent) {
                return ThrowError(res, 404, "Parent movie or webseries not found");
            }
        }

        episode.movieId = movieId ?? episode.movieId;
        episode.thumbnail = thumbnail ?? episode.thumbnail;
        episode.title = title ?? episode.title;
        episode.description = description ?? episode.description;
        episode.duration = duration !== undefined ? parseInt(duration) : episode.duration;
        episode.video = video ?? episode.video;
        episode.seasonNo = seasonNo ?? episode.seasonNo;
        episode.episodeNo = episodeNo ?? episode.episodeNo;

        const updatedEpisode = await episode.save();
        res.status(200).json(updatedEpisode);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Delete an episode
export const deleteEpisode = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return ThrowError(res, 400, "Invalid episode ID");
        }

        // Find the episode first to get the file URLs
        const episode = await Episode.findById(req.params.id);
        if (!episode) {
            return ThrowError(res, 404, "Episode not found");
        }

        // Delete files from S3
        try {
            // Delete thumbnail
            if (episode.thumbnail) {
                await deleteFileFromS3(episode.thumbnail);
            }

            // Delete video
            if (episode.video) {
                await deleteFileFromS3(episode.video);
            }
        } catch (s3Error) {
            console.error('Error deleting files from S3:', s3Error);
            // Continue with episode deletion even if S3 deletion fails
        }

        // Delete the episode from database
        const deletedEpisode = await Episode.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            status: true,
            message: "Episode and associated files deleted successfully",
            data: {
                episode: deletedEpisode
            }
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};
