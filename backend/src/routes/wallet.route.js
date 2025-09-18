// routes/wallet.route.js
import express from "express";
import { verifyFirebaseToken } from "../middleware/auth.middleware.js";
import { getWalletSummary,downloadTransactionsPDF, getMyTransactions } from "../controllers/wallet.controller.js";
const router = express.Router();

router.get("/summary", verifyFirebaseToken, getWalletSummary);
router.get("/transactions", verifyFirebaseToken, getMyTransactions);
router.get("/transactions/pdf", verifyFirebaseToken, downloadTransactionsPDF);

export default router;
