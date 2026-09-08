// models/lot.model.js
import mongoose from "mongoose";
import { LOT_STATUS } from "../constants.js";

const lotSchema = new mongoose.Schema(
    {
        collectorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Collector reference is required"],
        },
        recyclerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        materialId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Material",
            required: [true, "Material reference is required"],
            required: false,
        },
        images: [
            {
                type: String,
                required: true,
            },
        ],
        estimatedWeight: {
            type: Number,
            required: [true, "Estimated weight is required"],
            min: [0.1, "Weight must be at least 0.1 kg"],
        },
        actualWeight: {
            type: Number,
            default: null,
        },
        estimatedPrice: {
            type: Number,
            required: [true, "Estimated price is required"],
            min: [0, "Price cannot be negative"],
        },
        finalPrice: {
            type: Number,
            default: null,
        },
        location: {
            address: { type: String, trim: true },
            coordinates: {
                type: {
                    type: String,
                    enum: ["Point"],
                    default: "Point",
                },
                coordinates: {
                    type: [Number],
                    required: true,
                },
            },
            pickupAddress: { type: String, trim: true },
            deliveryAddress: { type: String, trim: true },
        },
        status: {
            type: String,
            enum: Object.values(LOT_STATUS),
            default: LOT_STATUS.PENDING,
        },
        description: {
            type: String,
            trim: true,
        },
        schedulePickup: {
            date: { type: Date },
            timeSlot: { type: String },
        },
        actualPickupTime: {
            type: Date,
        },
        actualDeliveryTime: {
            type: Date,
        },
        completedAt: {
            type: Date,
        },
        cancelledAt: {
            type: Date,
        },
        cancellationReason: {
            type: String,
            trim: true,
        },
        matchedRecyclers: [
            {
                recyclerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                price: Number,
                distance: Number,
                score: Number,
                matchedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        mlPrediction: {
            predictedCategory: String,
            confidenceScore: Number,
            predictedPrice: Number,
            priceRange: {
                min: Number,
                max: Number,
            },
        },
        offlineId: {
            type: String,
            default: null,
        },
        isSynced: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
lotSchema.index({ collectorId: 1, status: 1 });
lotSchema.index({ recyclerId: 1, status: 1 });
lotSchema.index({ "location.coordinates": "2dsphere" });
lotSchema.index({ createdAt: -1 });

export const Lot = mongoose.model("Lot", lotSchema);