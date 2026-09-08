// routes/transaction.routes.js
import { Router } from "express";
import {
    createTransaction,
    updateHandoverDetails,
    updatePaymentStatus,
    getTransactionById,
    getCollectorTransactions,
    getRecyclerTransactions,
} from "../controllers/transaction.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { USER_ROLES } from "../constants.js";

const router = Router();

// Both collector and recycler can access
router.route("/")
    .post(verifyJWT, createTransaction);

router.route("/collector")
    .get(verifyJWT, getCollectorTransactions);

router.route("/recycler")
    .get(verifyJWT, getRecyclerTransactions);

router.route("/:transactionId")
    .get(verifyJWT, getTransactionById);

router.route("/:transactionId/handover")
    .patch(verifyJWT, updateHandoverDetails);

router.route("/:transactionId/payment")
    .patch(verifyJWT, authorizeRoles(USER_ROLES.RECYCLER), updatePaymentStatus);

export default router;
