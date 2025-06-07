import Payment from '../models/paymentModel.js';
import { ThrowError } from '../utils/ErrorUtils.js';
import mongoose from 'mongoose';
import premiumModel from '../models/premiumModel.js';
import userModel from '../models/userModel.js';

// Create new payment record
export const createPayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { paymentMethodType, cardNumber, cardHolderName, expiryDate, cvv, upiId, planId } = req.body;

        // Basic validation for required fields for Payment
        if (!paymentMethodType || !planId) {
            return ThrowError(res, 400, "Payment method type and planId are required fields.");
        }

        // Conditional validation for Credit Card type
        if (paymentMethodType === 'Credit Card') {
            if (!cardNumber || !cardHolderName || !expiryDate || !cvv) {
                return ThrowError(res, 400, "Card number, card holder name, expiry date, and CVV are required for Credit Card payments.");
            }
            if (upiId) {
                return ThrowError(res, 400, "UPI ID should not be provided for Credit Card payments.");
            }
        } else if (paymentMethodType === 'UPI') {
            if (!upiId) {
                return ThrowError(res, 400, "UPI ID is required for UPI payments.");
            }
            if (cardNumber || cardHolderName || expiryDate || cvv) {
                return ThrowError(res, 400, "Card details should not be provided for UPI payments.");
            }
        }

        if (!mongoose.Types.ObjectId.isValid(planId)) {
            return ThrowError(res, 400, 'Invalid Plan ID format.');
        }

        const premiumPlan = await premiumModel.findById(planId);
        if (!premiumPlan) {
            return ThrowError(res, 404, 'Premium plan not found.');
        }

        // Derive plan details from premiumPlan
        const planName = premiumPlan.type;
        const price = parseFloat(premiumPlan.price); // Ensure price is a number

        if (isNaN(price)) {
            return ThrowError(res, 400, "Premium plan price is invalid. Please ensure it's a number.");
        }

        const discount = 0;
        const platformFee = 1;
        const total = price - discount + platformFee;

        const user = await userModel.findById(userId);
        if (!user) {
            return ThrowError(res, 404, 'User not found.');
        }

        let endDate = new Date();
        switch (premiumPlan.duration) {
            case "Weekly":
                endDate.setDate(endDate.getDate() + 7);
                break;
            case "Monthly":
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case "Yearly":
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;
            default:
                return ThrowError(res, 400, 'Invalid premium plan duration.');
        }

        user.planId = planId;
        user.endDate = endDate;
        await user.save();

        const newPayment = new Payment({
            paymentMethodType,
            cardNumber,
            cardHolderName,
            expiryDate,
            cvv,
            upiId,
            planName,
            price,
            discount,
            platformFee,
            total,
            premiumPlan: planId
        });

        const savedPayment = await newPayment.save();

        return res.status(201).json({
            message: "Payment and subscription created successfully",
            payment: savedPayment,
            userSubscription: { planId: user.planId, endDate: user.endDate }
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get all payment records
export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find();

        if (!payments || payments.length === 0) {
            return res.status(200).json({ message: "No payment records found." });
        }

        res.status(200).json(payments);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Get single payment record by ID
export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return ThrowError(res, 400, 'Invalid Payment ID.');
        }

        const payment = await Payment.findById(id);

        if (!payment) {
            return ThrowError(res, 404, 'Payment record not found.');
        }

        res.status(200).json(payment);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Update payment record
export const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return ThrowError(res, 400, 'Invalid Payment ID format.');
        }

        const payment = await Payment.findById(id);
        if (!payment) {
            return ThrowError(res, 404, 'Payment record not found.');
        }

        // Determine the premium plan to use for deriving details
        let currentPremiumPlan = null;
        if (req.body.premiumPlan && mongoose.Types.ObjectId.isValid(req.body.premiumPlan)) {
            currentPremiumPlan = await premiumModel.findById(req.body.premiumPlan);
            if (!currentPremiumPlan) {
                return ThrowError(res, 404, 'New premium plan not found.');
            }
        } else if (payment.premiumPlan) {
            currentPremiumPlan = await premiumModel.findById(payment.premiumPlan);
        }

        let derivedPlanName = payment.planName;
        let derivedPrice = payment.price;
        let derivedDiscount = payment.discount;
        let derivedPlatformFee = payment.platformFee;
        let derivedTotal = payment.total;

        if (currentPremiumPlan) {
            derivedPlanName = currentPremiumPlan.type;
            derivedPrice = currentPremiumPlan.price;
            derivedDiscount = 0;
            derivedPlatformFee = 1;
            derivedTotal = derivedPrice - derivedDiscount + derivedPlatformFee;
        }

        // Prepare update object
        const updateFields = {};
        const unsetFields = {}; // New object for fields to unset
        let newPaymentMethodType = req.body.paymentMethodType ?? payment.paymentMethodType; // Determine the payment method type for validation

        // If paymentMethodType is null/undefined after coalescing, it's an error
        if (!newPaymentMethodType) {
            return ThrowError(res, 400, "Payment method type cannot be null or undefined.");
        }

        if (newPaymentMethodType === 'Credit Card') {
            // Initialize with existing card details for partial updates
            updateFields.cardNumber = payment.cardNumber;
            updateFields.cardHolderName = payment.cardHolderName;
            updateFields.expiryDate = payment.expiryDate;
            updateFields.cvv = payment.cvv;
            
            // Mark UPI ID for unsetting
            unsetFields.upiId = ""; // Using empty string to unset the field

            // If changing to Credit Card or already Credit Card
            if (req.body.upiId) {
                return ThrowError(res, 400, "UPI ID should not be provided for Credit Card payments.");
            }

            // Override with provided fields if available (no longer strictly required for partial updates)
            if (req.body.hasOwnProperty('cardNumber')) updateFields.cardNumber = req.body.cardNumber;
            if (req.body.hasOwnProperty('cardHolderName')) updateFields.cardHolderName = req.body.cardHolderName;
            if (req.body.hasOwnProperty('expiryDate')) updateFields.expiryDate = req.body.expiryDate;
            if (req.body.hasOwnProperty('cvv')) updateFields.cvv = req.body.cvv;

        } else if (newPaymentMethodType === 'UPI') {
            // Initialize with existing UPI ID for partial updates
            updateFields.upiId = payment.upiId;

            // Mark card details for unsetting
            unsetFields.cardNumber = "";
            unsetFields.cardHolderName = "";
            unsetFields.expiryDate = "";
            unsetFields.cvv = "";

            // If changing to UPI or already UPI
            if (req.body.cardNumber || req.body.cardHolderName || req.body.expiryDate || req.body.cvv) {
                return ThrowError(res, 400, "Card details should not be provided for UPI payments.");
            }

            // Override with provided field if available (no longer strictly required for partial updates)
            if (req.body.hasOwnProperty('upiId')) updateFields.upiId = req.body.upiId;
        }

        updateFields.paymentMethodType = newPaymentMethodType; // Always update paymentMethodType
        updateFields.premiumPlan = req.body.premiumPlan ?? payment.premiumPlan; // Always update premiumPlan if provided

        // Derived fields are always set based on currentPremiumPlan
        updateFields.planName = derivedPlanName;
        updateFields.price = derivedPrice;
        updateFields.discount = derivedDiscount;
        updateFields.platformFee = derivedPlatformFee;
        updateFields.total = derivedTotal;

        const updateOperation = { $set: updateFields };
        if (Object.keys(unsetFields).length > 0) {
            updateOperation.$unset = unsetFields;
        }

        const updatedPayment = await Payment.findByIdAndUpdate(
            id,
            updateOperation,
            { new: true }
        );

        res.status(200).json(updatedPayment);
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

// Delete payment record
export const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return ThrowError(res, 400, 'Invalid Payment ID format.');
        }

        const payment = await Payment.findById(id);

        if (!payment) {
            return ThrowError(res, 404, 'Payment record not found.');
        }

        await Payment.findByIdAndDelete(id);
        res.status(200).json({ message: "Payment record deleted successfully." });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

