// routes/system.routes.js
import express from "express";
import { verifyFirebaseToken, isAdmin } from "../middleware/auth.middleware.js";
import { toggleMaintenance, getMaintenanceStatus } from "../controllers/system.controller.js";

const router = express.Router();

router.post("/toggle-maintenance", verifyFirebaseToken, isAdmin, toggleMaintenance);
router.get("/status", getMaintenanceStatus);

export default router;
