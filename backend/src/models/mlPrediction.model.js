// models/mlPrediction.model.js
import mongoose from "mongoose";

const mlPredictionSchema = new mongoose.Schema(
    {
        lotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lot",
            required: [true, "Lot reference is required"],
        },
        modelType: {
            type: String,
            enum: ["classification", "price_prediction", "matchmaking", "anomaly"],
            required: [true, "Model type is required"],
        },
        inputData: {
            imageUrl: String,
            materialFeatures: mongoose.Schema.Types.Mixed,
            locationData: mongoose.Schema.Types.Mixed,
            historicalData: mongoose.Schema.Types.Mixed,
        },
        predictions: {
            category: {
                predicted: String,
                confidence: Number,
                alternatives: [
                    {
                        category: String,
                        confidence: Number,
                    },
                ],
            },
            price: {
                predicted: Number,
                confidence: Number,
                range: {
                    min: Number,
                    max: Number,
                },
                factors: [String],
            },
            matchmaking: {
                recommendedRecyclers: [
                    {
                        recyclerId: mongoose.Schema.Types.ObjectId,
                        score: Number,
                        reason: String,
                    },
                ],
                bestMatch: {
                    recyclerId: mongoose.Schema.Types.ObjectId,
                    score: Number,
                },
            },
            anomaly: {
                isAnomaly: Boolean,
                confidence: Number,
                reason: String,
                severity: {
                    type: String,
                    enum: ["low", "medium", "high"],
                },
            },
        },
        modelVersion: {
            type: String,
            required: true,
        },
        accuracy: {
            type: Number,
            min: 0,
            max: 1,
        },
        processingTime: {
            type: Number, // in milliseconds
        },
        isUsed: {
            type: Boolean,
            default: false,
        },
        feedback: {
            isAccurate: Boolean,
            userRating: {
                type: Number,
                min: 1,
                max: 5,
            },
            comments: String,
        },
        metadata: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
mlPredictionSchema.index({ lotId: 1, modelType: 1 });
mlPredictionSchema.index({ createdAt: -1 });

export const MLPrediction = mongoose.model("MLPrediction", mlPredictionSchema);