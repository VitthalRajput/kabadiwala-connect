// controllers/price.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Price } from "../models/price.model.js";
import { Material } from "../models/material.model.js";

// Set price for a material (Recycler)
const setPrice = asyncHandler(async (req, res) => {
    const {
        materialId,
        pricePerKg,
        minQuantity,
        maxQuantity,
        validUntil,
        specialNotes,
    } = req.body;

    if (!materialId || !pricePerKg) {
        throw new ApiError(400, "Material ID and price per kg are required");
    }

    // Check if material exists
    const material = await Material.findById(materialId);
    if (!material) {
        throw new ApiError(404, "Material not found");
    }

    // Check if recycler already has a price for this material
    let existingPrice = await Price.findOne({
        materialId,
        recyclerId: req.user._id,
        isActive: true,
    });

    if (existingPrice) {
        // Update existing price
        const historicalPrice = {
            price: existingPrice.pricePerKg,
            date: new Date(),
        };
        
        existingPrice.historicalPrices.push(historicalPrice);
        existingPrice.pricePerKg = parseFloat(pricePerKg);
        if (minQuantity) existingPrice.minQuantity = parseInt(minQuantity);
        if (maxQuantity) existingPrice.maxQuantity = parseInt(maxQuantity);
        if (validUntil) existingPrice.validUntil = new Date(validUntil);
        if (specialNotes) existingPrice.specialNotes = specialNotes.trim();
        
        await existingPrice.save();
        
        return res.status(200).json(
            new ApiResponse(200, existingPrice, "Price updated successfully")
        );
    }

    // Create new price
    const price = await Price.create({
        materialId,
        recyclerId: req.user._id,
        pricePerKg: parseFloat(pricePerKg),
        minQuantity: minQuantity ? parseInt(minQuantity) : 1,
        maxQuantity: maxQuantity ? parseInt(maxQuantity) : 1000,
        validUntil: validUntil ? new Date(validUntil) : null,
        specialNotes: specialNotes?.trim() || "",
        historicalPrices: [
            {
                price: parseFloat(pricePerKg),
                date: new Date(),
            }
        ],
    });

    return res.status(201).json(
        new ApiResponse(201, price, "Price set successfully")
    );
});

// Get current prices for a material
const getPricesByMaterial = asyncHandler(async (req, res) => {
    const { materialId } = req.params;

    const prices = await Price.find({
        materialId,
        isActive: true,
        validUntil: { $or: [{ $gt: new Date() }, { $eq: null }] },
    })
        .populate("recyclerId", "fullName phoneNumber address")
        .sort({ pricePerKg: 1 });

    return res.status(200).json(
        new ApiResponse(200, prices, "Prices fetched successfully")
    );
});

// Get recycler's prices
const getMyPrices = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const prices = await Price.find({
        recyclerId: req.user._id,
        isActive: true,
    })
        .populate("materialId", "name category subCategory images")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Price.countDocuments({
        recyclerId: req.user._id,
        isActive: true,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                prices,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                },
            },
            "Your prices fetched successfully"
        )
    );
});

// Get price history for a material
const getPriceHistory = asyncHandler(async (req, res) => {
    const { materialId } = req.params;

    const prices = await Price.find({
        materialId,
        isActive: true,
    })
        .populate("recyclerId", "fullName")
        .select("pricePerKg historicalPrices createdAt");

    // Format history
    const history = [];
    prices.forEach(price => {
        history.push({
            recycler: price.recyclerId?.fullName || "Unknown",
            currentPrice: price.pricePerKg,
            historical: price.historicalPrices || [],
        });
    });

    return res.status(200).json(
        new ApiResponse(200, history, "Price history fetched successfully")
    );
});

// Deactivate price (recycler stops offering)
const deactivatePrice = asyncHandler(async (req, res) => {
    const { priceId } = req.params;

    const price = await Price.findOne({
        _id: priceId,
        recyclerId: req.user._id,
    });

    if (!price) {
        throw new ApiError(404, "Price not found or not owned by you");
    }

    price.isActive = false;
    await price.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Price deactivated successfully")
    );
});

// Get best price for a material (for matchmaking)
const getBestPrice = asyncHandler(async (req, res) => {
    const { materialId } = req.params;

    const bestPrice = await Price.findOne({
        materialId,
        isActive: true,
        validUntil: { $or: [{ $gt: new Date() }, { $eq: null }] },
    })
        .populate("recyclerId", "fullName phoneNumber address")
        .sort({ pricePerKg: 1 });

    if (!bestPrice) {
        throw new ApiError(404, "No active price found for this material");
    }

    return res.status(200).json(
        new ApiResponse(200, bestPrice, "Best price fetched successfully")
    );
});

export {
    setPrice,
    getPricesByMaterial,
    getMyPrices,
    getPriceHistory,
    deactivatePrice,
    getBestPrice,
};