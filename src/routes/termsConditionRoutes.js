import express from "express";
import { createTermsCondition, getAllTermsCondition, getTermsConditionById, updateTermsCondition, deleteTermsCondition } from "../controllers/termsController.js";

const termsConditionRoutes = express.Router()

termsConditionRoutes.post("/createTermsCondition", createTermsCondition)
termsConditionRoutes.get("/getTermsConditionById/:id", getTermsConditionById)
termsConditionRoutes.get("/getAllTermsCondition", getAllTermsCondition)
termsConditionRoutes.put("/updateTermsCondition/:id", updateTermsCondition)
termsConditionRoutes.delete("/deleteTermsCondition/:id", deleteTermsCondition)

export default termsConditionRoutes