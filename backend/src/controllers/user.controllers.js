// controllers/userController.js
import admin from "../config/firebase.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Deposit from "../models/Deposit.js";

export const changeSecurityPassword = async (req, res) => {
  try {
    const { currentSecurityPassword, newSecurityPassword } = req.body;
    const user = await User.findById(req.userId).select("+securityPassword");

    // If security password exists, verify first
    if (user.securityPassword) {
      const isMatch = await bcrypt.compare(currentSecurityPassword, user.securityPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "❌ Current security password is incorrect" });
      }
    }

    // Hash and save new security password
    const hashedPassword = await bcrypt.hash(newSecurityPassword, 10);
    user.securityPassword = hashedPassword;
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

export const updateHierarchyAndCommissions = async (newUser, referrer, layer = 1) => {
  let currentReferrer = referrer;
  let currentLayer = layer;

  while (currentReferrer && currentLayer <= 3) {   // ✅ Only 3 layers
    if (currentLayer > 1) {
      if (!currentReferrer.indirectReferrals.includes(newUser._id)) {
        currentReferrer.indirectReferrals.push(newUser._id);
      }
    }

    // Update group stakes
    currentReferrer.totalGroupStakes += newUser.totalStakes;

    // ✅ Commission distribution (direct for layer 1, indirect for 2–3)
    if (currentLayer === 1) {
      currentReferrer.directCommissions +=
        newUser.totalStakes * COMMISSION.direct;
    } else {
      currentReferrer.layer1_3Commissions +=
        newUser.totalStakes * COMMISSION.indirect[currentLayer - 1];
    }

    // ✅ Level progression rules
    if (currentReferrer.level < 1 && currentReferrer.directReferrals.length >= 6) {
      currentReferrer.level = 1;
    } else if (currentReferrer.level < 2) {
      const level1Directs = await User.countDocuments({
        _id: { $in: currentReferrer.directReferrals },
        level: { $gte: 1 },
      });
      if (level1Directs >= 2) {
        currentReferrer.level = 2;
      }
    } else if (currentReferrer.level < 3) {
      const layer2Users = await getUsersAtLayerOptimized(currentReferrer._id, 2);
      const layer2Level1 = layer2Users.filter((u) => u.level >= 1).length;
      if (layer2Level1 >= 2) {
        currentReferrer.level = 3;
      }
    }

    await currentReferrer.save();

    // Move up
    currentReferrer = await User.findById(currentReferrer.referredBy);
    currentLayer++;
  }
};


export const getUsersAtLayerOptimized = async (rootId, targetLayer) => {
  if (targetLayer < 1) return [];

  let currentLayerUsers = [rootId];
  let nextLayerUsers = [];

  for (let layer = 1; layer <= targetLayer; layer++) {
    nextLayerUsers = [];
    const users = await User.find({ _id: { $in: currentLayerUsers } }).select('directReferrals level');

    for (let u of users) {
      if (layer === targetLayer) {
        nextLayerUsers.push(u); // return users at target layer
      } else {
        nextLayerUsers = nextLayerUsers.concat(u.directReferrals);
      }
    }

    currentLayerUsers = nextLayerUsers.map(u => u._id || u); // prepare for next iteration
  }

  return nextLayerUsers;
};

export const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("directReferrals", "username email level totalStakes")
      .populate("indirectReferrals", "username email level totalStakes");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let deposits = [];
    try {
      deposits = await Deposit.find({ user: req.userId }).sort({ createdAt: -1 });
    } catch (err) {
      console.warn("⚠️ Deposit fetch failed:", err.message);
    }

    res.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        level: user.level,
        walletBalance: user.walletBalance || 0,
        directCommissions: user.directCommissions || 0,
        layer1Commissions: user.layer1Commissions || 0,
        layer2Commissions: user.layer2Commissions || 0,
        layer3Commissions: user.layer3Commissions || 0,
        totalGroupStakes: user.totalGroupStakes || 0,
        totalStakes: user.totalStakes || 0,
      },
      referrals: {
        direct: user.directReferrals,
        indirect: user.indirectReferrals,
      },
      deposits,
    });
  } catch (error) {
    console.error("❌ Dashboard fetch error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
