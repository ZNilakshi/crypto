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

// ✅ Get user details by ID
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-securityPassword -__v");

    if (!user) {
      return res.status(404).json({ message: "❌ User not found" });
    }

    res.json({ user });
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


