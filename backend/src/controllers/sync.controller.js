// controllers/sync.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Sync } from "../models/sync.model.js";
import { Lot } from "../models/lot.model.js";
import { Transaction } from "../models/transaction.model.js";
import { User } from "../models/user.model.js";
import { auditLogger } from "../utils/auditLogger.js";

// Start a sync session
const startSync = asyncHandler(async (req, res) => {
    const { deviceId, syncType = "incremental" } = req.body;

    if (!deviceId) {
        throw new ApiError(400, "Device ID is required");
    }

    // Check if there's an ongoing sync
    const existingSync = await Sync.findOne({
        userId: req.user._id,
        deviceId,
        status: "in_progress",
    });

    if (existingSync) {
        throw new ApiError(409, "A sync is already in progress for this device");
    }

    // Create new sync session
    const sync = await Sync.create({
        userId: req.user._id,
        deviceId,
        syncType,
        status: "pending",
        syncStartTime: new Date(),
        data: {
            lots: [],
            transactions: [],
            metadata: {},
        },
        isOffline: false,
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                syncId: sync._id,
                deviceId,
                syncType,
                status: "pending",
            },
            "Sync session started successfully"
        )
    );
});

// Sync data (upload offline data)
const syncData = asyncHandler(async (req, res) => {
    const { syncId } = req.params;
    const { lots, transactions, metadata, conflictResolution } = req.body;

    const sync = await Sync.findById(syncId);
    if (!sync) {
        throw new ApiError(404, "Sync session not found");
    }

    if (sync.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized for this sync session");
    }

    // Update sync status
    sync.status = "in_progress";
    await sync.save();

    const results = {
        lotsSynced: 0,
        transactionsSynced: 0,
        conflicts: [],
        errors: [],
    };

    // Process lots
    if (lots && lots.length > 0) {
        for (const lotData of lots) {
            try {
                const result = await processLotSync(lotData, req.user._id);
                if (result.conflict) {
                    results.conflicts.push(result.conflict);
                } else {
                    results.lotsSynced++;
                }
            } catch (error) {
                results.errors.push({
                    resource: "lot",
                    error: error.message,
                });
            }
        }
    }

    // Process transactions
    if (transactions && transactions.length > 0) {
        for (const transactionData of transactions) {
            try {
                const result = await processTransactionSync(transactionData, req.user._id);
                if (result.conflict) {
                    results.conflicts.push(result.conflict);
                } else {
                    results.transactionsSynced++;
                }
            } catch (error) {
                results.errors.push({
                    resource: "transaction",
                    error: error.message,
                });
            }
        }
    }

    // Handle conflict resolution
    if (conflictResolution && Object.keys(conflictResolution).length > 0) {
        await resolveConflicts(conflictResolution);
        sync.conflictResolution.resolved = true;
    }

    // Update sync record
    sync.status = "completed";
    sync.syncEndTime = new Date();
    sync.recordsSynced = results.lotsSynced + results.transactionsSynced;
    sync.lastSyncTime = new Date();
    sync.data.metadata = metadata || {};
    sync.conflictResolution.conflicts = results.conflicts;
    await sync.save();

    // Log sync completion
    await auditLogger({
        userId: req.user._id,
        userRole: req.user.role,
        action: "sync_data",
        resourceType: "sync",
        resourceId: sync._id,
        changes: {
            recordsSynced: results,
        },
        metadata: {
            deviceId: sync.deviceId,
            syncType: sync.syncType,
        },
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                syncId: sync._id,
                status: "completed",
                results,
                conflicts: results.conflicts,
            },
            "Data synced successfully"
        )
    );
});

