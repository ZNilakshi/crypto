import User from "../models/User.js";
import Deposit from "../models/Deposit.js";
import Withdraw from "../models/Withdraw.js";
import Trading from "../models/Trading.js";   // <-- add this
import Stake from "../models/Stake.js";       // <-- add this

// ✅ Get all users (for admin dashboard)
export const getAllUsers = async (req, res) => {
    try {
      const users = await User.find().select("-password"); // exclude password
      res.json({ items: users });
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };

// ✅ Get user details + referrals
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .select("-securityPassword -__v")
      .populate("referredBy", "username email");

    if (!user) {
      return res.status(404).json({ message: "❌ User not found" });
    }

    // Build referral tree (up to 3 layers for example)
    const referralsByLayer = [];
    let currentLayer = [user._id];

    for (let level = 1; level <= 3; level++) {
      const layerUsers = await User.find({ referredBy: { $in: currentLayer } })
        .select("username email referralCode referredBy walletBalance createdAt directReferrals level")
        .populate("referredBy", "username");

      if (layerUsers.length === 0) break;

      referralsByLayer.push({
        layer: level,
        users: layerUsers.map(u => ({
          _id: u._id,
          username: u.username,
          referrer: u.referredBy?.username || "N/A",
          level: u.level,
          directRefs: u.directReferrals?.length || 0,
          wallet: u.walletBalance || 0,
          joined: u.createdAt,
        }))
      });

      currentLayer = layerUsers.map(u => u._id);
    }

    res.json({ user, referrals: referralsByLayer });
  } catch (err) {
    console.error("❌ Error fetching user details:", err);
    res.status(500).json({ message: "❌ Failed to fetch user details" });
  }
};



// ✅ Get all deposits
export const getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find().populate("user", "username email");
    res.json({ deposits });
  } catch (err) {
    console.error("❌ Error fetching deposits:", err);
    res.status(500).json({ message: "❌ Failed to fetch deposits" });
  }
};

// ✅ Get all withdrawals
export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().populate("user", "username email");
    res.json({ withdrawals });
  } catch (err) {
    console.error("❌ Error fetching withdrawals:", err);
    res.status(500).json({ message: "❌ Failed to fetch withdrawals" });
  }
};

// ✅ Update user role (admin can change roles)
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "❌ User not found" });

    user.role = role;
    await user.save();

    res.json({ message: "✅ User role updated successfully", user });
  } catch (err) {
    console.error("❌ Error updating user role:", err);
    res.status(500).json({ message: "❌ Failed to update user role" });
  }
};

// ✅ Delete a user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "❌ User not found" });

    res.json({ message: "✅ User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ message: "❌ Failed to delete user" });
  }
};

export const listAllUsers = async (req, res) => {
  try {
    const users = await User.find().lean();

    const results = await Promise.all(
      users.map(async (u) => {
        const [tradings, stakes, deposits, withdrawals] = await Promise.all([
          Trading.aggregate([
            { $match: { user: u._id, active: true } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ]),
          Stake.aggregate([
            { $match: { user: u._id, active: true } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ]),
          Deposit.aggregate([
            { $match: { user: u._id, status: "APPROVED" } },  // match approved deposits
            { $group: { 
                _id: null, 
                total: { $sum: "$amount" }, 
                count: { $sum: 1 } 
            } }
          ]),
          Withdraw.aggregate([
            { $match: { user: u._id, status: "APPROVED" } },  // match approved withdrawals
            { $group: { 
                _id: null, 
                total: { $sum: "$amount" }, 
                count: { $sum: 1 } 
            } }
          ])
        ]);

        return {
          _id: u._id,
          username: u.username,
          walletBalance: u.walletBalance || 0,
          totalTrading: tradings[0]?.total || 0,
          totalStakes: stakes[0]?.total || 0,
          totalDeposits: deposits[0]?.total || 0,
          depositsCount: deposits[0]?.count || 0,
          totalWithdrawals: withdrawals[0]?.total || 0,
          withdrawalsCount: withdrawals[0]?.count || 0,
        };
      })
    );

    res.json({ success: true, items: results });
  } catch (err) {
    console.error("Error fetching admin users:", err);
    res.status(500).json({ success: false, message: "Failed to load users" });
  }
};



async function getReferralsRecursive(userId, layer = 1, maxLayers = 6) {
  if (layer > maxLayers) return [];

  const refs = await User.find({ referredBy: userId })
    .select("username email level totalStakes createdAt directReferrals totalCommissionEarned referredBy walletBalance")
    .populate({ path: "referredBy", select: "username email" });

  let result = refs.map(r => ({
    _id: r._id,
    username: r.username,
    email: r.email,
    level: r.level,
    totalStakes: r.totalStakes || 0,
    totalCommissionEarned: r.totalCommissionEarned || 0,
    directReferrals: r.directReferrals?.length || 0,
    joinDate: r.createdAt,
    walletBalance: r.walletBalance || 0,
    layer,
    referredByUsername: r.referredBy?.username || "—",
    referredByEmail: r.referredBy?.email || "—",
  }));

  for (const r of refs) {
    const children = await getReferralsRecursive(r._id, layer + 1, maxLayers);
    result = result.concat(children);
  }

  return result;
}

// ✅ Get referral details for all users
export const getAllUserReferrals = async (req, res) => {
  try {
    const users = await User.find().select("_id username email walletBalance createdAt");

    const results = await Promise.all(
      users.map(async (u) => {
        const referrals = await getReferralsRecursive(u._id, 1, 6);
        return {
          _id: u._id,
          username: u.username,
          email: u.email,
          walletBalance: u.walletBalance,
          joinDate: u.createdAt,
          referralCount: referrals.length,
          referrals
        };
      })
    );

    res.json({ success: true, items: results });
  } catch (err) {
    console.error("❌ Error fetching user referrals:", err);
    res.status(500).json({ success: false, message: "Failed to load referrals" });
  }
};
