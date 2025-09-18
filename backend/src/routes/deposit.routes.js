import express from "express";
import { verifyFirebaseToken } from "../middleware/auth.middleware.js";
import { createDeposit, adminDepositToUser, adminHoldDeposit, listMyDeposits, adminListDeposits, adminApproveDeposit, adminRejectDeposit } from "../controllers/deposit.controllers.js";
import { check_role } from "../middleware/admin.check_role.js"; 

const router = express.Router();
router.post("/", verifyFirebaseToken, createDeposit);
router.get("/", verifyFirebaseToken, listMyDeposits);

router.get("/admin/all", verifyFirebaseToken, check_role(["crypto_admin"]), adminListDeposits);
router.post("/admin/:id/approve", verifyFirebaseToken, check_role(["crypto_admin"]), adminApproveDeposit);
router.post("/admin/:id/reject", verifyFirebaseToken, check_role(["crypto_admin"]), adminRejectDeposit);
router.post("/admin/:id/hold", adminHoldDeposit);
router.post(
  "/admin/deposit",
  verifyFirebaseToken,
  check_role(["crypto_admin"]),
  adminDepositToUser
);

export default router;
