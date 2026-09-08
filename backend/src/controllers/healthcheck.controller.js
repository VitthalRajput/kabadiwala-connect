// controllers/healthcheck.controller.js
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                status: "healthy",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            },
            "Server is healthy"
        )
    );
});

export { healthCheck };