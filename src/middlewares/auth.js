import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const UAParser = require('ua-parser-js');

export const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            throw new Error("Token is not valid!!!");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);

        if (!user) throw new Error("User not found");

        //  Get device info from user-agent
        const parser = new UAParser(req.headers['user-agent']);
        const result = parser.getResult();

        const deviceType = result.device.type || "desktop";
        const os = result.os.name || "Unknown OS";
        const browser = result.browser.name || "Unknown Browser";

        const newDevice = {
            type: deviceType,
            os,
            browser,
            loggedInAt: new Date()
        };

        console.log(" Detected Device:", newDevice);
        console.log(" Existing Devices:", user.devices);
       

        //  Check if already logged in with this device
        const alreadyExists = user.devices?.some(d =>
            d.type === deviceType && d.os === os && d.browser === browser
        );

        if (!alreadyExists) {
            user.devices = user.devices || [];
            user.devices.push(newDevice);
            await user.save();
            console.log("New device saved for user:", user.email);
        } else {
            console.log(" Device already exists for user:", user.email);
        }

        req.user = user;
        next();
    } catch (err) {
        console.error(" Auth Error:", err.message);
        res.status(401).json({ message: err.message });
    }
};


