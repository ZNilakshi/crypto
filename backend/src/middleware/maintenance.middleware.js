// middleware/maintenance.middleware.js
import SystemConfig from "../models/SystemConfig.js";

export const checkMaintenance = async (req, res, next) => {
  try {
    const config = await SystemConfig.findOne();

    if (config?.maintenanceMode) {
      // Allow admin
      if (req.user?.role === "crypto_admin") {
        return next();
      }
      return res.status(503).json({
        success: false,
        message: "🚧 Website is under maintenance. Please check back later."
      });
    }

    next();
  } catch (err) {
    next();
  }
};
