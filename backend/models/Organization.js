const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  logo: String,
  
  // Contact
  email: { type: String, required: true },
  phone: String,
  website: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: { type: String, default: 'India' },
    pincode: String,
  },
  
  // Subscription & Billing (SaaS)
  subscription: {
    plan: { type: String, enum: ['free', 'starter', 'pro', 'enterprise'], default: 'free' },
    status: { type: String, enum: ['trial', 'active', 'suspended', 'cancelled'], default: 'trial' },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    autoRenew: { type: Boolean, default: true },
  },
  
  // Plan limits
  limits: {
    tournaments: { type: Number, default: 2 }, // free: 2, starter: 10, pro: 50, enterprise: unlimited
    usersPerTournament: { type: Number, default: 3 }, // free: 3, starter: 10, pro: unlimited
    totalUsers: { type: Number, default: 5 },
    storageGB: { type: Number, default: 1 }, // for payment screenshots
    customBranding: { type: Boolean, default: false },
    whiteLabel: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
  },
  
  // Usage tracking
  usage: {
    tournamentsCreated: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 1 },
    storageUsedMB: { type: Number, default: 0 },
  },
  
  // Branding (Pro+)
  branding: {
    primaryColor: { type: String, default: '#00d4ff' },
    secondaryColor: { type: String, default: '#00e676' },
    customDomain: String, // enterprise only
    emailFooter: String,
    smsTemplate: String,
  },
  
  // Settings
  settings: {
    defaultCurrency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    autoApproveRegistrations: { type: Boolean, default: false },
    requirePaymentProof: { type: Boolean, default: true },
    enablePublicBrackets: { type: Boolean, default: true },
    enableLiveScoring: { type: Boolean, default: true },
  },
  
  // Owner
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Status
  isActive: { type: Boolean, default: true },
  
}, { timestamps: true });

// Auto-generate slug from name
organizationSchema.pre('save', async function(next) {
  if (!this.isModified('name')) return next();
  let baseSlug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let slug = baseSlug;
  let counter = 1;
  
  while (await mongoose.model('Organization').findOne({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${counter++}`;
  }
  
  this.slug = slug;
  next();
});

module.exports = mongoose.model('Organization', organizationSchema);
