import admin from "../config/firebase.js";
import User from "../models/User.js";

// Get email from username
export const getEmailFromUsername = async (req, res) => {
    try {
      const { username } = req.body;
      const user = await User.findOne({ username: username.toLowerCase() });
  
      if (!user) {
        return res.status(404).json({ message: "❌ User not found" });
      }
  
      res.json({ email: user.email });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "❌ Server error" });
    }
  };
  export const registerUser = async (req, res) => {
    try {
      const { fullName, username, email, phoneNumber, referralCode, firebaseUid } = req.body;
  
      // Check username availability
      const usernameTaken = await User.findOne({ username: username});
      if (usernameTaken) {
        return res.status(400).json({ message: "❌ Username already taken" });
      }
  
      // Find referrer by referral code
      let referrer = null;
      if (referralCode && referralCode.trim() !== "") {
        referrer = await User.findOne({ referralCode: referralCode.trim() });
        if (!referrer) {
          return res.status(400).json({ message: "❌ Invalid referral code" });
        }
      }
  
      // Create new user
      const newUser = new User({
        firebaseUid,
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.toLowerCase().trim(),
        phoneNumber: phoneNumber ? phoneNumber.trim() : "",
        referredBy: referrer ? referrer._id : null,
        level: 0, 
        walletBalance: 0,
      stakingBalance: 0,
      commissionBalance: 0
      
      });
  
      await newUser.save();
  
      // Update referrer's direct referrals and commission hierarchy
      if (referrer) {
        referrer.directReferrals.push(newUser._id);
        await referrer.save();
        
           }
 
      res.status(201).json({ 
        message: "✅ User registered successfully", 
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          referralCode: newUser.referralCode
        }
      });
    } catch (err) {
      console.error("❌ Registration error:", err);
      
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({ 
          message: `❌ ${field} already exists` 
        });
      }
      
      res.status(500).json({ message: "❌ Server Error during registration" });
    }
  };
  
export const verifyEmail = async (req, res) => {
  try {
    const { idToken } = req.body;
    const decoded = await admin.auth().verifyIdToken(idToken);

    if (!decoded.email_verified) {
      return res.status(400).json({ message: "❌ Email not verified" });
    }

    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) return res.status(404).json({ message: "❌ User not found" });

    user.emailVerified = true;
    await user.save();

    res.json({ message: "✅ Email verified successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Server Error" });
  }
};

export const checkUsername = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "❌ Username is required" });
    }

    // 🔹 Keep original case
    const user = await User.findOne({ username });

    return res.json({ available: !user });
  } catch (err) {
    console.error("❌ Error checking username:", err);
    res.status(500).json({ message: "❌ Server error" });
  }
};

// Get user role by Firebase UID
export const getRoleByUid = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) return res.status(400).json({ message: "❌ UID is required" });

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return res.status(404).json({ message: "❌ User not found" });

    res.json({ role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Server Error" });
  }
};
