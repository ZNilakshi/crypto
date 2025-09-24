// routes/stats.routes.js
import express from "express";
import { getActiveUsers } from "../controllers/stats.controllers.js";

const router = express.Router();

// Public endpoint (no auth needed)
router.get("/active-users", getActiveUsers);

export default router;
