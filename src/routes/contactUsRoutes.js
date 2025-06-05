import express from "express";
import { createContactUs, getAllContactUs, updateContactUs, deleteContactUs, getContactUsById } from "../controllers/contactUsController.js";

const contactUsRoutes = express.Router()

contactUsRoutes.post("/createContactUs", createContactUs)
contactUsRoutes.get("/getContactUsById/:id", getContactUsById)
contactUsRoutes.get("/getAllContactUs", getAllContactUs)
contactUsRoutes.put("/updateContactUs/:id", updateContactUs)
contactUsRoutes.delete("/deleteContactUs/:id", deleteContactUs)

export default contactUsRoutes