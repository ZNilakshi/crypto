import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import connectDB from "./src/db/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js"; // <-- expects export default
import depositRoutes from "./src/routes/deposit.routes.js";
import adminDepositRoutes from "./src/routes/admin/adminDeposit.routes.js";
import withdrawalRoutes from "./src/routes/withdraw.routes.js";
import stakeRoutes from "./src/routes/stake.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import walletRoutes from "./src/routes/wallet.route.js";
import tradingRoutes from "./src/routes/trading.route.js";
import adminRoutes from "./src/routes/admin.route.js"; // if you have admin routes
import systemRoutes from "./src/routes/system.routes.js"; // system routes

connectDB();
console.log('✅ Environment check:', {
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS ? '***' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV
  });
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);  
app.use("/api/wallet", walletRoutes);
app.use("/api/deposits", depositRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/stakes", stakeRoutes);
app.use('/api/dashboard', dashboardRoutes)
app.use("/api/admin/deposits", adminDepositRoutes);
app.use("/api/trading", tradingRoutes);
app.use("/api/admin", adminRoutes);    
app.use("/api/system", systemRoutes); // system routes
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
