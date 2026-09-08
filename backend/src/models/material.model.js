// models/material.model.js
import mongoose from "mongoose";
import { MATERIAL_TYPES } from "../constants.js";

const materialSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Material name is required"],
            trim: true,
            unique: true,
        },
        category: {
            type: String,
            enum: Object.values(MATERIAL_TYPES),
            required: [true, "Material category is required"],
        },
        subCategory: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        images: [
            {
                type: String,
            },
        ],
        attributes: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {},
        },
        isRecyclable: {
            type: Boolean,
            default: true,
        },
        isHazardous: {
            type: Boolean,
            default: false,
        },
        disposalInstructions: {
            type: String,
            trim: true,
        },
        processingTime: {
            type: Number, // in hours
            default: 24,
        },
    },
    {
        timestamps: true,
    }
);

export const Material = mongoose.model("Material", materialSchema);