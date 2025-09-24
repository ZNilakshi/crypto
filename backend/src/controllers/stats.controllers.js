// controllers/stats.controllers.js
import User from "../models/User.js";

export const getActiveUsers = async (req, res) => {
  try {
    // Count only active accounts
    const count = await User.countDocuments({ isActive: true });

    // Add your marketing boost (e.g., +345)
    const displayCount = count + 345;

    res.json({
      success: true,
      activeUsers: count,
      displayUsers: displayCount
    });
  } catch (err) {
    console.error("❌ Error fetching active users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
