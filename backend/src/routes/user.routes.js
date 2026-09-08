// routes/user.routes.js
import { Router } from "express";
import {
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
} from "../controllers/user.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

// Public routes
router.route("/register").post(
    upload.single("profilePicture"),
    registerUser
);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/update-profile").patch(
    verifyJWT,
    upload.single("profilePicture"),
    updateUserProfile
);
router.route("/update-location").patch(verifyJWT, updateUserLocation);
router.route("/change-password").patch(verifyJWT, changePassword);
router.route("/delete").delete(verifyJWT, deleteUser);

// Admin only routes
router.route("/verify/:userId").patch(
    verifyJWT,
    authorizeRoles(USER_ROLES.ADMIN),
    verifyUser
);

// Public routes for fetching users
router.route("/collectors").get(
    verifyJWT,
    getAllCollectors
);
router.route("/recyclers").get(
    verifyJWT,
    getAllRecyclers
);

export default router;