// routes/withdrawal.route.js
import express from "express";
import { verifyFirebaseToken } from "../middleware/auth.middleware.js";
import { requestWithdraw, listMyWithdrawals, adminListWithdrawals, adminApproveWithdrawal, adminRejectWithdrawal } from "../controllers/withdrawController.js";
import { check_role } from "../middleware/admin.check_role.js";

const router = express.Router();
router.post("/", verifyFirebaseToken, requestWithdraw);
router.get("/", verifyFirebaseToken, listMyWithdrawals);

router.get("/admin/all", verifyFirebaseToken, check_role(["crypto_admin"]), adminListWithdrawals);
router.post("/admin/:id/approve", verifyFirebaseToken, check_role(["crypto_admin"]), adminApproveWithdrawal);
router.post("/admin/:id/reject", verifyFirebaseToken, check_role(["crypto_admin"]), adminRejectWithdrawal);

export default router;
