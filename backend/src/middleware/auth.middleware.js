import admin from '../config/firebase.js';
import User from '../models/User.js';

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    console.log("🔐 Middleware called - verifying token");
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log("Token received:", token ? "Yes" : "No");

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("✅ Token verified, UID:", decodedToken.uid);
    
    req.firebaseUid = decodedToken.uid;
    req.firebaseUser = decodedToken;

    // Find user in MongoDB
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      console.log("❌ User not found in database for UID:", decodedToken.uid);
      return res.status(404).json({
        success: false,
        message: 'User not found in database'
      });
    }

    if (!user.isActive) {
      console.log("❌ User account deactivated");
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    req.userId = user._id;
    req.user = user;
    
    console.log("✅ Middleware completed, user:", user.username);
    next();
  } catch (error) {
    console.error('❌ Token verification error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const user = await User.findOne({ firebaseUid: decodedToken.uid });
      
      if (user && user.isActive) {
        req.userId = user._id;
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};