import express from "express";
import { createprivacyPolicy , getprivacyPolicyById , getAllprivacyPolicy , updateprivacyPolicy , deleteprivacyPolicy } from "../controllers/privacyPolicyController.js";

const privacyPolicyRoutes = express.Router()

privacyPolicyRoutes.post("/createprivacyPolicy", createprivacyPolicy)
privacyPolicyRoutes.get("/getprivacyPolicyById/:id", getprivacyPolicyById)
privacyPolicyRoutes.get("/getAllprivacyPolicy", getAllprivacyPolicy)
privacyPolicyRoutes.put("/updateprivacyPolicy/:id", updateprivacyPolicy)
privacyPolicyRoutes.delete("/deleteprivacyPolicy/:id", deleteprivacyPolicy)

export default privacyPolicyRoutes