// Process lot sync
const processLotSync = async (lotData, userId) => {
    const { lotId, operation, data } = lotData;

    if (operation === "create") {
        // Check if lot already exists
        const existingLot = await Lot.findOne({
            $or: [{ _id: lotId }, { offlineId: lotId }],
        });

        if (existingLot) {
            return {
                conflict: {
                    resourceType: "lot",
                    resourceId: lotId,
                    localData: data,
                    serverData: existingLot,
                    resolution: null,
                },
            };
        }

        // Create new lot
        const newLot = new Lot({
            ...data,
            collectorId: userId,
            offlineId: lotId,
            isSynced: true,
        });
        await newLot.save();
        return { success: true };
    }

    if (operation === "update") {
        const existingLot = await Lot.findOne({
            $or: [{ _id: lotId }, { offlineId: lotId }],
        });

        if (!existingLot) {
            return {
                conflict: {
                    resourceType: "lot",
                    resourceId: lotId,
                    localData: data,
                    serverData: null,
                    resolution: null,
                },
            };
        }

        // Check for conflicts (if server version is newer)
        if (data.updatedAt && existingLot.updatedAt > new Date(data.updatedAt)) {
            return {
                conflict: {
                    resourceType: "lot",
                    resourceId: existingLot._id,
                    localData: data,
                    serverData: existingLot,
                    resolution: null,
                },
            };
        }

        // Update lot
        Object.assign(existingLot, data);
        existingLot.isSynced = true;
        await existingLot.save();
        return { success: true };
    }

    if (operation === "delete") {
        const existingLot = await Lot.findOne({
            $or: [{ _id: lotId }, { offlineId: lotId }],
        });

        if (existingLot) {
            await Lot.findByIdAndDelete(existingLot._id);
        }
        return { success: true };
    }

    return { success: false };
};

// Process transaction sync
const processTransactionSync = async (transactionData, userId) => {
    const { transactionId, operation, data } = transactionData;

    if (operation === "create") {
        const existingTransaction = await Transaction.findOne({
            $or: [{ _id: transactionId }, { offlineId: transactionId }],
        });

        if (existingTransaction) {
            return {
                conflict: {
                    resourceType: "transaction",
                    resourceId: transactionId,
                    localData: data,
                    serverData: existingTransaction,
                    resolution: null,
                },
            };
        }

        const newTransaction = new Transaction({
            ...data,
            offlineId: transactionId,
            isSynced: true,
        });
        await newTransaction.save();
        return { success: true };
    }

    if (operation === "update") {
        const existingTransaction = await Transaction.findOne({
            $or: [{ _id: transactionId }, { offlineId: transactionId }],
        });

        if (!existingTransaction) {
            return {
                conflict: {
                    resourceType: "transaction",
                    resourceId: transactionId,
                    localData: data,
                    serverData: null,
                    resolution: null,
                },
            };
        }

        if (data.updatedAt && existingTransaction.updatedAt > new Date(data.updatedAt)) {
            return {
                conflict: {
                    resourceType: "transaction",
                    resourceId: existingTransaction._id,
                    localData: data,
                    serverData: existingTransaction,
                    resolution: null,
                },
            };
        }

        Object.assign(existingTransaction, data);
        existingTransaction.isSynced = true;
        await existingTransaction.save();
        return { success: true };
    }

    return { success: false };
};

// Resolve conflicts
const resolveConflicts = async (conflictResolution) => {
    for (const [resourceId, resolution] of Object.entries(conflictResolution)) {
        const { resolution: resolutionType, resolvedData } = resolution;

        if (resolutionType === "local") {
            // Use local data - already processed
            continue;
        }

        if (resolutionType === "server") {
            // Use server data - revert local changes
            await revertLocalChanges(resourceId, resolvedData);
        }

        if (resolutionType === "manual") {
            // Use manually resolved data
            await applyManualResolution(resourceId, resolvedData);
        }
    }
};

// Revert local changes
const revertLocalChanges = async (resourceId, serverData) => {
    // Find and revert the resource
    const lot = await Lot.findOne({ offlineId: resourceId });
    if (lot) {
        Object.assign(lot, serverData);
        lot.isSynced = true;
        await lot.save();
    }

    const transaction = await Transaction.findOne({ offlineId: resourceId });
    if (transaction) {
        Object.assign(transaction, serverData);
        transaction.isSynced = true;
        await transaction.save();
    }
};

// Apply manual resolution
const applyManualResolution = async (resourceId, resolvedData) => {
    const lot = await Lot.findOne({ offlineId: resourceId });
    if (lot) {
        Object.assign(lot, resolvedData);
        lot.isSynced = true;
        await lot.save();
    }

    const transaction = await Transaction.findOne({ offlineId: resourceId });
    if (transaction) {
        Object.assign(transaction, resolvedData);
        transaction.isSynced = true;
        await transaction.save();
    }
};

