import express from "express";
import { verifyFirebaseToken } from "../middleware/auth.middleware.js";
import { 
  createTrading, 
  listTradings, 
  unlockTrading 
} from "../controllers/trading.controller.js";

const router = express.Router();

router.post("/", verifyFirebaseToken, createTrading);          
router.get("/", verifyFirebaseToken, listTradings);         
router.post("/unlock/:id", verifyFirebaseToken, unlockTrading);    

export default router;