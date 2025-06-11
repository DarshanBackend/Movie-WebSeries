import express from "express";
import {
    createEpisode,
    getAllEpisodes,
    getEpisodeById,
    updateEpisode,
    deleteEpisode
} from "../controllers/episodeController.js";
import { upload, handleMulterError } from '../middlewares/imageupload.js';

const episoderouter = express.Router();

episoderouter.post("/createEpisode",
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'video', maxCount: 1 }
    ]),
    handleMulterError,
    (req, res, next) => {
        console.log('Files received:', req.files);
        console.log('Body received:', req.body);
        next();
    },
    createEpisode
);
episoderouter.get("/getAllEpisodes", getAllEpisodes);
episoderouter.get("/getEpisodeById/:id", getEpisodeById);
episoderouter.put("/updateEpisode/:id",
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'video', maxCount: 1 }
    ]),
    handleMulterError,
    updateEpisode
);
episoderouter.delete("/deleteEpisode/:id", deleteEpisode);

export default episoderouter; 