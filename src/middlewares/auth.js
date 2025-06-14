import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { createRequire } from 'module';
import { ThrowError } from '../utils/ErrorUtils.js';
const require = createRequire(import.meta.url);
const UAParser = require('ua-parser-js');

export const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return ThrowError(res, 401, "Authentication token is required");
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return ThrowError(res, 401, "Invalid or expired token");
        }

        if (!decoded || !decoded._id) {
            return ThrowError(res, 401, "Invalid token payload");
        }

        const user = await userModel.findById(decoded._id);
        if (!user) {
            return ThrowError(res, 404, "User not found");
        }

        // Get device info from user-agent
        const parser = new UAParser(req.headers['user-agent']);
        const result = parser.getResult();

        const deviceType = result.device.type || "desktop";
        const os = result.os.name || "Unknown OS";
        const browser = result.browser.name || "Unknown Browser";

        const newDevice = {
            deviceType: deviceType,
            os,
            browser,
            loggedInAt: new Date()
        };

        // Check if already logged in with this device
        const alreadyExists = user.devices?.some(d =>
            d.deviceType === deviceType && d.os === os && d.browser === browser
        );

        if (!alreadyExists) {
            user.devices = user.devices || [];
            user.devices.push(newDevice);
            await user.save();
        }

        // Set user in request
        req.user = user;
        next();
    } catch (error) {
        return ThrowError(res, 500, "Authentication error: " + error.message);
    }
};
