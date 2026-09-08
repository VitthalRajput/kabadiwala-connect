// controllers/material.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Material } from "../models/material.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { MATERIAL_TYPES } from "../constants.js";

// Create a new material
const createMaterial = asyncHandler(async (req, res) => {
    const {
        name,
        category,
        subCategory,
        description,
        attributes,
        isRecyclable,
        isHazardous,
        disposalInstructions,
        processingTime,
    } = req.body;

    // Validate required fields
    if (!name || !category) {
        throw new ApiError(400, "Material name and category are required");
    }

    // Check if category is valid
    if (!Object.values(MATERIAL_TYPES).includes(category)) {
        throw new ApiError(400, `Invalid category. Must be one of: ${Object.values(MATERIAL_TYPES).join(", ")}`);
    }

    // Check if material already exists
    const existingMaterial = await Material.findOne({ name: name.trim() });
    if (existingMaterial) {
        throw new ApiError(409, "Material with this name already exists");
    }

    // Handle image uploads
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const uploadedImage = await uploadOnCloudinary(file.path);
            if (uploadedImage) {
                imageUrls.push(uploadedImage.url);
            }
        }
    }

    // Parse attributes if it's a string
    let parsedAttributes = {};
    if (attributes) {
        if (typeof attributes === 'string') {
            try {
                parsedAttributes = JSON.parse(attributes);
            } catch (error) {
                throw new ApiError(400, "Invalid attributes format. Please send valid JSON.");
            }
        } else {
            parsedAttributes = attributes;
        }
    }

    // Create material
    const material = await Material.create({
        name: name.trim(),
        category,
        subCategory: subCategory?.trim() || "",
        description: description?.trim() || "",
        images: imageUrls,
        attributes: parsedAttributes,
        isRecyclable: isRecyclable !== undefined ? isRecyclable : true,
        isHazardous: isHazardous !== undefined ? isHazardous : false,
        disposalInstructions: disposalInstructions?.trim() || "",
        processingTime: processingTime ? parseInt(processingTime) : 24,
    });

    return res.status(201).json(
        new ApiResponse(201, material, "Material created successfully")
    );
});

// Get all materials
const getAllMaterials = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, category, search, isRecyclable, isHazardous } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (isRecyclable !== undefined) filter.isRecyclable = isRecyclable === "true";
    if (isHazardous !== undefined) filter.isHazardous = isHazardous === "true";
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { subCategory: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const materials = await Material.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Material.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                materials,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                },
            },
            "Materials fetched successfully"
        )
    );
});

// Get material by ID
const getMaterialById = asyncHandler(async (req, res) => {
    const { materialId } = req.params;

    const material = await Material.findById(materialId);
    if (!material) {
        throw new ApiError(404, "Material not found");
    }

    return res.status(200).json(
        new ApiResponse(200, material, "Material fetched successfully")
    );
});

// Update material
const updateMaterial = asyncHandler(async (req, res) => {
    const { materialId } = req.params;
    const {
        name,
        category,
        subCategory,
        description,
        attributes,
        isRecyclable,
        isHazardous,
        disposalInstructions,
        processingTime,
    } = req.body;

    const material = await Material.findById(materialId);
    if (!material) {
        throw new ApiError(404, "Material not found");
    }

    // Build update object
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (category) {
        if (!Object.values(MATERIAL_TYPES).includes(category)) {
            throw new ApiError(400, `Invalid category. Must be one of: ${Object.values(MATERIAL_TYPES).join(", ")}`);
        }
        updateData.category = category;
    }
    if (subCategory !== undefined) updateData.subCategory = subCategory.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (attributes) {
        if (typeof attributes === 'string') {
            try {
                updateData.attributes = JSON.parse(attributes);
            } catch (error) {
                throw new ApiError(400, "Invalid attributes format");
            }
        } else {
            updateData.attributes = attributes;
        }
    }
    if (isRecyclable !== undefined) updateData.isRecyclable = isRecyclable;
    if (isHazardous !== undefined) updateData.isHazardous = isHazardous;
    if (disposalInstructions !== undefined) updateData.disposalInstructions = disposalInstructions.trim();
    if (processingTime) updateData.processingTime = parseInt(processingTime);

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
        const imageUrls = [...material.images];
        for (const file of req.files) {
            const uploadedImage = await uploadOnCloudinary(file.path);
            if (uploadedImage) {
                imageUrls.push(uploadedImage.url);
            }
        }
        updateData.images = imageUrls;
    }

    const updatedMaterial = await Material.findByIdAndUpdate(
        materialId,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedMaterial, "Material updated successfully")
    );
});

// Delete material image
const deleteMaterialImage = asyncHandler(async (req, res) => {
    const { materialId } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
        throw new ApiError(400, "Image URL is required");
    }

    const material = await Material.findById(materialId);
    if (!material) {
        throw new ApiError(404, "Material not found");
    }

    material.images = material.images.filter(img => img !== imageUrl);
    await material.save();

    return res.status(200).json(
        new ApiResponse(200, material, "Image removed successfully")
    );
});

// Delete material
const deleteMaterial = asyncHandler(async (req, res) => {
    const { materialId } = req.params;

    const material = await Material.findById(materialId);
    if (!material) {
        throw new ApiError(404, "Material not found");
    }

    // Check if material is being used in any lot
    const Lot = (await import("../models/lot.model.js")).Lot;
    const lotsUsingMaterial = await Lot.findOne({ materialId });
    if (lotsUsingMaterial) {
        throw new ApiError(400, "Cannot delete material as it is being used in existing lots");
    }

    await Material.findByIdAndDelete(materialId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Material deleted successfully")
    );
});

// Get material categories (for dropdown)
const getMaterialCategories = asyncHandler(async (req, res) => {
    const categories = Object.values(MATERIAL_TYPES).map(category => ({
        value: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
    }));

    return res.status(200).json(
        new ApiResponse(200, categories, "Categories fetched successfully")
    );
});

// Get materials by category
const getMaterialsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;

    if (!Object.values(MATERIAL_TYPES).includes(category)) {
        throw new ApiError(400, `Invalid category. Must be one of: ${Object.values(MATERIAL_TYPES).join(", ")}`);
    }

    const materials = await Material.find({ category })
        .select("name subCategory description images isRecyclable")
        .sort({ name: 1 });

    return res.status(200).json(
        new ApiResponse(200, materials, `Materials in ${category} category fetched successfully`)
    );
});

export {
    createMaterial,
    getAllMaterials,
    getMaterialById,
    updateMaterial,
    deleteMaterialImage,
    deleteMaterial,
    getMaterialCategories,
    getMaterialsByCategory,
};