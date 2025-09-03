import Deposit from "../../models/Deposit.js";
import User from "../../models/User.js";

//  Get all deposits (admin view)
export const getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find().populate("user", "username email");
    res.json({ success: true, deposits });
  } catch (error) {
    console.error("❌ Admin fetch deposits error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//  Approve / Reject deposit
export const updateDepositStatus = async (req, res) => {
  try {
    const { depositId } = req.params;
    const { status } = req.body; // "confirmed" or "rejected"

    if (!["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return res.status(404).json({ success: false, message: "Deposit not found" });
    }

    deposit.status = status;
    await deposit.save();

    //  If confirmed, update user's balance
    if (status === "confirmed") {
      const user = await User.findById(deposit.user);
      if (user) {
        user.commissionBalance += deposit.amount; // or wallet balance if you track separately
        await user.save();
      }
    }

    res.json({ success: true, message: `Deposit ${status}`, deposit });
  } catch (error) {
    console.error("❌ Update deposit status error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
