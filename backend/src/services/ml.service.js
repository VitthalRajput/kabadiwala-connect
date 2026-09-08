// backend/src/services/ml.service.js
import { ApiError } from "../utils/ApiError.js";
import fs from 'fs';

// ============================================
// CONFIGURATION - REAL ML API
// ============================================

const ML_API_URL = process.env.ML_API_URL || 'https://sih-ewaste-api.onrender.com';
const ML_API_KEY = process.env.ML_API_KEY || 'ewaste_sih_8BMfnyGh0eKgp_ojBwOgYKxrNxzyhZSgdTJxbuosfug';

// Valid categories from ML model
const VALID_CATEGORIES = [
    'Battery',
    'CRT',
    'LCD_LED',
    'Motors',
    'PCB',
    'Plastic',
    'Wires'
];

// ============================================
// 1. IMAGE CLASSIFICATION - POST /classify
// ============================================

export const classifyMaterial = async (imageFile, options = {}) => {
    try {
        // Get image buffer
        let imageBuffer;
        let filename = 'image.jpg';
        let contentType = 'image/jpeg';

        if (imageFile.buffer) {
            imageBuffer = imageFile.buffer;
            filename = imageFile.originalname || 'image.jpg';
            contentType = imageFile.mimetype || 'image/jpeg';
        } else if (imageFile.path) {
            imageBuffer = fs.readFileSync(imageFile.path);
            filename = imageFile.originalname || 'image.jpg';
            contentType = imageFile.mimetype || 'image/jpeg';
        } else if (Buffer.isBuffer(imageFile)) {
            imageBuffer = imageFile;
            filename = options.filename || 'image.jpg';
            contentType = options.mimetype || 'image/jpeg';
        } else {
            throw new Error('Unsupported image format');
        }

        console.log('📤 Sending to ML API:', {
            url: `${ML_API_URL}/classify`,
            filename: filename,
            contentType: contentType,
            size: imageBuffer.length,
        });

        // ✅ Use native FormData with Blob (Node.js 18+)
        const formData = new FormData();
        const blob = new Blob([imageBuffer], { type: contentType });
        formData.append('image', blob, filename);

        const response = await fetch(`${ML_API_URL}/classify`, {
            method: 'POST',
            headers: {
                'X-API-Key': ML_API_KEY,
            },
            body: formData,
        });

        const responseText = await response.text();
        console.log('📥 ML API Response Status:', response.status);
        console.log('📥 ML API Response Body:', responseText);

        if (!response.ok) {
            throw new ApiError(500, `ML classification failed: ${responseText}`);
        }

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            throw new ApiError(500, `Invalid JSON response: ${responseText}`);
        }

        if (!result.category || !VALID_CATEGORIES.includes(result.category)) {
            throw new ApiError(500, `Invalid category returned: ${result.category}`);
        }

        return {
            success: true,
            data: {
                category: result.category,
                confidence: result.confidence || 0,
                confidence_percent: result.confidence_percent || 0,
            },
            message: "Material classified successfully",
        };
    } catch (error) {
        console.error("❌ ML Classification Error:", error);
        throw new ApiError(500, error.message || "ML classification failed");
    }
};

// ============================================
// 2. PRICE RECOMMENDATION - POST /price
// ============================================

