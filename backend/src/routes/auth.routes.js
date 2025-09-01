import express from "express";
import { registerUser,    verifyEmail, getEmailFromUsername , checkUsername ,  getRoleByUid, 
} from "../controllers/auth.controllers.js";
import { verifyFirebaseToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/get-email", getEmailFromUsername); // 👈 new route
router.post("/check-username", checkUsername);   // 👈 add this
router.post("/get-role", getRoleByUid); // ✅ new route

export default router;
