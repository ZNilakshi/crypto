import mongoose from 'mongoose';

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
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
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
    default: "TRC20",
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
  directReferrals: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }],
  indirectReferrals: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }],

 // Commission tracking
 directCommissions: { type: Number, default: 0 },
 layer1_3Commissions: { type: Number, default: 0 }, // ✅ covers layers 2–3
 totalGroupStakes: { type: Number, default: 0 },

 // Stakes (top-up balance)
 totalStakes: { type: Number, default: 0 },

 // Level (0–3 only)
 level: { type: Number, enum: [0, 1, 2, 3], default: 0 },

 // Wallet balance
 walletBalance: { type: Number, default: 0 },

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
  }
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

};// Add this method to your userSchema
userSchema.methods.verifySecurityPassword = async function(password) {
  if (!this.securityPassword) {
    throw new Error('Security password not set');
  }
  
  return await bcrypt.compare(password, this.securityPassword);
};

// Also add this to your imports at the to
// Static method to check username availability
userSchema.statics.isUsernameAvailable = async function(username) {
  const user = await this.findOne({ 
    username: username.toLowerCase(),
    isActive: true 
  });
  return !user;
};

export default mongoose.model('User', userSchema);