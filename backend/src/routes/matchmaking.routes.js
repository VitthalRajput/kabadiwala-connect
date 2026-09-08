// routes/matchmaking.routes.js
import { Router } from "express";
import {
    findBestRecycler,
    autoMatch,
    getMatchHistory,
    getMatchDetails,
} from "../controllers/matchmaking.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

// Protected routes
router.route("/lot/:lotId")
    .get(verifyJWT, findBestRecycler);

router.route("/lot/:lotId/auto")
    .post(verifyJWT, autoMatch);

router.route("/history")
    .get(verifyJWT, authorizeRoles(USER_ROLES.COLLECTOR), getMatchHistory);

router.route("/details/:lotId")
    .get(verifyJWT, getMatchDetails);

export default router;