import express from 'express';
import { 
  hasSecurityPassword, 
  changeSecurityPassword, 
  verifySecurityPassword 
} from '../controllers/security.controllers.js';
import { verifyFirebaseToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyFirebaseToken);

// Check if user has security password
router.get('/has-security-password', hasSecurityPassword);

// Change security password
router.post('/change-security-password', changeSecurityPassword);

// Verify security password
router.post('/verify-security-password', verifySecurityPassword);

export default router;