// controllers/notification.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";

// Create and send notification
const sendNotification = asyncHandler(async (req, res) => {
    const {
        userId,
        type,
        title,
        message,
        data,
        priority,
        deliveryMethod,
        expiresAt,
        actionUrl,
        referenceId,
        referenceType,
    } = req.body;

    if (!userId || !type || !title || !message) {
        throw new ApiError(400, "User ID, type, title, and message are required");
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Parse data if string
    let parsedData = {};
    if (data) {
        if (typeof data === 'string') {
            try {
                parsedData = JSON.parse(data);
            } catch (error) {
                throw new ApiError(400, "Invalid data format");
            }
        } else {
            parsedData = data;
        }
    }

    // Parse delivery methods
    let deliveryMethods = ["in_app"];
    if (deliveryMethod) {
        if (typeof deliveryMethod === 'string') {
            try {
                deliveryMethods = JSON.parse(deliveryMethod);
            } catch (error) {
                deliveryMethods = [deliveryMethod];
            }
        } else {
            deliveryMethods = deliveryMethod;
        }
    }

    // Create notification
    const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        data: parsedData,
        priority: priority || "medium",
        deliveryMethod: deliveryMethods,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        actionUrl: actionUrl || null,
        referenceId: referenceId || null,
        referenceType: referenceType || null,
        deliveryStatus: "pending",
    });

    // Send notifications based on delivery methods
    const deliveryResults = await processDelivery(notification, user);

    // Update delivery status
    notification.deliveryStatus = deliveryResults.success ? "sent" : "pending";
    notification.deliveredAt = deliveryResults.success ? new Date() : null;
    await notification.save();

    const populatedNotification = await Notification.findById(notification._id)
        .populate("userId", "fullName phoneNumber email");

    return res.status(201).json(
        new ApiResponse(201, populatedNotification, "Notification sent successfully")
    );
});

// Process delivery of notification
const processDelivery = async (notification, user) => {
    const results = {
        success: true,
        methods: [],
    };

    const methods = notification.deliveryMethod || ["in_app"];

    for (const method of methods) {
        try {
            switch (method) {
                case "in_app":
                    // Already saved in database
                    results.methods.push({ method: "in_app", status: "success" });
                    break;

                case "push":
                    if (user.deviceToken) {
                        // In production: send push notification via FCM/APNS
                        console.log(`📱 Push notification sent to ${user.fullName}: ${notification.title}`);
                        results.methods.push({ method: "push", status: "success" });
                    } else {
                        results.methods.push({ method: "push", status: "failed", reason: "No device token" });
                    }
                    break;

                case "sms":
                    if (user.phoneNumber) {
                        // In production: send SMS via Twilio/MessageBird
                        console.log(`📱 SMS sent to ${user.phoneNumber}: ${notification.message}`);
                        results.methods.push({ method: "sms", status: "success" });
                    } else {
                        results.methods.push({ method: "sms", status: "failed", reason: "No phone number" });
                    }
                    break;

                case "email":
                    if (user.email) {
                        // In production: send email via SendGrid/NodeMailer
                        console.log(`📧 Email sent to ${user.email}: ${notification.title}`);
                        results.methods.push({ method: "email", status: "success" });
                    } else {
                        results.methods.push({ method: "email", status: "failed", reason: "No email" });
                    }
                    break;

                default:
                    results.methods.push({ method, status: "failed", reason: "Unsupported method" });
            }
        } catch (error) {
            results.methods.push({ method, status: "failed", reason: error.message });
        }
    }

    return results;
};

// Get user's notifications
const getUserNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, isRead, type, priority } = req.query;

    const filter = { userId: req.user._id };
    if (isRead !== undefined) filter.isRead = isRead === "true";
    if (type) filter.type = type;
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
        userId: req.user._id,
        isRead: false,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                notifications,
                unreadCount,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                },
            },
            "Notifications fetched successfully"
        )
    );
});

// Mark notification as read
const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
        _id: notificationId,
        userId: req.user._id,
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return res.status(200).json(
        new ApiResponse(200, notification, "Notification marked as read")
    );
});

// Mark all notifications as read
const markAllAsRead = asyncHandler(async (req, res) => {
    const result = await Notification.updateMany(
        {
            userId: req.user._id,
            isRead: false,
        },
        {
            $set: {
                isRead: true,
                readAt: new Date(),
            },
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                updatedCount: result.modifiedCount,
            },
            "All notifications marked as read"
        )
    );
});

// Delete notification
const deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
        _id: notificationId,
        userId: req.user._id,
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    await Notification.findByIdAndDelete(notificationId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Notification deleted successfully")
    );
});

// Delete all read notifications
const deleteReadNotifications = asyncHandler(async (req, res) => {
    const result = await Notification.deleteMany({
        userId: req.user._id,
        isRead: true,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                deletedCount: result.deletedCount,
            },
            "Read notifications deleted successfully"
        )
    );
});

// Get notification preferences (with counts)
const getNotificationStats = asyncHandler(async (req, res) => {
    const total = await Notification.countDocuments({ userId: req.user._id });
    const unread = await Notification.countDocuments({
        userId: req.user._id,
        isRead: false,
    });

    const byType = await Notification.aggregate([
        { $match: { userId: req.user._id } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                total,
                unread,
                byType,
            },
            "Notification stats fetched successfully"
        )
    );
});

// Send bulk notifications (for system admin)
const sendBulkNotification = asyncHandler(async (req, res) => {
    const {
        userRole,
        type,
        title,
        message,
        priority,
        deliveryMethod,
        expiresAt,
    } = req.body;

    if (!userRole || !type || !title || !message) {
        throw new ApiError(400, "User role, type, title, and message are required");
    }

    // Find all users with the given role
    const users = await User.find({ role: userRole, isActive: true });
    if (users.length === 0) {
        throw new ApiError(404, "No users found with this role");
    }

    // Create notifications for each user
    const notifications = [];
    for (const user of users) {
        const notification = await Notification.create({
            userId: user._id,
            type,
            title,
            message,
            priority: priority || "medium",
            deliveryMethod: deliveryMethod ? JSON.parse(deliveryMethod) : ["in_app"],
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            deliveryStatus: "pending",
        });
        notifications.push(notification);
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                totalUsers: users.length,
                notificationsCreated: notifications.length,
            },
            "Bulk notifications sent successfully"
        )
    );
});

// Get notification types
const getNotificationTypes = asyncHandler(async (req, res) => {
    const types = [
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
    ];

    return res.status(200).json(
        new ApiResponse(200, types, "Notification types fetched successfully")
    );
});

export {
    sendNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
    getNotificationStats,
    sendBulkNotification,
    getNotificationTypes,
};