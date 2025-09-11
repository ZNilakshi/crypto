import express from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";
import { verifyFirebaseToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected route
router.get("/", verifyFirebaseToken, getDashboard);

export default router;
