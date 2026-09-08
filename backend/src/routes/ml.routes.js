// backend/src/routes/ml.routes.js
import { Router } from "express";
import {
    getHealth,
    testClassification,
    testPricePrediction,
    testPredictAndPrice,
    getCategories,
    validateCategoryEndpoint,
} from "../controllers/ml.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// ============================================
// PUBLIC ROUTES (No Auth Required)
// ============================================

// GET /health - ML Service health check
router.route("/health").get(getHealth);

// ============================================
// PROTECTED ROUTES (Auth Required)
// ============================================

// POST /classify - Image classification
router.route("/classify")
    .post(
        verifyJWT,
        upload.single("image"),
        testClassification
    );

// POST /price - Price recommendation
router.route("/price")
    .post(verifyJWT, testPricePrediction);

// POST /predict-and-price - Classify + Price together
router.route("/predict-and-price")
    .post(
        verifyJWT,
        upload.single("image"),
        testPredictAndPrice
    );

// GET /categories - Get valid categories
router.route("/categories")
    .get(verifyJWT, getCategories);

// GET /validate/:category - Validate a category
router.route("/validate/:category")
    .get(verifyJWT, validateCategoryEndpoint);

export default router;