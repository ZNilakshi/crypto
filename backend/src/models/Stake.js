// models/Stake.js
import mongoose from "mongoose";

const stakeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 0 },
  active: { type: Boolean, default: true },

  // new fields
  lockDays: { type: Number, required: true }, // 7, 21, 30
  dailyRate: { type: Number, required: true }, // 0.015, 0.016, 0.017
  lockedUntil: { type: Date, required: true },

  lastDailyPaidAt: { type: Date, default: null }, // payout tracking
}, { timestamps: true });

export default mongoose.model("Stake", stakeSchema);
