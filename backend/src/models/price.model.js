// models/price.model.js
import mongoose from "mongoose";

const priceSchema = new mongoose.Schema(
    {
        materialId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Material",
            required: [true, "Material reference is required"],
        },
        recyclerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Recycler reference is required"],
        },
        pricePerKg: {
            type: Number,
            required: [true, "Price per kg is required"],
            min: [0, "Price cannot be negative"],
        },
        minQuantity: {
            type: Number,
            default: 1,
        },
        maxQuantity: {
            type: Number,
            default: 1000,
        },
        currency: {
            type: String,
            default: "INR",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        validFrom: {
            type: Date,
            default: Date.now,
        },
        validUntil: {
            type: Date,
        },
        specialNotes: {
            type: String,
            trim: true,
        },
        // Historical price tracking
        historicalPrices: [
            {
                price: Number,
                date: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
priceSchema.index({ materialId: 1, recyclerId: 1 });
priceSchema.index({ pricePerKg: -1 });

export const Price = mongoose.model("Price", priceSchema);