import express from "express";
import { createAboutUs, deleteAboutUs, getAboutUsById, getAllAboutUs, updateAboutUs } from "../controllers/aboutUsController.js";

const aboutUSRoutes = express.Router()

aboutUSRoutes.post("/createAboutUs", createAboutUs)
aboutUSRoutes.get("/getAboutUsById/:id", getAboutUsById)
aboutUSRoutes.get("/getAllAboutUs", getAllAboutUs)
aboutUSRoutes.put("/updateAboutUs/:id", updateAboutUs)
aboutUSRoutes.delete("/deleteAboutUs/:id", deleteAboutUs)

export default aboutUSRoutes