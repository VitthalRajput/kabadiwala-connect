// controllers/audit.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Audit } from "../models/audit.model.js";
import { Lot } from "../models/lot.model.js";
import { Transaction } from "../models/transaction.model.js";
import { User } from "../models/user.model.js";

// Log an action (called from other services)
const logAction = asyncHandler(async (req, res) => {
    const {
        userId,
        userRole,
        action,
        resourceType,
        resourceId,
        changes,
        status,
        errorMessage,
        metadata,
    } = req.body;

    if (!userId || !action || !resourceType || !resourceId) {
        throw new ApiError(400, "User ID, action, resource type, and resource ID are required");
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Parse changes if string
    let parsedChanges = {};
    if (changes) {
        if (typeof changes === 'string') {
            try {
                parsedChanges = JSON.parse(changes);
            } catch (error) {
                throw new ApiError(400, "Invalid changes format");
            }
        } else {
            parsedChanges = changes;
        }
    }

    // Parse metadata if string
    let parsedMetadata = {};
    if (metadata) {
        if (typeof metadata === 'string') {
            try {
                parsedMetadata = JSON.parse(metadata);
            } catch (error) {
                throw new ApiError(400, "Invalid metadata format");
            }
        } else {
            parsedMetadata = metadata;
        }
    }

    // Add IP and user agent from request
    parsedMetadata.ipAddress = parsedMetadata.ipAddress || req.ip || req.connection.remoteAddress;
    parsedMetadata.userAgent = parsedMetadata.userAgent || req.headers['user-agent'];

    const audit = await Audit.create({
        userId,
        userRole: userRole || user.role,
        action,
        resourceType,
        resourceId,
        changes: parsedChanges,
        metadata: parsedMetadata,
        status: status || "success",
        errorMessage: errorMessage || "",
        timestamp: new Date(),
    });

    return res.status(201).json(
        new ApiResponse(201, audit, "Action logged successfully")
    );
});

// Get audit trail for a resource
const getResourceAudit = asyncHandler(async (req, res) => {
    const { resourceType, resourceId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const filter = { resourceType, resourceId };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const audits = await Audit.find(filter)
        .populate("userId", "fullName phoneNumber email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Audit.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                audits,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                },
            },
            "Audit trail fetched successfully"
        )
    );
});

// Get user activity log
const getUserActivity = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10, action, resourceType } = req.query;

    // Check authorization
    const isSelf = userId === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    
    if (!isSelf && !isAdmin) {
        throw new ApiError(403, "Not authorized to view this user's activity");
    }

    const filter = { userId };
    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const audits = await Audit.find(filter)
        .populate("userId", "fullName phoneNumber email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Audit.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                audits,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                },
            },
            "User activity fetched successfully"
        )
    );
});

// Get system logs (admin only)
const getSystemLogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, startDate, endDate, action, status } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (status) filter.status = status;
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await Audit.find(filter)
        .populate("userId", "fullName phoneNumber email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Audit.countDocuments(filter);

    // Get summary stats
    const stats = await Audit.aggregate([
        { $match: filter },
        {
            $group: {
                _id: "$action",
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                logs,
                stats,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                },
            },
            "System logs fetched successfully"
        )
    );
});

// Get handover records for a transaction
const getHandoverRecords = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
        .populate("collectorId", "fullName phoneNumber")
        .populate("recyclerId", "fullName phoneNumber");

    if (!transaction) {
        throw new ApiError(404, "Transaction not found");
    }

    // Check authorization
    const isCollector = transaction.collectorId._id.toString() === req.user._id.toString();
    const isRecycler = transaction.recyclerId._id.toString() === req.user._id.toString();

    if (!isCollector && !isRecycler && req.user.role !== "admin") {
        throw new ApiError(403, "Not authorized to view this handover");
    }

    // Get handover related audit logs
    const handoverLogs = await Audit.find({
        resourceType: "transaction",
        resourceId: transactionId,
        action: { $in: ["handover", "handover_updated", "handover_verified"] },
    })
        .populate("userId", "fullName phoneNumber role")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                transaction,
                handoverLogs,
                handoverDetails: transaction.handoverDetails || {},
            },
            "Handover records fetched successfully"
        )
    );
});

// Get traceability report for a lot
const getTraceabilityReport = asyncHandler(async (req, res) => {
    const { lotId } = req.params;

    const lot = await Lot.findById(lotId)
        .populate("collectorId", "fullName phoneNumber address")
        .populate("recyclerId", "fullName phoneNumber address")
        .populate("materialId", "name category subCategory");

    if (!lot) {
        throw new ApiError(404, "Lot not found");
    }

    // Get all related audits
    const audits = await Audit.find({
        resourceId: lotId,
        resourceType: { $in: ["lot", "transaction"] },
    })
        .populate("userId", "fullName phoneNumber role")
        .sort({ createdAt: 1 });

    // Get transaction if exists
    const transaction = await Transaction.findOne({ lotId })
        .populate("collectorId", "fullName phoneNumber")
        .populate("recyclerId", "fullName phoneNumber");

    // Generate traceability report
    const report = {
        lot: {
            id: lot._id,
            material: lot.materialId,
            weight: {
                estimated: lot.estimatedWeight,
                actual: lot.actualWeight,
            },
            price: {
                estimated: lot.estimatedPrice,
                final: lot.finalPrice,
            },
            status: lot.status,
            created: lot.createdAt,
            completed: lot.completedAt,
        },
        collectors: {
            collector: lot.collectorId,
            recycler: lot.recyclerId,
        },
        timeline: audits.map(audit => ({
            time: audit.createdAt,
            action: audit.action,
            user: audit.userId?.fullName || "System",
            role: audit.userId?.role || "system",
            status: audit.status,
            details: audit.changes || {},
        })),
        transaction: transaction || null,
        gpsTrace: audits
            .filter(a => a.metadata?.location)
            .map(a => ({
                time: a.createdAt,
                action: a.action,
                location: a.metadata.location,
            })),
        photos: {
            lotImages: lot.images || [],
            handoverPhotos: transaction?.handoverDetails?.handoverPhotos || [],
        },
    };

    return res.status(200).json(
        new ApiResponse(200, report, "Traceability report generated successfully")
    );
});

// Get action types (for dropdowns)
const getActionTypes = asyncHandler(async (req, res) => {
    const actionTypes = [
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
        "handover_updated",
        "handover_verified",
        "profile_update",
        "price_update",
        "material_classify",
        "match_making",
        "sync_data",
        "view_report",
        "admin_action",
        "lot_picked",
        "lot_delivered",
    ];

    return res.status(200).json(
        new ApiResponse(200, actionTypes, "Action types fetched successfully")
    );
});

// Get resource types
const getResourceTypes = asyncHandler(async (req, res) => {
    const resourceTypes = [
        "user",
        "lot",
        "transaction",
        "material",
        "price",
        "payment",
        "notification",
        "audit",
        "sync",
        "ml_prediction",
    ];

    return res.status(200).json(
        new ApiResponse(200, resourceTypes, "Resource types fetched successfully")
    );
});

export {
    logAction,
    getResourceAudit,
    getUserActivity,
    getSystemLogs,
    getHandoverRecords,
    getTraceabilityReport,
    getActionTypes,
    getResourceTypes,
};