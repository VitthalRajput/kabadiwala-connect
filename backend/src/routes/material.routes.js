// routes/material.routes.js
import { Router } from "express";
import {
    createMaterial,
    getAllMaterials,
    getMaterialById,
    updateMaterial,
    deleteMaterialImage,
    deleteMaterial,
    getMaterialCategories,
    getMaterialsByCategory,
} from "../controllers/material.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

// Public routes (no authentication needed for viewing)
router.route("/categories").get(getMaterialCategories);
router.route("/category/:category").get(getMaterialsByCategory);
router.route("/").get(getAllMaterials);
router.route("/:materialId").get(getMaterialById);

// Protected routes - Admin OR Recycler can create/update materials
router.route("/")
    .post(
        verifyJWT,
        authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.RECYCLER),
        upload.array("images", 5),
        createMaterial
    );

router.route("/:materialId")
    .patch(
        verifyJWT,
        authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.RECYCLER),
        upload.array("images", 5),
        updateMaterial
    )
    .delete(
        verifyJWT,
        authorizeRoles(USER_ROLES.ADMIN),
        deleteMaterial
    );

router.route("/:materialId/image")
    .delete(
        verifyJWT,
        authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.RECYCLER),
        deleteMaterialImage
    );

export default router;