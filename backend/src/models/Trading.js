import mongoose from "mongoose";

const tradingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 0 },
  active: { type: Boolean, default: true },
  dailyRate: { type: Number, default: 0.012 },      // 1.2% daily
  lockedUntil: { type: Date, required: true },     // 24h lock
  totalEarned: { type: Number, default: 0 },       // profit accumulated
  lastProfitCalc: { type: Date, default: null },   // last time profit was calculated
}, { timestamps: true });

export default mongoose.model("Trading", tradingSchema);
