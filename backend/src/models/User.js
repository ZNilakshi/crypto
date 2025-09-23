import mongoose from 'mongoose';
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    match: [/^[a-zA-Z0-9_.@-]+$/, "Username can only contain letters, numbers, underscores, dots, @, and hyphens"]
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  securityPassword: {
    type: String,
    select: false 
  },
  cryptoAddress: {
    type: String,
    default: null,
  },
  walletType: {
    type: String,
    enum: ["TRC20", "BEP20"],
  },
  role: {
    type: String,
    enum: ['user', 'crypto_admin'],
    default: 'user'
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 6
  },
  directReferrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  walletBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalStakes: { type: Number, default: 0 },               // total active staked amount
  totalCommissionEarned: { type: Number, default: 0 },     // lifetime commissions

  emailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // helper flags for logic
  firstDepositDone: { type: Boolean, default: false },     // has this user made a first confirmed deposit?
  referralUnlocked: { type: Boolean, default: false },     // set true once walletBalance top-up >= 100 (one-time gate)
  // audit
  lastLevelUpdatedAt: { type: Date, default: null },
}, { timestamps: true });

// models/User.js
userSchema.virtual("activeDownlines", {
  ref: "User",
  localField: "_id",
  foreignField: "referredBy",
});

// Generate referral code before saving
userSchema.pre('save', function(next) {
  if (this.isNew && !this.referralCode) {
    this.referralCode = this.generateReferralCode();
  }
  this.updatedAt = Date.now();
  next();
});

// Generate unique referral code
userSchema.methods.generateReferralCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REF_${code}`;
};

// Verify security password
userSchema.methods.verifySecurityPassword = async function(password) {
  if (!this.securityPassword) {
    throw new Error('Security password not set');
  }
  return await bcrypt.compare(password, this.securityPassword);
};

userSchema.pre('save', async function(next) {
  if (this.isModified('securityPassword') && this.securityPassword) {
    this.securityPassword = await bcrypt.hash(this.securityPassword, 12);
    this.securityPasswordSet = true; // Mark as set
  }
  next();
});

// Static method to check username availability
userSchema.statics.isUsernameAvailable = async function(username) {
  const user = await this.findOne({ 
    username: username.toLowerCase(),
    isActive: true 
  });
  return !user;
};

export default mongoose.model('User', userSchema);