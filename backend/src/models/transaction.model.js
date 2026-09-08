// models/transaction.model.js
import mongoose from "mongoose";
import { PAYMENT_STATUS } from "../constants.js";

const transactionSchema = new mongoose.Schema(
    {
        lotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lot",
            required: [true, "Lot reference is required"],
        },
        collectorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Collector reference is required"],
        },
        recyclerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Recycler reference is required"],
        },
        amount: {
            type: Number,
            required: [true, "Transaction amount is required"],
            min: [0, "Amount cannot be negative"],
        },
        paymentMethod: {
            type: String,
            enum: ["cash", "upi", "wallet", "bank_transfer"],
            required: [true, "Payment method is required"],
        },
        paymentStatus: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.PENDING,
        },
        paymentDetails: {
            transactionId: { type: String },
            paymentGateway: { type: String },
            upiId: { type: String },
            bankReference: { type: String },
            receiptUrl: { type: String },
        },
        handoverDetails: {
            handoverPhotos: [String],
            handoverGPS: {
                latitude: Number,
                longitude: Number,
            },
            handoverSignature: { type: String },
            handoverTime: { type: Date },
            receivedBy: { type: String },
            verifiedBy: { type: String },
        },
        weightDetails: {
            estimatedWeight: Number,
            actualWeight: Number,
            weightDifference: Number,
            weightUnit: {
                type: String,
                default: "kg",
            },
        },
        commission: {
            platformFee: {
                type: Number,
                default: 0,
            },
            commissionRate: {
                type: Number,
                default: 0,
            },
            netAmount: Number,
        },
        status: {
            type: String,
            enum: ["initiated", "in_progress", "completed", "failed", "refunded"],
            default: "initiated",
        },
        notes: {
            type: String,
            trim: true,
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
transactionSchema.index({ collectorId: 1, createdAt: -1 });
transactionSchema.index({ recyclerId: 1, createdAt: -1 });
transactionSchema.index({ lotId: 1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);