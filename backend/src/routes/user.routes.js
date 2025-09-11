import express from "express";
import { changeAddress, changePassword,  changeSecurityPassword } from "../controllers/user.controllers.js";
import { verifyFirebaseToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/change-password", verifyFirebaseToken, changePassword);
router.post("/change-security-password", verifyFirebaseToken, changeSecurityPassword);
router.post("/change-address", verifyFirebaseToken, changeAddress); // 👈 new

export default router;
