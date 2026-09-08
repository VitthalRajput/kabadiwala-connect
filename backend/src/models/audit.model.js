// models/audit.model.js
import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
        },
        userRole: {
            type: String,
            enum: ["collector", "recycler", "admin"],
            required: [true, "User role is required"],
        },
        action: {
            type: String,
            required: [true, "Action is required"],
            enum: [
                "login",
                "logout",
                "create_lot",
                "update_lot",
                "accept_lot",
                "reject_lot",
                "complete_lot",
                "cancel_lot",
                "payment",
                "handover",
                "profile_update",
                "price_update",
                "material_classify",
                "match_making",
                "sync_data",
                "view_report",
                "admin_action",
            ],
        },
        resourceType: {
            type: String,
            enum: ["user", "lot", "transaction", "material", "price", "payment"],
            required: [true, "Resource type is required"],
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Resource ID is required"],
        },
        changes: {
            before: {
                type: Map,
                of: mongoose.Schema.Types.Mixed,
            },
            after: {
                type: Map,
                of: mongoose.Schema.Types.Mixed,
            },
        },
        metadata: {
            ipAddress: { type: String },
            userAgent: { type: String },
            deviceInfo: { type: String },
            location: {
                latitude: Number,
                longitude: Number,
            },
            sessionId: { type: String },
        },
        status: {
            type: String,
            enum: ["success", "failure", "pending"],
            default: "success",
        },
        errorMessage: {
            type: String,
            trim: true,
        },
        responseTime: {
            type: Number, // in milliseconds
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
auditSchema.index({ userId: 1, createdAt: -1 });
auditSchema.index({ action: 1, createdAt: -1 });
auditSchema.index({ resourceType: 1, resourceId: 1 });
auditSchema.index({ timestamp: -1 });

export const Audit = mongoose.model("Audit", auditSchema);