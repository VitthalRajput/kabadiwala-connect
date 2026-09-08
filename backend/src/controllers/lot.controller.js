// controllers/lot.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Lot } from "../models/lot.model.js";
import { Material } from "../models/material.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { LOT_STATUS } from "../constants.js";
import { classifyMaterial, predictPrice } from "../services/ml.service.js";

// Create a new lot with ML integration
const createLot = asyncHandler(async (req, res) => {
    const {
        materialId,
        estimatedWeight,
        description,
        location,
        schedulePickup,
        estimatedPrice,
        state,
        city,
        quantity,
        confirmCategory,
        manualCategory,
    } = req.body;

    // Validate required fields
    if (!estimatedWeight || !location) {
        throw new ApiError(400, "Estimated weight and location are required");
    }

    // Check if material exists (if materialId provided)
    let material = null;
    if (materialId) {
        material = await Material.findById(materialId);
        if (!material) {
            throw new ApiError(404, "Material not found");
        }
    }

    // Handle image uploads
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const uploadedImage = await uploadOnCloudinary(file.path || file);
            if (uploadedImage && uploadedImage.url) {
                imageUrls.push(uploadedImage.url);
            }
        }
    }

    if (imageUrls.length === 0) {
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (file.buffer) {
                    const b64 = Buffer.from(file.buffer).toString("base64");
                    imageUrls.push(`data:${file.mimetype || "image/jpeg"};base64,${b64}`);
                } else {
                    imageUrls.push("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80");
                }
            }
        } else {
            throw new ApiError(400, "At least one image is required");
        }
    }

    // Parse location safely
    let parsedLocation = {};
    if (typeof location === 'string') {
        try {
            parsedLocation = JSON.parse(location);
        } catch (error) {
            parsedLocation = { address: location, pickupAddress: location };
        }
    } else if (location && typeof location === 'object') {
        parsedLocation = location;
    }

    // ============================================
    // ML Integration: Classification & Price
    // ============================================
    let mlClassification = null;
    let mlPrice = null;
    let finalCategory = req.body.category || manualCategory || null;
    let finalEstimatedPrice = estimatedPrice ? parseFloat(estimatedPrice) : 0;

    // Step 1: Classify image only if category was not already selected/detected
    if (!finalCategory && req.files && req.files.length > 0) {
        try {
            const classificationResult = await Promise.race([
                classifyMaterial(req.files[0]),
                new Promise((_, reject) => setTimeout(() => reject(new Error("ML classification timeout")), 4000))
            ]);
            if (classificationResult.success && classificationResult.data?.category) {
                mlClassification = classificationResult.data;
                finalCategory = classificationResult.data.category;
            }
        } catch (error) {
            console.error("ML Classification skipped/failed:", error?.message);
        }
    }

    if (!finalCategory) {
        finalCategory = 'Mixed E-Waste';
    }

    // Step 2: Get price prediction if estimatedPrice was not provided by frontend
    if (!finalEstimatedPrice && finalCategory && state && city && quantity) {
        try {
            const priceResult = await Promise.race([
                predictPrice({
                    category: finalCategory,
                    state: state || parsedLocation.state || 'Unknown',
                    city: city || parsedLocation.city || 'Unknown',
                    quantity: Number(quantity || 1),
                    total_weight_kg: Number(estimatedWeight),
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("ML Price timeout")), 4000))
            ]);
            
            if (priceResult && priceResult.success) {
                mlPrice = priceResult.data;
                finalEstimatedPrice = mlPrice.recommended_rate_inr * Number(estimatedWeight);
            }
        } catch (error) {
            console.error("ML Price Prediction failed:", error?.message);
        }
    }

    // ============================================
    // Ensure Material Document Exists for this specific category
    // ============================================
    if (!material) {
        try {
            const matName = `${finalCategory}`.trim();
            const rawCat = matName.toLowerCase();
            let mappedCat = 'electronics';
            if (rawCat.includes('plastic')) mappedCat = 'plastic';
            else if (rawCat.includes('paper')) mappedCat = 'paper';
            else if (rawCat.includes('metal') || rawCat.includes('wire') || rawCat.includes('copper')) mappedCat = 'metal';
            else if (rawCat.includes('glass')) mappedCat = 'glass';
            else if (rawCat.includes('organic')) mappedCat = 'organic';
            else if (rawCat.includes('pcb') || rawCat.includes('battery') || rawCat.includes('motor') || rawCat.includes('crt') || rawCat.includes('lcd') || rawCat.includes('electronic')) mappedCat = 'electronics';

            // Find by exact material name (NOT generic category which collided with PCB)
            material = await Material.findOne({
                name: { $regex: `^${matName}$`, $options: 'i' }
            });

            if (!material) {
                material = await Material.create({
                    name: matName,
                    category: mappedCat,
                    subCategory: req.body.subCategory || 'Standard',
                    description: description || `Scrap Lot - ${matName}`,
                    isRecyclable: true,
                });
            }
        } catch (matErr) {
            console.warn("Could not auto-create material:", matErr);
        }
    }

    // ============================================
    // Create Lot with ML Data
    // ============================================
    const lot = await Lot.create({
        collectorId: req.user._id,
        materialId: material?._id || materialId || null,
        images: imageUrls,
        estimatedWeight: parseFloat(estimatedWeight),
        estimatedPrice: parseFloat(finalEstimatedPrice || estimatedPrice || 0),
        location: {
            address: parsedLocation.address || "",
            coordinates: {
                type: "Point",
                coordinates: [
                    parsedLocation.longitude || 0,
                    parsedLocation.latitude || 0
                ]
            },
            pickupAddress: parsedLocation.pickupAddress || parsedLocation.address || "",
            state: state || parsedLocation.state || "",
            city: city || parsedLocation.city || "",
        },
        description: description || "",
        schedulePickup: schedulePickup ? JSON.parse(schedulePickup) : {},
        schedulePickup: schedulePickup && typeof schedulePickup === 'string'
            ? (() => { try { return JSON.parse(schedulePickup); } catch(e) { return {}; } })()
            : (schedulePickup || {}),
        status: LOT_STATUS.PENDING,
        mlPrediction: {
            predictedCategory: finalCategory || mlClassification?.category || null,
            confidenceScore: mlClassification?.confidence || null,
            predictedPrice: mlPrice?.recommended_rate_inr || null,
            priceRange: {
                min: mlPrice?.estimated_value_min_inr || null,
                max: mlPrice?.estimated_value_max_inr || null,
            },
            matchLevel: mlPrice?.match_level || null,
            unit: mlPrice?.unit || null,
        },
    });

    const createdLot = await Lot.findById(lot._id)
        .populate("collectorId", "fullName phoneNumber address")
        .populate("materialId", "name category subCategory");

    return res.status(201).json(
        new ApiResponse(201, {
            lot: createdLot,
            ml: {
                classification: mlClassification,
                price: mlPrice,
            }
        }, "Lot created successfully with ML predictions")
    );
});

