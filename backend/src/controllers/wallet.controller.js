// controllers/wallet.controller.js
import User from "../models/User.js";
import Deposit from "../models/Deposit.js";
import Withdrawal from "../models/Withdraw.js";
import Stake from "../models/Stake.js";
import CommissionLedger from "../models/CommissionLedger.js";
import Trade from "../models/Trading.js";
import PDFDocument from "pdfkit";
import { format } from "date-fns";


export const downloadTransactionsPDF = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const [deps, wds, stakes, trades, commissions] = await Promise.all([
      Deposit.find({ user: req.userId }).lean(),
      Withdrawal.find({ user: req.userId }).lean(),
      Stake.find({ user: req.userId }).lean(),
      Trade.find({ user: req.userId }).lean(),
      CommissionLedger.find({ user: req.userId }).lean(),
    ]);

    // Create PDF
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=transaction_history.pdf");
    doc.pipe(res);

    // ===== Report Header =====
    doc.fontSize(24).fillColor("#166534").text("Transaction History Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).fillColor("black").text(`User: ${user.username} (${user.email})`);
    doc.fontSize(12).text(`Generated on: ${format(new Date(), "yyyy-MM-dd HH:mm")}`);
    doc.moveDown(1.5);

    // helper: table headers
    const drawTableHeader = (headers) => {
      doc.fontSize(12).fillColor("white").rect(40, doc.y, 515, 20).fill("#15803d");
      doc.fillColor("white");
      let x = 45;
      headers.forEach((h, i) => {
        doc.text(h, x, doc.y + 5, { continued: i < headers.length - 1 });
        x += 515 / headers.length;
      });
      doc.moveDown();
      doc.fillColor("black");
    };

    // helper: row with alt bg
    let rowToggle = false;
    const drawRow = (values) => {
      rowToggle = !rowToggle;
      if (rowToggle) {
        doc.rect(40, doc.y, 515, 18).fill("#f0fdf4").stroke();
        doc.fillColor("black");
      }
      let x = 45;
      values.forEach((v, i) => {
        doc.text(v, x, doc.y + 3, { continued: i < values.length - 1 });
        x += 515 / values.length;
      });
      doc.moveDown();
    };

    // ===== Deposits =====
    doc.fontSize(16).fillColor("#166534").text("Deposits", { underline: true });
    doc.moveDown(0.5);
    drawTableHeader(["Date", "Amount (USDT)", "Status", "TxHash"]);
    deps.forEach((d) => {
      drawRow([
        format(d.createdAt, "yyyy-MM-dd HH:mm"),
        d.amount.toFixed(2),
        d.status,
        d.txHash || "N/A",
      ]);
    });
    doc.moveDown(1.5);

    // ===== Withdrawals =====
    doc.fontSize(16).fillColor("#166534").text("Withdrawals", { underline: true });
    doc.moveDown(0.5);
    drawTableHeader(["Date", "Amount (USDT)", "Status", "To Address"]);
    wds.forEach((w) => {
      drawRow([
        format(w.createdAt, "yyyy-MM-dd HH:mm"),
        w.amount.toFixed(2),
        w.status,
        w.toAddress || "N/A",
      ]);
    });
    doc.moveDown(1.5);

    // ===== AI Trading =====
    doc.fontSize(16).fillColor("#166534").text("AI Trading", { underline: true });
    doc.moveDown(0.5);
    drawTableHeader(["Date", "Amount", "Daily Rate", "Total Earned", "Active"]);
    trades.forEach((t) => {
      drawRow([
        format(t.createdAt, "yyyy-MM-dd"),
        t.amount.toFixed(2),
        `${(t.dailyRate * 100).toFixed(2)}%`,
        t.totalEarned?.toFixed(2) || "0.00",
        t.active ? "Yes" : "No",
      ]);
    });
    doc.moveDown(1.5);

    // ===== Stakes =====
    doc.fontSize(16).fillColor("#166534").text("Stakes", { underline: true });
    doc.moveDown(0.5);
    drawTableHeader(["Date", "Amount", "Daily Rate", "Active"]);
    stakes.forEach((s) => {
      drawRow([
        format(s.createdAt, "yyyy-MM-dd"),
        s.amount.toFixed(2),
        `${(s.dailyRate * 100).toFixed(2)}%`,
        s.active ? "Yes" : "No",
      ]);
    });
    doc.moveDown(1.5);

    // ===== Commissions =====
    doc.fontSize(16).fillColor("#166534").text("Commissions", { underline: true });
    doc.moveDown(0.5);
    drawTableHeader(["Date", "Type", "Amount"]);
    commissions.forEach((c) => {
      drawRow([
        format(c.createdAt, "yyyy-MM-dd"),
        c.type,
        c.amount.toFixed(2),
      ]);
    });
    doc.moveDown(1.5);

    // ===== Summary =====
    const totalDeposits = deps.reduce((sum, d) => sum + d.amount, 0);
    const totalWithdrawals = wds.reduce((sum, w) => sum + w.amount, 0);
    const totalTrades = trades.reduce((sum, t) => sum + t.amount, 0);
    const totalStake = stakes.reduce((sum, s) => sum + s.amount, 0);
    const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0);

    doc.fontSize(18).fillColor("#166534").text("Summary", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("black");
    doc.text(`Total Deposits: ${totalDeposits.toFixed(2)} USDT`);
    doc.text(`Total Withdrawals: ${totalWithdrawals.toFixed(2)} USDT`);
    doc.text(`AI Trading Total: ${totalTrades.toFixed(2)} USDT`);
    doc.text(`Stakes Total: ${totalStake.toFixed(2)} USDT`);
    doc.text(`Commissions Total: ${totalCommissions.toFixed(2)} USDT`);

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).fillColor("gray").text(
      `This is a system-generated report. © ${new Date().getFullYear()}`,
      { align: "center" }
    );

    doc.end();
  } catch (err) {
    console.error("PDF Error:", err);
    res.status(500).json({ success: false, message: "Failed to generate PDF" });
  }
};


