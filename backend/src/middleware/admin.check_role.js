// src/middleware/admin.check_role.js
import User from "../models/User.js";

export const check_role = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
      }

      next();
    } catch (err) {
      console.error("❌ Role check error:", err);
      res.status(500).json({ success: false, message: "Server error in role check" });
    }
  };
};
