// routes/stake.route.js
import express from "express";
import { verifyFirebaseToken } from "../middleware/auth.middleware.js";
import { createStake, listMyStakes, unstake } from "../controllers/stake.controllers.js";

const router = express.Router();
router.post("/", verifyFirebaseToken, createStake);
router.get("/", verifyFirebaseToken, listMyStakes);
router.post("/unstake", verifyFirebaseToken, unstake);


export default router;
