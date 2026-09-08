// controllers/transaction.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Transaction } from "../models/transaction.model.js";
import { Lot } from "../models/lot.model.js";
import { Ledger } from "../models/ledger.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { PAYMENT_STATUS, LOT_STATUS } from "../constants.js";

// Create transaction (when lot is completed)
const createTransaction = asyncHandler(async (req, res) => {
    const {
        lotId,
        paymentMethod,
        amount,
        paymentDetails,
        weightDetails,
        notes,
    } = req.body;

    if (!lotId || !paymentMethod || !amount) {
        throw new ApiError(400, "Lot ID, payment method, and amount are required");
    }

    // Check if lot exists and is completed
    const lot = await Lot.findById(lotId);
    if (!lot) {
        throw new ApiError(404, "Lot not found");
    }

    if (lot.status !== LOT_STATUS.COMPLETED) {
        throw new ApiError(400, "Lot must be completed before creating transaction");
    }

    // Check if transaction already exists
    const existingTransaction = await Transaction.findOne({ lotId });
    if (existingTransaction) {
        throw new ApiError(409, "Transaction already exists for this lot");
    }

    // Parse weight details
    let parsedWeightDetails = {};
    if (weightDetails) {
        if (typeof weightDetails === 'string') {
            try {
                parsedWeightDetails = JSON.parse(weightDetails);
            } catch (error) {
                throw new ApiError(400, "Invalid weight details format");
            }
        } else {
            parsedWeightDetails = weightDetails;
        }
    }

    // Create transaction
    const transaction = await Transaction.create({
        lotId,
        collectorId: lot.collectorId,
        recyclerId: lot.recyclerId,
        amount: parseFloat(amount),
        paymentMethod,
        paymentStatus: PAYMENT_STATUS.PENDING,
        paymentDetails: paymentDetails ? JSON.parse(paymentDetails) : {},
        weightDetails: {
            estimatedWeight: lot.estimatedWeight,
            actualWeight: parsedWeightDetails.actualWeight || lot.actualWeight || lot.estimatedWeight,
            weightDifference: (parsedWeightDetails.actualWeight || lot.actualWeight || lot.estimatedWeight) - lot.estimatedWeight,
            weightUnit: "kg",
        },
        commission: {
            platformFee: parseFloat(amount) * 0.05, // 5% platform fee
            commissionRate: 5,
            netAmount: parseFloat(amount) * 0.95,
        },
        status: "initiated",
        notes: notes || "",
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
        .populate("collectorId", "fullName phoneNumber address")
        .populate("recyclerId", "fullName phoneNumber address")
        .populate("lotId", "materialId images estimatedWeight status");

    return res.status(201).json(
        new ApiResponse(201, populatedTransaction, "Transaction created successfully")
    );
});

// Update transaction with handover details
const updateHandoverDetails = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    const { handoverPhotos, handoverGPS, receivedBy, verifiedBy } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
        throw new ApiError(404, "Transaction not found");
    }

    // Check authorization (collector or recycler can update)
    const isCollector = transaction.collectorId.toString() === req.user._id.toString();
    const isRecycler = transaction.recyclerId.toString() === req.user._id.toString();

    if (!isCollector && !isRecycler) {
        throw new ApiError(403, "Not authorized to update this transaction");
    }

    const updateData = {};
    if (handoverPhotos) {
        let photos = [];
        if (typeof handoverPhotos === 'string') {
            try {
                photos = JSON.parse(handoverPhotos);
            } catch (error) {
                throw new ApiError(400, "Invalid handover photos format");
            }
        } else {
            photos = handoverPhotos;
        }
        updateData["handoverDetails.handoverPhotos"] = photos;
    }

    if (handoverGPS) {
        let gps = {};
        if (typeof handoverGPS === 'string') {
            try {
                gps = JSON.parse(handoverGPS);
            } catch (error) {
                throw new ApiError(400, "Invalid GPS format");
            }
        } else {
            gps = handoverGPS;
        }
        updateData["handoverDetails.handoverGPS"] = gps;
    }

    if (receivedBy) updateData["handoverDetails.receivedBy"] = receivedBy;
    if (verifiedBy) updateData["handoverDetails.verifiedBy"] = verifiedBy;
    updateData["handoverDetails.handoverTime"] = new Date();

    const updatedTransaction = await Transaction.findByIdAndUpdate(
        transactionId,
        { $set: updateData },
        { new: true, runValidators: true }
    )
        .populate("collectorId", "fullName phoneNumber address")
        .populate("recyclerId", "fullName phoneNumber address")
        .populate("lotId", "materialId images estimatedWeight status");

    return res.status(200).json(
        new ApiResponse(200, updatedTransaction, "Handover details updated successfully")
    );
});

