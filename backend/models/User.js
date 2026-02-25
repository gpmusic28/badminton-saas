const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  
  // SaaS Multi-tenant
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  
  // Role-based access control
  role: { 
    type: String, 
    enum: ['super_admin', 'org_admin', 'organizer', 'umpire', 'staff', 'player'], 
    default: 'organizer' 
  },
  
  // Granular permissions
  permissions: {
    tournaments: {
      create: { type: Boolean, default: true },
      edit: { type: Boolean, default: true },
      delete: { type: Boolean, default: false },
      viewAll: { type: Boolean, default: true },
    },
    registrations: {
      approve: { type: Boolean, default: true },
      reject: { type: Boolean, default: true },
      viewPayments: { type: Boolean, default: true },
      editPayments: { type: Boolean, default: false },
    },
    brackets: {
      generate: { type: Boolean, default: true },
      edit: { type: Boolean, default: true },
      viewAll: { type: Boolean, default: true },
    },
    matches: {
      schedule: { type: Boolean, default: true },
      score: { type: Boolean, default: false },
      editScores: { type: Boolean, default: false },
      viewLive: { type: Boolean, default: true },
    },
    users: {
      invite: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      viewAll: { type: Boolean, default: false },
    },
    settings: {
      editOrg: { type: Boolean, default: false },
      viewBilling: { type: Boolean, default: false },
      manageBilling: { type: Boolean, default: false },
    },
  },
  
  // Profile
  avatar: String,
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  
  // Email verification
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Set default permissions based on role
userSchema.pre('save', function(next) {
  if (!this.isModified('role')) return next();
  
  // Reset all permissions first
  const allFalse = {
    tournaments: { create: false, edit: false, delete: false, viewAll: false },
    registrations: { approve: false, reject: false, viewPayments: false, editPayments: false },
    brackets: { generate: false, edit: false, viewAll: false },
    matches: { schedule: false, score: false, editScores: false, viewLive: false },
    users: { invite: false, edit: false, delete: false, viewAll: false },
    settings: { editOrg: false, viewBilling: false, manageBilling: false },
  };
  
  if (this.role === 'super_admin') {
    // Super admin - all permissions
    this.permissions = {
      tournaments: { create: true, edit: true, delete: true, viewAll: true },
      registrations: { approve: true, reject: true, viewPayments: true, editPayments: true },
      brackets: { generate: true, edit: true, viewAll: true },
      matches: { schedule: true, score: true, editScores: true, viewLive: true },
      users: { invite: true, edit: true, delete: true, viewAll: true },
      settings: { editOrg: true, viewBilling: true, manageBilling: true },
    };
  } else if (this.role === 'org_admin') {
    // Org admin - everything except super admin functions
    this.permissions = {
      tournaments: { create: true, edit: true, delete: true, viewAll: true },
      registrations: { approve: true, reject: true, viewPayments: true, editPayments: true },
      brackets: { generate: true, edit: true, viewAll: true },
      matches: { schedule: true, score: false, editScores: true, viewLive: true },
      users: { invite: true, edit: true, delete: true, viewAll: true },
      settings: { editOrg: true, viewBilling: true, manageBilling: true },
    };
  } else if (this.role === 'organizer') {
    // Organizer - standard tournament management
    this.permissions = {
      tournaments: { create: true, edit: true, delete: false, viewAll: true },
      registrations: { approve: true, reject: true, viewPayments: true, editPayments: false },
      brackets: { generate: true, edit: true, viewAll: true },
      matches: { schedule: true, score: false, editScores: false, viewLive: true },
      users: { invite: false, edit: false, delete: false, viewAll: false },
      settings: { editOrg: false, viewBilling: false, manageBilling: false },
    };
  } else if (this.role === 'umpire') {
    // Umpire - scoring only
    this.permissions = {
      tournaments: { create: false, edit: false, delete: false, viewAll: true },
      registrations: { approve: false, reject: false, viewPayments: false, editPayments: false },
      brackets: { generate: false, edit: false, viewAll: true },
      matches: { schedule: false, score: true, editScores: true, viewLive: true },
      users: { invite: false, edit: false, delete: false, viewAll: false },
      settings: { editOrg: false, viewBilling: false, manageBilling: false },
    };
  } else if (this.role === 'staff') {
    // Staff - view and schedule
    this.permissions = {
      tournaments: { create: false, edit: false, delete: false, viewAll: true },
      registrations: { approve: true, reject: false, viewPayments: true, editPayments: false },
      brackets: { generate: false, edit: false, viewAll: true },
      matches: { schedule: true, score: false, editScores: false, viewLive: true },
      users: { invite: false, edit: false, delete: false, viewAll: false },
      settings: { editOrg: false, viewBilling: false, manageBilling: false },
    };
  } else {
    // Player - view only
    this.permissions = allFalse;
    this.permissions.tournaments.viewAll = true;
    this.permissions.brackets.viewAll = true;
    this.permissions.matches.viewLive = true;
  }
  
  next();
});

module.exports = mongoose.model('User', userSchema);
