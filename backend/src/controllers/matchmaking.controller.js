// controllers/matchmaking.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Lot } from "../models/lot.model.js";
import { Price } from "../models/price.model.js";
import { User } from "../models/user.model.js";
import { MLPrediction } from "../models/mlPrediction.model.js";
import { LOT_STATUS } from "../constants.js";

// Find best recycler for a lot
const findBestRecycler = asyncHandler(async (req, res) => {
    const { lotId } = req.params;

    // Get lot details
    const lot = await Lot.findById(lotId);
    if (!lot) {
        throw new ApiError(404, "Lot not found");
    }

    // Only pending lots can be matched
    if (lot.status !== LOT_STATUS.PENDING) {
        throw new ApiError(400, "Lot is no longer available for matching");
    }

    // Get all active recyclers
    const recyclers = await User.find({
        role: "recycler",
        isActive: true,
        isVerified: true,
    });

    if (recyclers.length === 0) {
        throw new ApiError(404, "No active recyclers found");
    }

    // Get prices for the material from all recyclers
    const materialPrices = await Price.find({
        materialId: lot.materialId,
        isActive: true,
        validUntil: { $or: [{ $gt: new Date() }, { $eq: null }] },
        recyclerId: { $in: recyclers.map(r => r._id) },
    }).populate("recyclerId", "fullName phoneNumber address isVerified");

    if (materialPrices.length === 0) {
        throw new ApiError(404, "No recyclers are currently pricing this material");
    }

    // Calculate match scores
    const matches = materialPrices.map(price => {
        const recycler = price.recyclerId;
        const score = calculateMatchScore(price, lot, recycler);
        
        return {
            recyclerId: recycler._id,
            recyclerName: recycler.fullName,
            phoneNumber: recycler.phoneNumber,
            address: recycler.address,
            price: price.pricePerKg,
            estimatedTotal: price.pricePerKg * lot.estimatedWeight,
            distance: score.distance || 0,
            score: score.total,
            breakdown: score.breakdown,
            priceId: price._id,
        };
    });

    // Sort by score (highest first)
    matches.sort((a, b) => b.score - a.score);

    // Store match results in lot
    lot.matchedRecyclers = matches.map(m => ({
        recyclerId: m.recyclerId,
        price: m.price,
        distance: m.distance,
        score: m.score,
        matchedAt: new Date(),
    }));
    await lot.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                lotId,
                materialName: (await lot.populate("materialId")).materialId.name,
                estimatedWeight: lot.estimatedWeight,
                matches,
                bestMatch: matches[0] || null,
            },
            "Matchmaking completed successfully"
        )
    );
});