// Update payment status
const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    const { paymentStatus, transactionId: paymentTransactionId, receiptUrl } = req.body;

    if (!paymentStatus) {
        throw new ApiError(400, "Payment status is required");
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
        throw new ApiError(404, "Transaction not found");
    }

    // Only recycler can update payment status
    if (transaction.recyclerId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the recycler can update payment status");
    }

    const updateData = {
        paymentStatus,
    };

    if (paymentTransactionId) {
        updateData["paymentDetails.transactionId"] = paymentTransactionId;
    }

    if (receiptUrl) {
        updateData["paymentDetails.receiptUrl"] = receiptUrl;
    }

    if (paymentStatus === PAYMENT_STATUS.COMPLETED) {
        updateData.completedAt = new Date();
        updateData.status = "completed";

        // Update lot status to completed
        await Lot.findByIdAndUpdate(
            transaction.lotId,
            { $set: { status: LOT_STATUS.COMPLETED, completedAt: new Date() } }
        );

        // Create ledger entries
        await createLedgerEntries(transaction);
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
        transactionId,
        { $set: updateData },
        { new: true, runValidators: true }
    )
        .populate("collectorId", "fullName phoneNumber address")
        .populate("recyclerId", "fullName phoneNumber address")
        .populate("lotId", "materialId images estimatedWeight status");

    return res.status(200).json(
        new ApiResponse(200, updatedTransaction, "Payment status updated successfully")
    );
});

// Helper function to create ledger entries
const createLedgerEntries = async (transaction) => {
    // Collector credit
    await Ledger.create({
        userId: transaction.collectorId,
        userType: "collector",
        transactionId: transaction._id,
        type: "credit",
        amount: transaction.commission.netAmount,
        balance: 0, // Will be calculated
        description: `Payment for lot ${transaction.lotId}`,
        category: "lot_sale",
        status: "completed",
        settledAt: new Date(),
    });

    // Recycler debit
    await Ledger.create({
        userId: transaction.recyclerId,
        userType: "recycler",
        transactionId: transaction._id,
        type: "debit",
        amount: transaction.amount,
        balance: 0, // Will be calculated
        description: `Purchase for lot ${transaction.lotId}`,
        category: "lot_purchase",
        status: "completed",
        settledAt: new Date(),
    });
};

// Get transaction by ID
const getTransactionById = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
        .populate("collectorId", "fullName phoneNumber address")
        .populate("recyclerId", "fullName phoneNumber address")
        .populate("lotId", "materialId images estimatedWeight actualWeight status location");

    if (!transaction) {
        throw new ApiError(404, "Transaction not found");
    }

    // Check authorization
    const isCollector = transaction.collectorId._id.toString() === req.user._id.toString();
    const isRecycler = transaction.recyclerId._id.toString() === req.user._id.toString();

    if (!isCollector && !isRecycler && req.user.role !== "admin") {
        throw new ApiError(403, "Not authorized to view this transaction");
    }

    return res.status(200).json(
        new ApiResponse(200, transaction, "Transaction fetched successfully")
    );
});

// Get collector's transactions
const getCollectorTransactions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { collectorId: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(filter)
        .populate("recyclerId", "fullName phoneNumber address")
        .populate("lotId", "materialId images estimatedWeight status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                transactions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                },
            },
            "Transactions fetched successfully"
        )
    );
});

// Get recycler's transactions
const getRecyclerTransactions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { recyclerId: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(filter)
        .populate("collectorId", "fullName phoneNumber address")
        .populate("lotId", "materialId images estimatedWeight status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                transactions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                },
            },
            "Transactions fetched successfully"
        )
    );
});

export {
    createTransaction,
    updateHandoverDetails,
    updatePaymentStatus,
    getTransactionById,
    getCollectorTransactions,
    getRecyclerTransactions,
};