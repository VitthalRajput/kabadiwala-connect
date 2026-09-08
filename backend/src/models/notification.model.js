// models/notification.model.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
        },
        type: {
            type: String,
            enum: [
                "lot_created",
                "lot_accepted",
                "lot_completed",
                "lot_cancelled",
                "payment_received",
                "payment_made",
                "new_match",
                "price_update",
                "alert",
                "reminder",
                "system",
            ],
            required: [true, "Notification type is required"],
        },
        title: {
            type: String,
            required: [true, "Notification title is required"],
            trim: true,
        },
        message: {
            type: String,
            required: [true, "Notification message is required"],
            trim: true,
        },
        data: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {},
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        },
        deliveryStatus: {
            type: String,
            enum: ["pending", "sent", "delivered", "failed"],
            default: "pending",
        },
        deliveryMethod: {
            type: [String],
            enum: ["in_app", "push", "sms", "email"],
            default: ["in_app"],
        },
        deliveredAt: {
            type: Date,
        },
        expiresAt: {
            type: Date,
        },
        actionUrl: {
            type: String,
            trim: true,
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        referenceType: {
            type: String,
            enum: ["lot", "transaction", "payment", "user"],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Notification = mongoose.model("Notification", notificationSchema);