import express from "express";
import { createFaq, getAllFaq, getFaqById, updateFaq, deleteFaq } from "../controllers/faqController.js";

const faqRoutes = express.Router()

faqRoutes.post("/createFaq", createFaq)
faqRoutes.get("/getFaqById/:id", getFaqById)
faqRoutes.get("/getAllFaq", getAllFaq)
faqRoutes.put("/updateFaq/:id", updateFaq)
faqRoutes.delete("/deleteFaq/:id", deleteFaq)

export default faqRoutes