// Get data for offline sync (download for app)
const getOfflineData = asyncHandler(async (req, res) => {
    const { lastSyncTime, resourceType } = req.query;

    const userId = req.user._id;
    const data = {};

    // Get user data
    const user = await User.findById(userId).select("-password -refreshToken");
    data.user = user;

    // Get lots based on last sync time
    const lotFilter = {
        collectorId: userId,
        isSynced: true,
    };
    if (lastSyncTime) {
        lotFilter.updatedAt = { $gte: new Date(lastSyncTime) };
    }
    data.lots = await Lot.find(lotFilter).populate("materialId", "name category");

    // Get transactions
    const transactionFilter = {
        $or: [{ collectorId: userId }, { recyclerId: userId }],
        isSynced: true,
    };
    if (lastSyncTime) {
        transactionFilter.updatedAt = { $gte: new Date(lastSyncTime) };
    }
    data.transactions = await Transaction.find(transactionFilter)
        .populate("collectorId", "fullName phoneNumber")
        .populate("recyclerId", "fullName phoneNumber")
        .populate("lotId", "materialId images status");

    // Get notifications
    data.notifications = await Notification.find({
        userId,
        createdAt: lastSyncTime ? { $gte: new Date(lastSyncTime) } : {},
    }).sort({ createdAt: -1 });

    // Get prices for materials (for offline reference)
    const materialIds = data.lots.map(lot => lot.materialId._id);
    data.prices = await Price.find({
        materialId: { $in: materialIds },
        isActive: true,
    }).populate("recyclerId", "fullName phoneNumber");

    // Get sync metadata
    data.syncMetadata = {
        lastSyncTime: new Date().toISOString(),
        totalLots: data.lots.length,
        totalTransactions: data.transactions.length,
        totalNotifications: data.notifications.length,
    };

    // Save sync record
    const sync = await Sync.create({
        userId,
        deviceId: req.headers['device-id'] || "unknown",
        syncType: "full",
        status: "completed",
        syncStartTime: new Date(),
        syncEndTime: new Date(),
        recordsSynced: data.lots.length + data.transactions.length,
        lastSyncTime: new Date(),
        data: {
            metadata: {
                lotsCount: data.lots.length,
                transactionsCount: data.transactions.length,
            },
        },
        isOffline: false,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                data,
                syncId: sync._id,
                syncTime: new Date().toISOString(),
            },
            "Offline data fetched successfully"
        )
    );
});

// Get sync status
const getSyncStatus = asyncHandler(async (req, res) => {
    const { deviceId } = req.query;

    if (!deviceId) {
        throw new ApiError(400, "Device ID is required");
    }

    const latestSync = await Sync.findOne({
        userId: req.user._id,
        deviceId,
        status: "completed",
    }).sort({ createdAt: -1 });

    const pendingSync = await Sync.findOne({
        userId: req.user._id,
        deviceId,
        status: { $in: ["pending", "in_progress"] },
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                lastSyncTime: latestSync?.lastSyncTime || null,
                pendingSync: !!pendingSync,
                pendingSyncId: pendingSync?._id || null,
                isSynced: !pendingSync,
                totalSyncs: await Sync.countDocuments({
                    userId: req.user._id,
                    deviceId,
                }),
            },
            "Sync status fetched successfully"
        )
    );
});

// Cancel a sync session
const cancelSync = asyncHandler(async (req, res) => {
    const { syncId } = req.params;

    const sync = await Sync.findById(syncId);
    if (!sync) {
        throw new ApiError(404, "Sync session not found");
    }

    if (sync.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized");
    }

    if (sync.status === "completed") {
        throw new ApiError(400, "Sync session already completed");
    }

    sync.status = "failed";
    sync.syncEndTime = new Date();
    await sync.save();

    return res.status(200).json(
        new ApiResponse(200, { syncId: sync._id }, "Sync session cancelled")
    );
});

// Get sync history
const getSyncHistory = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const filter = { userId: req.user._id };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const syncs = await Sync.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Sync.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                syncs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                },
            },
            "Sync history fetched successfully"
        )
    );
});

export {
    startSync,
    syncData,
    getOfflineData,
    getSyncStatus,
    cancelSync,
    getSyncHistory,
};