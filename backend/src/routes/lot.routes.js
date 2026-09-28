// routes/lot.routes.js
import { Router } from "express";
import {
    createLot,
    getCollectorLots,
    getRecyclerLots,
    getLotById,
    updateLotStatus,
    getAvailableLots,
    acceptLot,
    deleteLot,
} from "../controllers/lot.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

// Protected routes
router.route("/")
    .post(
        verifyJWT,
        upload.array("images", 5),
        createLot
    )
    .get(verifyJWT, getAvailableLots);

// Collector specific - retrieves lots created by the authenticated user
router.route("/collector")
    .get(verifyJWT, getCollectorLots);

// Recycler specific - retrieves lots accepted by the authenticated user
router.route("/recycler")
    .get(verifyJWT, getRecyclerLots);

// Specific lot routes
router.route("/:lotId")
    .get(verifyJWT, getLotById)
    .patch(verifyJWT, updateLotStatus)
    .delete(verifyJWT, deleteLot);

router.route("/:lotId/accept")
    .patch(verifyJWT, acceptLot);

export default router;
