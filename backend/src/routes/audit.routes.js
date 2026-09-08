// routes/audit.routes.js
import { Router } from "express";
import {
    logAction,
    getResourceAudit,
    getUserActivity,
    getSystemLogs,
    getHandoverRecords,
    getTraceabilityReport,
    getActionTypes,
    getResourceTypes,
} from "../controllers/audit.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

// Public routes (but require auth)
router.route("/actions")
    .get(verifyJWT, getActionTypes);

router.route("/resources")
    .get(verifyJWT, getResourceTypes);

// Admin only routes
router.route("/system-logs")
    .get(verifyJWT, authorizeRoles(USER_ROLES.ADMIN), getSystemLogs);

// Routes with authorization checks inside
router.route("/")
    .post(verifyJWT, logAction);

router.route("/resource/:resourceType/:resourceId")
    .get(verifyJWT, getResourceAudit);

router.route("/user/:userId")
    .get(verifyJWT, getUserActivity);

router.route("/handover/:transactionId")
    .get(verifyJWT, getHandoverRecords);

router.route("/traceability/:lotId")
    .get(verifyJWT, getTraceabilityReport);

export default router;