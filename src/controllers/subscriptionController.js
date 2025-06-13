import User from '../models/userModel.js';
import Premium from '../models/premiumModel.js';
import { ThrowError } from '../utils/ErrorUtils.js';
import mongoose from 'mongoose';

// Subscribe a user to a plan
export const subscribeToPlan = async (req, res) => {
    try {
        const { userId, planId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(planId)) {
            return ThrowError(res, 400, "Invalid userId or planId");
        }

        const plan = await Premium.findById(planId);
        if (!plan) return ThrowError(res, 404, "Plan not found");

        const startDate = new Date();
        let endDate;
        let planStatus = "Active"; // Default active

        
        if (plan.duration === "Monthly") {
            endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
        } else if (plan.duration === "Yearly") {
            endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else if (plan.duration === "Weekly") {
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7);
        } else {
            planStatus = "No Subscription";
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            planId,
            startDate,
            endDate,
            planStatus,
            isSubscribed: true
        }, { new: true }).populate("planId");

        res.status(200).json({
            message: "Plan assigned successfully",
            user: updatedUser
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

export const getUserWithPlanStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).populate("planId");
        if (!user) return ThrowError(res, 404, "User not found");

        let currentStatus = "No Subscription";

        if (user.endDate) {
            const now = new Date();
            currentStatus = now <= user.endDate ? "Active" : "Expired";

            if (user.planStatus !== currentStatus) {
                user.planStatus = currentStatus;
                await user.save(); // update DB with new status
            }
        }

        res.status(200).json({
            user
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};
