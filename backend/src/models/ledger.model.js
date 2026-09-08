// models/ledger.model.js
import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
        },
        userType: {
            type: String,
            enum: ["collector", "recycler"],
            required: [true, "User type is required"],
        },
        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction",
            required: [true, "Transaction reference is required"],
        },
        type: {
            type: String,
            enum: ["credit", "debit"],
            required: [true, "Transaction type is required"],
        },
        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [0, "Amount cannot be negative"],
        },
        balance: {
            type: Number,
            required: [true, "Balance is required"],
        },
        description: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            enum: ["lot_sale", "lot_purchase", "commission", "bonus", "penalty"],
            required: [true, "Category is required"],
        },
        metadata: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {},
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "completed",
        },
        dueDate: {
            type: Date,
        },
        settledAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ledgerSchema.index({ userId: 1, createdAt: -1 });
ledgerSchema.index({ userId: 1, status: 1 });

export const Ledger = mongoose.model("Ledger", ledgerSchema);