export const getWalletSummary = async (req, res) => {
  const user = await User.findById(req.userId);

  // 🔹 Step 1: Update AI Trading profits (daily credit)
  const trades = await Trade.find({ user: user._id, active: true });
  const now = new Date();

  for (const trade of trades) {
    const lastCalc = trade.lastProfitCalc || trade.createdAt;

    // full days since last profit credit
    const days = Math.floor((now - lastCalc) / (1000 * 60 * 60 * 24));
    if (days > 0) {
      const profit = trade.amount * trade.dailyRate * days;


      // update trade record
      trade.totalEarned += profit;
      trade.lastProfitCalc = now;
      await trade.save();
    }
  }

  await user.save();

  // 🔹 Step 2: Calculate stake totals
  const stakes = await Stake.find({ user: user._id, active: true });

  let stakeTotal = 0;             // total principal
  let stakeProfitPending = 0;     // profit for elapsed days not yet credited

  for (const s of stakes) {
    stakeTotal += s.amount;

    const lastPaid = s.lastDailyPaidAt || s.createdAt;
    const elapsedDays = Math.floor((now - new Date(lastPaid)) / (1000*60*60*24));

    if (elapsedDays > 0) {
      const profit = s.amount * s.dailyRate * elapsedDays;
      stakeProfitPending += profit;

      // Optionally credit wallet automatically:
      user.walletBalance += profit;
      s.lastDailyPaidAt = now;
      await s.save();
    }
  }


  // 🔹 Step 3: AI Trading totals
  const aiTradingTotal = trades.reduce((sum, t) => sum + t.amount, 0);
  const aiTradingProfit = trades.reduce((sum, t) => sum + t.totalEarned, 0);

  // 🔹 Step 4: Commissions
  const commissionsAgg = await CommissionLedger.aggregate([
    { $match: { user: user._id } },
    { $group: { _id: "$user", total: { $sum: "$amount" } } },
  ]);
  const commissionsTotal = commissionsAgg?.[0]?.total || 0;

  // 🔹 Step 5: TOTAL USDT
  const totalUSDT = +(
    user.walletBalance + stakeTotal + commissionsTotal + aiTradingTotal
  ).toFixed(2);

  // 🔹 Step 6: Bonus breakdown
  const buckets = await CommissionLedger.aggregate([
    { $match: { user: user._id } },
    { $group: { _id: "$type", total: { $sum: "$amount" } } },
  ]);
  const byType = Object.fromEntries(buckets.map((b) => [b._id, b.total]));

  res.json({
    success: true,
    header: {
      walletBalance: +user.walletBalance.toFixed(2),
      stakeTotal: +stakeTotal.toFixed(2),
      stakeProfit: +stakeProfitPending.toFixed(2),   // ✅ fixed here
      commissionsTotal: +commissionsTotal.toFixed(2),
      aiTradingTotal: +aiTradingTotal.toFixed(2),
      aiTradingProfit: +aiTradingProfit.toFixed(2),
      totalUSDT,
    },
    bonus: {
      l1_3: +(byType["INDIRECT_L1_3"] || 0).toFixed(2),
      l4_6: +(byType["INDIRECT_L4_6"] || 0).toFixed(2),
      leaderBonus: +(byType["LEADER_BONUS"] || 0).toFixed(2),
    },
  });
  
};


export const getMyTransactions = async (req, res) => {
  // deposits + withdrawals in one feed
  const [deps, wds] = await Promise.all([
    Deposit.find({ user: req.userId }).select("amount status createdAt txHash").lean(),
    Withdrawal.find({ user: req.userId }).select("amount status createdAt toAddress").lean()
  ]);
  res.json({ success:true, deposits: deps, withdrawals: wds });
};