// Calculate match score
const calculateMatchScore = (price, lot, recycler) => {
    const weights = {
        price: 0.4,
        distance: 0.3,
        rating: 0.2,
        availability: 0.1,
    };

    // 1. Price Score (higher price = better for collector)
    const maxPrice = 100; // Example max price per kg
    const priceScore = Math.min((price.pricePerKg / maxPrice) * 100, 100);

    // 2. Distance Score (closer = better)
    const distance = calculateDistance(
        lot.location.coordinates.coordinates,
        recycler.address.coordinates.coordinates
    );
    const distanceScore = Math.max(0, 100 - (distance / 10) * 10); // 10km = 0 score

    // 3. Rating Score (assuming we have ratings)
    const ratingScore = 80; // Default, can be enhanced with actual ratings

    // 4. Availability Score
    const availabilityScore = price.validUntil ? 100 : 80;

    // Calculate total score
    const total = (
        priceScore * weights.price +
        distanceScore * weights.distance +
        ratingScore * weights.rating +
        availabilityScore * weights.availability
    );

    return {
        total: Math.round(total),
        breakdown: {
            price: Math.round(priceScore),
            distance: Math.round(distanceScore),
            rating: Math.round(ratingScore),
            availability: Math.round(availabilityScore),
        },
        distance,
    };
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (coord1, coord2) => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

// Get match suggestions for a new lot (auto-match)
const autoMatch = asyncHandler(async (req, res) => {
    const { lotId } = req.params;

    const lot = await Lot.findById(lotId);
    if (!lot) {
        throw new ApiError(404, "Lot not found");
    }

    // Find best recycler
    const result = await findBestRecyclerInternal(lot);

    // Update lot with matched recyclers
    lot.matchedRecyclers = result.matches.map(m => ({
        recyclerId: m.recyclerId,
        price: m.price,
        distance: m.distance,
        score: m.score,
        matchedAt: new Date(),
    }));
    await lot.save();

    // Store ML prediction record
    await MLPrediction.create({
        lotId: lot._id,
        modelType: "matchmaking",
        inputData: {
            materialId: lot.materialId,
            weight: lot.estimatedWeight,
            location: lot.location,
        },
        predictions: {
            matchmaking: {
                recommendedRecyclers: result.matches.slice(0, 5).map(m => ({
                    recyclerId: m.recyclerId,
                    score: m.score,
                    reason: `Best price: ₹${m.price}/kg, Distance: ${m.distance.toFixed(1)}km`,
                })),
                bestMatch: {
                    recyclerId: result.matches[0]?.recyclerId || null,
                    score: result.matches[0]?.score || 0,
                },
            },
        },
        modelVersion: "1.0.0",
        isUsed: true,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                lotId,
                bestMatch: result.matches[0] || null,
                matches: result.matches.slice(0, 5),
            },
            "Auto-match completed successfully"
        )
    );
});

// Internal function for auto matching
const findBestRecyclerInternal = async (lot) => {
    const recyclers = await User.find({
        role: "recycler",
        isActive: true,
        isVerified: true,
    });

    const materialPrices = await Price.find({
        materialId: lot.materialId,
        isActive: true,
        validUntil: { $or: [{ $gt: new Date() }, { $eq: null }] },
        recyclerId: { $in: recyclers.map(r => r._id) },
    }).populate("recyclerId", "fullName phoneNumber address isVerified");

    const matches = materialPrices.map(price => {
        const recycler = price.recyclerId;
        const score = calculateMatchScore(price, lot, recycler);
        
        return {
            recyclerId: recycler._id,
            recyclerName: recycler.fullName,
            phoneNumber: recycler.phoneNumber,
            price: price.pricePerKg,
            estimatedTotal: price.pricePerKg * lot.estimatedWeight,
            distance: score.distance || 0,
            score: score.total,
            breakdown: score.breakdown,
            priceId: price._id,
        };
    });

    matches.sort((a, b) => b.score - a.score);
    return { matches };
};

// Get match history for a collector
const getMatchHistory = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const lots = await Lot.find({
        collectorId: req.user._id,
        "matchedRecyclers.0": { $exists: true },
    })
        .populate("materialId", "name category")
        .populate("matchedRecyclers.recyclerId", "fullName phoneNumber")
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

    const total = await Lot.countDocuments({
        collectorId: req.user._id,
        "matchedRecyclers.0": { $exists: true },
    });

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
            "Match history fetched successfully"
        )
    );
});

// Get match details for a specific lot
const getMatchDetails = asyncHandler(async (req, res) => {
    const { lotId } = req.params;

    const lot = await Lot.findById(lotId)
        .populate("materialId", "name category")
        .populate("matchedRecyclers.recyclerId", "fullName phoneNumber address");

    if (!lot) {
        throw new ApiError(404, "Lot not found");
    }

    // Check authorization
    const isCollector = lot.collectorId.toString() === req.user._id.toString();
    const isRecycler = lot.matchedRecyclers.some(
        m => m.recyclerId._id.toString() === req.user._id.toString()
    );

    if (!isCollector && !isRecycler && req.user.role !== "admin") {
        throw new ApiError(403, "Not authorized to view this match");
    }

    return res.status(200).json(
        new ApiResponse(200, lot, "Match details fetched successfully")
    );
});

export {
    findBestRecycler,
    autoMatch,
    getMatchHistory,
    getMatchDetails,
};