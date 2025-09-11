
import admin from "../config/firebase.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Deposit from "../models/Deposit.js";

export const changeSecurityPassword = async (req, res) => {
  try {
    const { currentSecurityPassword, newSecurityPassword } = req.body;

    // Get user with security password
    const user = await User.findById(req.userId).select("+securityPassword");
    if (!user) {
      return res.status(404).json({ message: "❌ User not found" });
    }

    // If security password exists, verify it
    if (user.securityPassword) {
      const isMatch = await bcrypt.compare(currentSecurityPassword, user.securityPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "❌ Current security password is incorrect" });
      }
    }

    // Set new security password directly (pre-save hook will hash it)
    user.securityPassword = newSecurityPassword;
    await user.save();

    res.json({ message: "✅ Security password updated successfully" });
  } catch (err) {
    console.error("Error updating security password:", err);
    res.status(500).json({ message: "❌ Failed to update security password" });
  }
};
export const changePassword = async (req, res) => {
  try {
    console.log("🔧 Change password endpoint called");
    console.log("Request body:", req.body);
    console.log("Request firebaseUid:", req.firebaseUid);
    console.log("Request user:", req.user ? req.user.username : "No user");

    const { currentPassword, newPassword } = req.body;
    const { firebaseUid } = req;

    if (!firebaseUid) {
      console.log("❌ No firebaseUid in request");
      return res.status(400).json({ message: "❌ Invalid user ID" });
    }

    console.log("🔄 Updating password for UID:", firebaseUid);
    
    await admin.auth().updateUser(firebaseUid, { password: newPassword });
    
    console.log("✅ Password updated successfully");
    res.json({ message: "✅ Password updated successfully" });
  } catch (err) {
    console.error("❌ Error changing password:", err);
    
    if (err.code === 'auth/invalid-password') {
      return res.status(400).json({ message: "❌ Password is too weak" });
    }
    
    if (err.code === 'auth/user-not-found') {
      return res.status(404).json({ message: "❌ User not found in Firebase" });
    }
    
    res.status(500).json({ message: "❌ Failed to change password: " + err.message });
  }
};
// Change crypto address (one-time only)
export const changeAddress = async (req, res) => {
  try {
    const { cryptoAddress, walletType } = req.body;

    if (!cryptoAddress || !walletType) {
      return res.status(400).json({ message: "❌ Address and wallet type are required" });
    }

    // Find user by ID from middleware
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "❌ User not found" });
    }

    // Prevent changing once already set
    if (user.cryptoAddress) {
      return res.status(400).json({ message: "❌ Address already set. Cannot change again." });
    }

    // Save new address
    user.cryptoAddress = cryptoAddress.trim();
    user.walletType = walletType;
    await user.save();

    res.json({ 
      message: "✅ Address updated successfully", 
      cryptoAddress: user.cryptoAddress, 
      walletType: user.walletType 
    });
  } catch (err) {
    console.error("❌ Error updating address:", err);
    res.status(500).json({ message: "❌ Failed to update address" });
  }
};

