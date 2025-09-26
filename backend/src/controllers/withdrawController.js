// controllers/withdrawal.controller.js
import Withdrawal from "../models/Withdraw.js";
import User from "../models/User.js";
import { sendWithdrawalStatusEmail } from '../utils/emailService.js';

export const requestWithdraw = async (req, res) => {
  try {
    const { amount, securityPassword } = req.body;
    const user = await User.findById(req.userId).select("+securityPassword cryptoAddress walletType walletBalance");
    if (!user.cryptoAddress) return res.status(400).json({ message: "No crypto address set" });
    if (!securityPassword) return res.status(400).json({ message: "Security password required" });
    const ok = await user.verifySecurityPassword(securityPassword);
    if (!ok) return res.status(400).json({ message: "Security password incorrect" });

    if (amount <= 0 || amount > user.walletBalance) return res.status(400).json({ message: "Invalid amount" });
    const feePercent = 0.05;
    const fee = amount * feePercent;
    const totalDeduction = amount + fee;   // user pays this much
    
    if (totalDeduction > user.walletBalance) {
      return res.status(400).json({ message: "Insufficient balance including withdrawal fee" });
    }
    
    // hold funds
    user.walletBalance -= totalDeduction;   // ✅ deduct full amount including fee
    await user.save();
    
    const w = await Withdrawal.create({
      user: user._id,
      amount,
      fee,                   // store fee separately
      totalDeduction,        // useful for admin view
      toAddress: user.cryptoAddress,
      walletType: user.walletType,
    });
    

    res.status(201).json({ success:true, withdrawal: w });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, message: "Withdraw request failed" });
  }
};

export const listMyWithdrawals = async (req, res) => {
  const items = await Withdrawal.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
  res.json({ success:true, items });
};

// ADMIN
export const adminListWithdrawals = async (req, res) => {
  const items = await Withdrawal.find().populate("user","username email walletBalance walletType").sort({ createdAt: -1 }).lean();
  res.json({ success:true, items });
};




export const adminApproveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✅ Attempting to approve withdrawal: ${id}`);

    const withdrawal = await Withdrawal.findById(id).populate('user', 'username email walletBalance');
    
    if (!withdrawal) {
      console.log('❌ Withdrawal not found');
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    
    console.log(`📋 Current withdrawal status: ${withdrawal.status}`);
    console.log(`👤 User: ${withdrawal.user?.username}, Balance: ${withdrawal.user?.walletBalance}`);

    // Allow both PENDING and HOLD statuses to be approved
    if (!["PENDING", "HOLD"].includes(withdrawal.status)) {
      console.log('❌ Withdrawal already processed:', withdrawal.status);
      return res.status(400).json({ 
        success: false, 
        message: `Withdrawal already ${withdrawal.status.toLowerCase()}` 
      });
    }

    const user = await User.findById(withdrawal.user._id);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: "User not found" });
    }


    // Update withdrawal status
    withdrawal.status = "APPROVED";
    await withdrawal.save();
    console.log(`✅ Withdrawal approved successfully`);

    // Send approval email
    sendWithdrawalStatusEmail(
      withdrawal.user.email,
      withdrawal.user.username,
      'APPROVED',
      {
        amount: withdrawal.amount,
        walletType: withdrawal.walletType,
        toAddress: withdrawal.toAddress,
        fee: withdrawal.fee,
        createdAt: withdrawal.createdAt
      }
    ).catch(error => {
      console.error('Failed to send approval email:', error);
    });

    res.json({ success: true, message: "Withdrawal approved" });
  } catch (error) {
    console.error('❌ Approval failed:', error);
    res.status(500).json({ success: false, message: "Approval failed" });
  }
};

export const adminRejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log(`❌ Attempting to reject withdrawal: ${id}`);
    console.log(`📝 Reason:`, reason);

    const withdrawal = await Withdrawal.findById(id).populate('user', 'username email');
    if (!withdrawal) {
      console.log('❌ Withdrawal not found');
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    console.log(`📋 Current withdrawal status: ${withdrawal.status}`);

    // Allow both PENDING and HOLD statuses to be rejected
    if (!["PENDING", "HOLD"].includes(withdrawal.status)) {
      console.log('❌ Withdrawal already processed:', withdrawal.status);
      return res.status(400).json({ 
        success: false, 
        message: `Withdrawal already ${withdrawal.status.toLowerCase()}` 
      });
    }
    const user = await User.findById(withdrawal.user._id);
    if (user) {
      user.walletBalance += withdrawal.totalDeduction; 
      await user.save();
    }
    withdrawal.status = "REJECTED";
    withdrawal.reason = reason || "No reason provided";
    await withdrawal.save();
    console.log(`✅ Withdrawal rejected successfully`);

    // Send rejection email
    sendWithdrawalStatusEmail(
      withdrawal.user.email,
      withdrawal.user.username,
      'REJECTED',
      {
        amount: withdrawal.amount,
        walletType: withdrawal.walletType,
        toAddress: withdrawal.toAddress,
        createdAt: withdrawal.createdAt
      },
      reason
    ).catch(error => {
      console.error('Failed to send rejection email:', error);
    });

    res.json({ success: true, message: "Withdrawal rejected" });
  } catch (error) {
    console.error('❌ Rejection failed:', error);
    res.status(500).json({ success: false, message: "Rejection failed" });
  }
};

export const adminHoldWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log(`⏳ Attempting to put withdrawal on hold: ${id}`);
    console.log(`📝 Reason:`, reason);

    const withdrawal = await Withdrawal.findById(id).populate('user', 'username email');
    if (!withdrawal) {
      console.log('❌ Withdrawal not found');
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    console.log(`📋 Current withdrawal status: ${withdrawal.status}`);

    // Only allow PENDING withdrawals to be put on hold
    if (withdrawal.status !== "PENDING") {
      console.log('❌ Cannot put withdrawal on hold:', withdrawal.status);
      return res.status(400).json({ 
        success: false, 
        message: `Cannot put ${withdrawal.status.toLowerCase()} withdrawal on hold` 
      });
    }

    withdrawal.status = "HOLD";
    withdrawal.reason = reason || "Under review";
    await withdrawal.save();
    console.log(`✅ Withdrawal put on hold successfully`);

    // Send hold email
    sendWithdrawalStatusEmail(
      withdrawal.user.email,
      withdrawal.user.username,
      'HOLD',
      {
        amount: withdrawal.amount,
        walletType: withdrawal.walletType,
        toAddress: withdrawal.toAddress,
        createdAt: withdrawal.createdAt
      },
      reason
    ).catch(error => {
      console.error('Failed to send hold email:', error);
    });

    res.json({ success: true, message: "Withdrawal put on hold" });
  } catch (error) {
    console.error('❌ Hold operation failed:', error);
    res.status(500).json({ success: false, message: "Hold operation failed" });
  }
};