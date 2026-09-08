// routes/notification.routes.js
import { Router } from "express";
import {
    sendNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
    getNotificationStats,
    sendBulkNotification,
    getNotificationTypes,
} from "../controllers/notification.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

// Protected routes
router.route("/")
    .get(verifyJWT, getUserNotifications);

router.route("/types")
    .get(verifyJWT, getNotificationTypes);

router.route("/stats")
    .get(verifyJWT, getNotificationStats);

router.route("/mark-all-read")
    .patch(verifyJWT, markAllAsRead);

router.route("/delete-read")
    .delete(verifyJWT, deleteReadNotifications);

router.route("/:notificationId")
    .patch(verifyJWT, markAsRead)
    .delete(verifyJWT, deleteNotification);

// Admin only - send notifications
router.route("/send")
    .post(
        verifyJWT,
        authorizeRoles(USER_ROLES.ADMIN),
        sendNotification
    );

router.route("/bulk")
    .post(
        verifyJWT,
        authorizeRoles(USER_ROLES.ADMIN),
        sendBulkNotification
    );

export default router;