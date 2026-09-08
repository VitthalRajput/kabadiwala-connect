// models/sync.model.js
import mongoose from "mongoose";

const syncSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
        },
        deviceId: {
            type: String,
            required: [true, "Device ID is required"],
        },
        syncType: {
            type: String,
            enum: ["full", "incremental", "offline_batch"],
            required: [true, "Sync type is required"],
        },
        status: {
            type: String,
            enum: ["pending", "in_progress", "completed", "failed"],
            default: "pending",
        },
        data: {
            lots: [
                {
                    lotId: mongoose.Schema.Types.ObjectId,
                    operation: {
                        type: String,
                        enum: ["create", "update", "delete"],
                    },
                    data: mongoose.Schema.Types.Mixed,
                    syncedAt: Date,
                },
            ],
            transactions: [
                {
                    transactionId: mongoose.Schema.Types.ObjectId,
                    operation: {
                        type: String,
                        enum: ["create", "update", "delete"],
                    },
                    data: mongoose.Schema.Types.Mixed,
                    syncedAt: Date,
                },
            ],
            metadata: {
                type: Map,
                of: mongoose.Schema.Types.Mixed,
            },
        },
        conflictResolution: {
            conflicts: [
                {
                    resourceType: String,
                    resourceId: String,
                    localData: mongoose.Schema.Types.Mixed,
                    serverData: mongoose.Schema.Types.Mixed,
                    resolution: {
                        type: String,
                        enum: ["local", "server", "manual"],
                    },
                    resolvedAt: Date,
                },
            ],
            resolved: {
                type: Boolean,
                default: false,
            },
        },
        syncStartTime: {
            type: Date,
            default: Date.now,
        },
        syncEndTime: {
            type: Date,
        },
        recordsSynced: {
            type: Number,
            default: 0,
        },
        errorLog: [
            {
                resource: String,
                error: String,
                timestamp: Date,
            },
        ],
        isOffline: {
            type: Boolean,
            default: false,
        },
        offlineId: {
            type: String,
            default: null,
        },
    isSynced: {
        type: Boolean,
        default: true,
    },

        lastSyncTime: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
syncSchema.index({ userId: 1, deviceId: 1 });
syncSchema.index({ userId: 1, status: 1 });
syncSchema.index({ syncStartTime: -1 });

export const Sync = mongoose.model("Sync", syncSchema);