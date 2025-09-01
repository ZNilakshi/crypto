import express from "express";
import { verifyFirebaseToken } from "../../middleware/auth.middleware.js";
import { getAllDeposits, updateDepositStatus } from "../../controllers/admin/adminDeposit.controllers.js";
import User from "../../models/User.js";

const router = express.Router();

// Only allow crypto_admin
const requireAdmin = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user || user.role !== "crypto_admin") {
    return res.status(403).json({ success: false, message: "Admin access only" });
  }
  next();
};

router.get("/", verifyFirebaseToken, requireAdmin, getAllDeposits);
router.put("/:depositId", verifyFirebaseToken, requireAdmin, updateDepositStatus);

export default router;