// Get all lots for a collector
const getCollectorLots = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { collectorId: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const lots = await Lot.find(filter)
        .populate("materialId", "name category subCategory")
        .populate("recyclerId", "fullName phoneNumber address")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Lot.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                lots,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                },
            },
            "Lots fetched successfully"
        )
    );
});

// Get all lots for a recycler
const getRecyclerLots = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { recyclerId: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const lots = await Lot.find(filter)
        .populate("collectorId", "fullName phoneNumber address")
        .populate("materialId", "name category subCategory")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Lot.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                lots,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                },
            },
            "Lots fetched successfully"
        )
    );
});

// Get single lot by ID
const getLotById = asyncHandler(async (req, res) => {
    const { lotId } = req.params;

    const lot = await Lot.findById(lotId)
        .populate("collectorId", "fullName phoneNumber address")
        .populate("recyclerId", "fullName phoneNumber address")
        .populate("materialId", "name category subCategory")
        .populate("matchedRecyclers.recyclerId", "fullName phoneNumber address");

    if (!lot) {
        throw new ApiError(404, "Lot not found");
    }

    return res.status(200).json(
        new ApiResponse(200, lot, "Lot fetched successfully")
    );
});

// Update lot status
const updateLotStatus = asyncHandler(async (req, res) => {
    const { lotId } = req.params;
    const { status, recyclerId, actualWeight, finalPrice, cancellationReason } = req.body;

    if (!status) {
        throw new ApiError(400, "Status is required");
    }

    const lot = await Lot.findById(lotId);
    if (!lot) {
        throw new ApiError(404, "Lot not found");
    }

    // Check if user is authorized
    const isCollector = lot.collectorId.toString() === req.user._id.toString();
    const isRecycler = lot.recyclerId && lot.recyclerId.toString() === req.user._id.toString();

    if (!isCollector && !isRecycler && req.user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to update this lot");
    }

    // Update fields
    const updateData = { status };

    if (recyclerId) {
        updateData.recyclerId = recyclerId;
    }

    if (actualWeight) {
        updateData.actualWeight = parseFloat(actualWeight);
    }

    if (finalPrice) {
        updateData.finalPrice = parseFloat(finalPrice);
    }

    if (status === LOT_STATUS.COMPLETED) {
        updateData.completedAt = new Date();
    }

    if (status === LOT_STATUS.CANCELLED) {
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = cancellationReason || "No reason provided";
    }

    if (status === LOT_STATUS.PICKED) {
        updateData.actualPickupTime = new Date();
    }

    if (status === LOT_STATUS.DELIVERED) {
        updateData.actualDeliveryTime = new Date();
    }

    const updatedLot = await Lot.findByIdAndUpdate(
        lotId,
        { $set: updateData },
        { new: true, runValidators: true }
    )
        .populate("collectorId", "fullName phoneNumber address")
        .populate("recyclerId", "fullName phoneNumber address")
        .populate("materialId", "name category subCategory");

    return res.status(200).json(
        new ApiResponse(200, updatedLot, "Lot status updated successfully")
    );
});

