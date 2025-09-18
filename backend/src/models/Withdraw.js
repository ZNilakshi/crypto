import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 0 },
  fee: { type: Number, default: 0 },               // withdrawal fee

  totalDeduction: { type: Number, default: 0 },    // amount deducted from wallet

  toAddress: { type: String, required: true },
  walletType: {          
    type: String,
    enum: ["TRC20", "BEP20"],
    required: true
  },
  status: { type: String, enum: ["PENDING","APPROVED","REJECTED" ,"HOLD"], default: "PENDING" },
}, { timestamps: true });

export default mongoose.model("Withdrawal", withdrawalSchema);
