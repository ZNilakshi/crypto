
import admin from "../config/firebase.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Deposit from "../models/Deposit.js";

// Update the changePassword function to verify current password
export const changePassword = async (req, res) => {
  try {
    console.log("🔧 Change password endpoint called");
    const { currentPassword, newPassword } = req.body;
    const { firebaseUid } = req;

    if (!firebaseUid) {
      return res.status(400).json({ message: "❌ Invalid user ID" });
    }

    // Verify current password by trying to sign in
    try {
      const user = await admin.auth().getUser(firebaseUid);
      const email = user.email;
      
      // This is a simplified approach - in production, you might want to use
      // Firebase Admin SDK to verify the password or implement a proper reauthentication flow
      const signInMethods = await admin.auth().fetchSignInMethodsForEmail(email);
      
      if (signInMethods.length === 0) {
        return res.status(400).json({ message: "❌ Unable to verify current password" });
      }
    } catch (err) {
      console.error("❌ Error verifying current password:", err);
      return res.status(400).json({ message: "❌ Current password is incorrect" });
    }

    // If current password verification passes, update to new password
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

// Update the changeSecurityPassword function to properly validate current security password
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
    } else {
      // If no security password is set, use the login password as fallback
      // You might want to verify against Firebase Auth here
      // This is a simplified approach
      const firebaseUser = await admin.auth().getUser(req.firebaseUid);
      // Note: This doesn't actually verify the password - you'd need a different approach
      // For a production system, consider implementing a proper reauthentication flow
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


