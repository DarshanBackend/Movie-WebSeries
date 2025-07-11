import mongoose from "mongoose";

const PaymentSchema = mongoose.Schema({
    paymentMethodType: {
        type: String,
        required: true,
        enum: ['Credit Card', 'UPI']
    },
    cardNumber: {
        type: String,
        required: function () { return this.paymentMethodType === 'Credit Card'; }
    },
    cardHolderName: {
        type: String,
        required: function () { return this.paymentMethodType === 'Credit Card'; }
    },
    expiryDate: {
        type: String,
        required: function () { return this.paymentMethodType === 'Credit Card'; }
    },
    cvv: {
        type: String,
        required: function () { return this.paymentMethodType === 'Credit Card'; }
    },
    upiId: {
        type: String,
        required: function () { return this.paymentMethodType === 'UPI'; }
    },
    planName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    platformFee: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    premiumPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Premium',
    }
}, { timestamps: true });

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment; 