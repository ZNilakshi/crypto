// controllers/system.controller.js
import SystemConfig from "../models/SystemConfig.js";

export const toggleMaintenance = async (req, res) => {
  try {
    const config = await SystemConfig.findOne() || new SystemConfig();
    config.maintenanceMode = !config.maintenanceMode;
    await config.save();

    res.json({ success: true, maintenanceMode: config.maintenanceMode });
  } catch (err) {
    console.error("❌ Toggle error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMaintenanceStatus = async (req, res) => {
  try {
    const config = await SystemConfig.findOne();
    res.json({ maintenanceMode: config?.maintenanceMode || false });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
