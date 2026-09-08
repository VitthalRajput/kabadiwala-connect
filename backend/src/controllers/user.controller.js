// controllers/user.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { USER_ROLES } from "../constants.js";

// Generate access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating tokens"
        );
    }
};

// Register user
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, phoneNumber, email, password, role, address } = req.body;

    // Validate required fields
    if (!fullName || !phoneNumber || !password) {
        throw new ApiError(400, "Full name, phone number, and password are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ phoneNumber }, { email: email?.toLowerCase() }],
    });

    if (existingUser) {
        throw new ApiError(409, "User with this phone number or email already exists");
    }

    // Handle profile picture upload
    let profilePicture = null;
    if (req.file) {
        const uploadedImage = await uploadOnCloudinary(req.file.path || req.file);
        if (uploadedImage) {
            profilePicture = uploadedImage.url;
        }
    }

    // Parse address if it's a string, otherwise use as is
    let parsedAddress = {};
    if (address) {
        if (typeof address === 'string') {
            try {
                parsedAddress = JSON.parse(address);
            } catch (error) {
                throw new ApiError(400, "Invalid address format. Please send valid JSON.");
            }
        } else {
            parsedAddress = address;
        }
    }

    // Create user
    const user = await User.create({
        fullName,
        phoneNumber,
        email: email?.toLowerCase() || null,
        password,
        role: role || USER_ROLES.COLLECTOR,
        profilePicture,
        address: parsedAddress,
        isVerified: false,
    });

    // Remove sensitive data from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
    const { phoneNumber, email, password } = req.body;

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    if (!phoneNumber && !email) {
        throw new ApiError(400, "Phone number or email is required");
    }

    // Find user by phone or email
    const user = await User.findOne({
        $or: [{ phoneNumber }, { email: email?.toLowerCase() }],
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Get user without sensitive data
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // Set cookies
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or invalid");
        }

        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken,
                    },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

// Get current user
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "Current user fetched successfully")
        );
});

// Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
    const { fullName, email, address } = req.body;

    const updateFields = {};
    if (fullName) updateFields.fullName = fullName;
    if (email) updateFields.email = email.toLowerCase();
    if (address) {
        if (typeof address === 'string') {
            try {
                updateFields.address = JSON.parse(address);
            } catch (error) {
                throw new ApiError(400, "Invalid address format");
            }
        } else {
            updateFields.address = address;
        }
    }

    // Handle profile picture update
    if (req.file) {
        const uploadedImage = await uploadOnCloudinary(req.file.path || req.file);
        if (uploadedImage) {
            updateFields.profilePicture = uploadedImage.url;
        }
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateFields },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Profile updated successfully"));
});

// Update user location
const updateUserLocation = asyncHandler(async (req, res) => {
    const { latitude, longitude, address } = req.body;

    if (!latitude || !longitude) {
        throw new ApiError(400, "Latitude and longitude are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                "address.coordinates.coordinates": [longitude, latitude],
                "address.street": address || "",
            },
        },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Location updated successfully"));
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }

    const user = await User.findById(req.user._id);
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: true });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Get all collectors (for recyclers)
const getAllCollectors = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, city, isVerified } = req.query;

    const filter = { role: USER_ROLES.COLLECTOR };
    if (city) filter["address.city"] = city;
    if (isVerified !== undefined) filter.isVerified = isVerified === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const collectors = await User.find(filter)
        .select("-password -refreshToken")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                collectors,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                },
            },
            "Collectors fetched successfully"
        )
    );
});

// Get all recyclers (for collectors)
const getAllRecyclers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, city } = req.query;

    const filter = { role: USER_ROLES.RECYCLER };
    if (city) filter["address.city"] = city;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const recyclers = await User.find(filter)
        .select("-password -refreshToken")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                recyclers,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                },
            },
            "Recyclers fetched successfully"
        )
    );
});

// Verify user (admin only)
const verifyUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: { isVerified: true } },
        { new: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User verified successfully"));
});

// Delete user (soft delete)
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { isActive: false } },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "User deactivated successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateUserProfile,
    updateUserLocation,
    changePassword,
    getAllCollectors,
    getAllRecyclers,
    verifyUser,
    deleteUser,
};