// Get available lots for recyclers
const getAvailableLots = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, materialId, minWeight, maxWeight } = req.query;

    const filter = {
        status: LOT_STATUS.PENDING,
        recyclerId: null,
    };

    if (materialId) filter.materialId = materialId;
    if (minWeight) filter.estimatedWeight = { $gte: parseFloat(minWeight) };
    if (maxWeight) filter.estimatedWeight = { ...filter.estimatedWeight, $lte: parseFloat(maxWeight) };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const lots = await Lot.find(filter)
        .populate("collectorId", "fullName phoneNumber address")
        .populate("materialId", "name category subCategory")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Lot.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                lots,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                },
            },
            "Available lots fetched successfully"
        )
    );
});

// Accept a lot (recycler)
const acceptLot = asyncHandler(async (req, res) => {
    const { lotId } = req.params;
    const { price } = req.body;

    const lot = await Lot.findById(lotId);
    if (!lot) {
        throw new ApiError(404, "Lot not found");
    }

    if (lot.status !== LOT_STATUS.PENDING) {
        throw new ApiError(400, "Lot is no longer available");
    }

    if (lot.recyclerId) {
        throw new ApiError(400, "Lot has already been accepted by another recycler");
    }

    // Update lot
    lot.recyclerId = req.user._id;
    lot.status = LOT_STATUS.ACCEPTED;
    lot.finalPrice = price || lot.estimatedPrice;
    await lot.save();

    const updatedLot = await Lot.findById(lotId)
        .populate("collectorId", "fullName phoneNumber address")
        .populate("recyclerId", "fullName phoneNumber address")
        .populate("materialId", "name category subCategory");

    return res.status(200).json(
        new ApiResponse(200, updatedLot, "Lot accepted successfully")
    );
});

// Delete lot
const deleteLot = asyncHandler(async (req, res) => {
    const { lotId } = req.params;

    const lot = await Lot.findById(lotId);
    if (!lot) {
        throw new ApiError(404, "Lot not found");
    }

    // Only collector who created or admin can delete
    if (lot.collectorId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to delete this lot");
    }

    // Only allow deletion if lot is pending
    if (lot.status !== LOT_STATUS.PENDING) {
        throw new ApiError(400, "Cannot delete a lot that is already in progress");
    }

    await Lot.findByIdAndDelete(lotId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Lot deleted successfully")
    );
});

export {
    createLot,
    getCollectorLots,
    getRecyclerLots,
    getLotById,
    updateLotStatus,
    getAvailableLots,
    acceptLot,
    deleteLot,
};