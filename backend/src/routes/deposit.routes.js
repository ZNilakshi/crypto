import express from "express";
import { verifyFirebaseToken } from "../middleware/auth.middleware.js";
import { createDeposit, getUserDeposits } from "../controllers/deposit.controllers.js";

const router = express.Router();

router.post("/", verifyFirebaseToken, createDeposit); // create deposit
router.get("/", verifyFirebaseToken, getUserDeposits); // fetch deposits

export default router;