export const predictPrice = async (priceData) => {
    try {
        const { category, state, city, quantity, total_weight_kg } = priceData;
        
        if (!category) throw new ApiError(400, "Category is required");
        if (!state) throw new ApiError(400, "State is required");
        if (!city) throw new ApiError(400, "City is required");
        if (quantity === undefined || quantity === null) throw new ApiError(400, "Quantity is required");
        if (total_weight_kg === undefined || total_weight_kg === null) throw new ApiError(400, "Total weight is required");

        if (!VALID_CATEGORIES.includes(category)) {
            throw new ApiError(400, `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
        }

        const requestBody = {
            category,
            state,
            city,
            quantity: Number(quantity),
            total_weight_kg: Number(total_weight_kg),
        };

        console.log('📤 Sending to ML API (Price):', requestBody);

        const response = await fetch(`${ML_API_URL}/price`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': ML_API_KEY,
            },
            body: JSON.stringify(requestBody),
        });

        const responseText = await response.text();
        console.log('📥 ML API Response (Price):', responseText);

        if (!response.ok) {
            throw new ApiError(500, `Price prediction failed: ${responseText}`);
        }

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            throw new ApiError(500, `Invalid JSON response: ${responseText}`);
        }

        if (result.pricing?.recommended_rate_inr === undefined) {
            throw new ApiError(500, "Invalid price response format");
        }

        return {
            success: true,
            data: {
                classification: result.classification || {},
                pricing: {
                    category: result.pricing.category || category.toUpperCase(),
                    recommended_rate_inr: result.pricing.recommended_rate_inr,
                    unit: result.pricing.unit || "per_kg",
                    estimated_value_inr: result.pricing.estimated_value_inr,
                    estimated_value_min_inr: result.pricing.estimated_value_min_inr,
                    estimated_value_max_inr: result.pricing.estimated_value_max_inr,
                    match_level: result.pricing.match_level || "state",
                },
            },
            message: "Price predicted successfully",
        };
    } catch (error) {
        console.error("❌ ML Price Prediction Error:", error);
        throw new ApiError(500, error.message || "Price prediction failed");
    }
};

// ============================================
// 3. PREDICT AND PRICE TOGETHER - POST /predict-and-price
// ============================================

export const classifyAndPrice = async (imageFile, priceData) => {
    try {
        // Get image buffer
        let imageBuffer;
        let filename = 'image.jpg';
        let contentType = 'image/jpeg';

        if (imageFile.buffer) {
            imageBuffer = imageFile.buffer;
            filename = imageFile.originalname || 'image.jpg';
            contentType = imageFile.mimetype || 'image/jpeg';
        } else if (imageFile.path) {
            imageBuffer = fs.readFileSync(imageFile.path);
            filename = imageFile.originalname || 'image.jpg';
            contentType = imageFile.mimetype || 'image/jpeg';
        } else if (Buffer.isBuffer(imageFile)) {
            imageBuffer = imageFile;
            filename = priceData.filename || 'image.jpg';
            contentType = priceData.mimetype || 'image/jpeg';
        } else {
            throw new Error('Unsupported image format');
        }

        // Use native FormData with Blob
        const formData = new FormData();
        const blob = new Blob([imageBuffer], { type: contentType });
        formData.append('image', blob, filename);
        formData.append('state', priceData.state);
        formData.append('city', priceData.city);
        formData.append('quantity', String(Number(priceData.quantity)));
        formData.append('total_weight_kg', String(Number(priceData.total_weight_kg)));

        console.log('📤 Sending to ML API (Predict & Price):', {
            filename: filename,
            state: priceData.state,
            city: priceData.city,
            quantity: priceData.quantity,
            total_weight_kg: priceData.total_weight_kg,
        });

        const response = await fetch(`${ML_API_URL}/predict-and-price`, {
            method: 'POST',
            headers: {
                'X-API-Key': ML_API_KEY,
            },
            body: formData,
        });

        const responseText = await response.text();
        console.log('📥 ML API Response (Predict & Price):', responseText);

        if (!response.ok) {
            throw new ApiError(500, `Predict and price failed: ${responseText}`);
        }

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            throw new ApiError(500, `Invalid JSON response: ${responseText}`);
        }

        return {
            success: true,
            data: {
                classification: result.classification || {},
                pricing: result.pricing || {},
            },
            message: "Classification and pricing completed successfully",
        };
    } catch (error) {
        console.error("❌ ML Classify & Price Error:", error);
        throw new ApiError(500, error.message || "Classification and pricing failed");
    }
};

// ============================================
// 4. HEALTH CHECK - GET /health
// ============================================

export const getMLHealth = async () => {
    try {
        const response = await fetch(`${ML_API_URL}/health`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Health check failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("❌ ML Health Check Error:", error);
        return {
            status: 'error',
            model_loaded: false,
            classes: [],
            error: error.message,
        };
    }
};

// ============================================
// 5. UTILITY FUNCTIONS
// ============================================

export const validateCategory = (category) => {
    return VALID_CATEGORIES.includes(category);
};

export const getValidCategories = () => {
    return VALID_CATEGORIES;
};

export default {
    classifyMaterial,
    predictPrice,
    classifyAndPrice,
    getMLHealth,
    validateCategory,
    getValidCategories,
    VALID_CATEGORIES,
};