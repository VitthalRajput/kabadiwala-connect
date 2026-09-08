// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request - No token provided");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "Invalid Access Token - User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            throw new ApiError(401, "Invalid Access Token");
        }
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Access Token expired");
        }
        throw new ApiError(401, error?.message || "Unauthorized request");
    }
});

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized - Please login first");
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(
                403,
                `Forbidden - Only ${allowedRoles.join(", ")} can access this resource`
            );
        }

        next();
    };
};