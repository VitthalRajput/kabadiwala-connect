// routes/price.routes.js
import { Router } from "express";
import {
    setPrice,
    getPricesByMaterial,
    getMyPrices,
    getPriceHistory,
    deactivatePrice,
    getBestPrice,
} from "../controllers/price.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

// Public routes (view prices)
router.route("/material/:materialId").get(getPricesByMaterial);
router.route("/material/:materialId/best").get(getBestPrice);
router.route("/material/:materialId/history").get(getPriceHistory);

// Recycler routes
router.route("/")
    .post(verifyJWT, authorizeRoles(USER_ROLES.RECYCLER), setPrice)
    .get(verifyJWT, authorizeRoles(USER_ROLES.RECYCLER), getMyPrices);

router.route("/:priceId")
    .delete(verifyJWT, authorizeRoles(USER_ROLES.RECYCLER), deactivatePrice);

export default router;