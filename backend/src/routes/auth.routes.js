import express from "express";
import { registerUser, getDashboard,    verifyEmail, getEmailFromUsername , checkUsername ,  getRoleByUid, 
} from "../controllers/auth.controllers.js";
import { verifyFirebaseToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/get-email", getEmailFromUsername); 
router.post("/check-username", checkUsername);   
router.post("/get-role", getRoleByUid); 
router.get("/dashboard", verifyFirebaseToken, getDashboard);

export default router;
