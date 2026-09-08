// routes/sync.routes.js
import { Router } from "express";
import {
    startSync,
    syncData,
    getOfflineData,
    getSyncStatus,
    cancelSync,
    getSyncHistory,
} from "../controllers/sync.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected routes
router.route("/start")
    .post(verifyJWT, startSync);

router.route("/offline-data")
    .get(verifyJWT, getOfflineData);

router.route("/status")
    .get(verifyJWT, getSyncStatus);

router.route("/history")
    .get(verifyJWT, getSyncHistory);

router.route("/:syncId")
    .post(verifyJWT, syncData)
    .delete(verifyJWT, cancelSync);

export default router;