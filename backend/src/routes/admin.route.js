import express from "express";
import { verifyFirebaseToken } from "../middleware/auth.middleware.js";
import {
  listAllUsers,
  getUserDetails,
  getAllDeposits,
  getAllWithdrawals,
  updateUserRole,
  deleteUser
} from "../controllers/admin.controller.js";

const router = express.Router();

// Users
router.get("/users/:userId", verifyFirebaseToken, getUserDetails);
router.put("/users/:userId/role", verifyFirebaseToken, updateUserRole);
router.delete("/users/:id", verifyFirebaseToken, deleteUser);
router.get("/users", verifyFirebaseToken, listAllUsers);

// Transactions
router.get("/deposits", verifyFirebaseToken, getAllDeposits);
router.get("/withdrawals", verifyFirebaseToken, getAllWithdrawals);

export default router;
