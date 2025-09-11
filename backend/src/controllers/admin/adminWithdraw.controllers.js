import Withdraw from "../../models/Withdraw.js";
import User from "../../models/User.js";

export const getAllWithdraws = async (req, res) => {
  try {
    const withdraws = await Withdraw.find().populate("user", "username email");
    res.json(withdraws);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateWithdrawStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const withdraw = await Withdraw.findById(id).populate("user");
    if (!withdraw) return res.status(404).json({ message: "Withdraw not found" });

    if (status === "approved") {
      // Deduct balance from user
      withdraw.user.walletBalance -= withdraw.amount;
      await withdraw.user.save();
    }

    withdraw.status = status;
    withdraw.adminNote = adminNote;
    withdraw.processedAt = new Date();
    await withdraw.save();

    res.json({ message: `Withdraw ${status}`, withdraw });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
