// backend/src/controllers/ml.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
    classifyMaterial,
    predictPrice,
    classifyAndPrice,
    getMLHealth,
    getValidCategories,
    validateCategory,
} from "../services/ml.service.js";

// ============================================
// GET /health - ML Service Health
// ============================================
const getHealth = asyncHandler(async (req, res) => {
    const health = await getMLHealth();
    return res.status(200).json(
        new ApiResponse(200, health, "ML service health status")
    );
});

// ============================================
// POST /classify - Classify Image
// ============================================
const testClassification = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Image file is required");
    }

    console.log('📸 File received:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        hasBuffer: !!req.file.buffer,
        hasPath: !!req.file.path,
    });

    const result = await classifyMaterial(req.file);

    return res.status(200).json({
        category: result.data.category,
        confidence: result.data.confidence,
        confidence_percent: result.data.confidence_percent,
    });
});

// ============================================
// POST /price - Get Price Recommendation
// ============================================
const testPricePrediction = asyncHandler(async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, "Request body is required");
    }

    const { category, state, city, quantity, total_weight_kg } = req.body;

    if (!category) throw new ApiError(400, "category is required");
    if (!state) throw new ApiError(400, "state is required");
    if (!city) throw new ApiError(400, "city is required");
    if (quantity === undefined || quantity === null) throw new ApiError(400, "quantity is required");
    if (total_weight_kg === undefined || total_weight_kg === null) throw new ApiError(400, "total_weight_kg is required");

    const result = await predictPrice({
        category,
        state,
        city,
        quantity: Number(quantity),
        total_weight_kg: Number(total_weight_kg),
    });

    return res.status(200).json({
        classification: result.data.classification,
        pricing: result.data.pricing,
    });
});

// ============================================
// POST /predict-and-price - Classify + Price
// ============================================
const testPredictAndPrice = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Image file is required");
    }

    const { state, city, quantity, total_weight_kg } = req.body;

    if (!state) throw new ApiError(400, "state is required");
    if (!city) throw new ApiError(400, "city is required");
    if (quantity === undefined || quantity === null) throw new ApiError(400, "quantity is required");
    if (total_weight_kg === undefined || total_weight_kg === null) throw new ApiError(400, "total_weight_kg is required");

    const result = await classifyAndPrice(req.file, {
        state,
        city,
        quantity: Number(quantity),
        total_weight_kg: Number(total_weight_kg),
    });

    return res.status(200).json({
        classification: result.data.classification,
        pricing: result.data.pricing,
    });
});

// ============================================
// GET /categories - Get Valid Categories
// ============================================
const getCategories = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, {
            categories: getValidCategories(),
        }, "Valid categories fetched")
    );
});

// ============================================
// GET /validate/:category - Validate Category
// ============================================
const validateCategoryEndpoint = asyncHandler(async (req, res) => {
    const { category } = req.params;

    if (!category) {
        throw new ApiError(400, "Category parameter is required");
    }

    const isValid = validateCategory(category);

    return res.status(200).json(
        new ApiResponse(200, {
            category,
            isValid,
            validCategories: getValidCategories(),
        }, "Category validation completed")
    );
});

export {
    getHealth,
    testClassification,
    testPricePrediction,
    testPredictAndPrice,
    getCategories,
    validateCategoryEndpoint,
};