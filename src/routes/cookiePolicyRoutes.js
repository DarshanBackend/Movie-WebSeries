import express from "express";
import { createcookiePolicy, getcookiePolicyById, getAllcookiePolicy, updatecookiePolicy, deletecookiePolicy } from "../controllers/cookiePolicyController.js";

const cookiePolicyRoutes = express.Router()

cookiePolicyRoutes.post("/createcookiePolicy", createcookiePolicy)
cookiePolicyRoutes.get("/getcookiePolicyById/:id", getcookiePolicyById)
cookiePolicyRoutes.get("/getAllcookiePolicy", getAllcookiePolicy)
cookiePolicyRoutes.put("/updatecookiePolicy/:id", updatecookiePolicy)
cookiePolicyRoutes.delete("/deletecookiePolicy/:id", deletecookiePolicy)

export default cookiePolicyRoutes