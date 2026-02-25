const express = require('express');
const Organization = require('../models/Organization');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { checkPermission, requireRole } = require('../middleware/permissions');
const router = express.Router();

// Get my organization
router.get('/my', auth, async (req, res) => {
  try {
    const org = await Organization.findById(req.user.organizationId).populate('owner', 'name email');
    if (!org) return res.status(404).json({ error: 'Organization not found' });
    res.json(org);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update organization settings (org_admin only)
router.put('/settings', auth, checkPermission('settings', 'editOrg'), async (req, res) => {
  try {
    const { name, email, phone, website, address, branding, settings } = req.body;
    const org = await Organization.findById(req.user.organizationId);
    if (!org) return res.status(404).json({ error: 'Organization not found' });
    
    if (name) org.name = name;
    if (email) org.email = email;
    if (phone) org.phone = phone;
    if (website) org.website = website;
    if (address) org.address = { ...org.address, ...address };
    if (branding && org.limits.customBranding) org.branding = { ...org.branding, ...branding };
    if (settings) org.settings = { ...org.settings, ...settings };
    
    await org.save();
    res.json({ message: 'Organization updated', organization: org });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get organization users
router.get('/users', auth, checkPermission('users', 'viewAll'), async (req, res) => {
  try {
    const users = await User.find({ organizationId: req.user.organizationId })
      .select('-password')
      .sort('-createdAt');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Invite user to organization
router.post('/users/invite', auth, checkPermission('users', 'invite'), async (req, res) => {
  try {
    const { email, name, role, permissions } = req.body;
    const org = await Organization.findById(req.user.organizationId);
    
    // Check user limit
    if (org.usage.activeUsers >= org.limits.totalUsers) {
      return res.status(403).json({ error: 'User limit reached. Upgrade your plan.' });
    }
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Create temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    user = new User({
      email,
      name,
      password: tempPassword,
      organizationId: req.user.organizationId,
      role: role || 'staff',
      permissions: permissions || undefined, // will use role defaults if not specified
    });
    
    await user.save();
    org.usage.activeUsers += 1;
    await org.save();
    
    // TODO: Send email with temp password
    
    res.json({ 
      message: 'User invited successfully', 
      user: { ...user.toObject(), password: undefined },
      temporaryPassword: tempPassword 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user role/permissions
router.put('/users/:userId', auth, checkPermission('users', 'edit'), async (req, res) => {
  try {
    const { role, permissions, isActive } = req.body;
    const user = await User.findOne({ 
      _id: req.params.userId, 
      organizationId: req.user.organizationId 
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Can't edit super_admin or org_admin unless you are one
    if ((user.role === 'super_admin' || user.role === 'org_admin') && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Cannot modify admin users' });
    }
    
    if (role) user.role = role;
    if (permissions) user.permissions = { ...user.permissions, ...permissions };
    if (typeof isActive !== 'undefined') user.isActive = isActive;
    
    await user.save();
    res.json({ message: 'User updated', user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove user from organization
router.delete('/users/:userId', auth, checkPermission('users', 'delete'), async (req, res) => {
  try {
    const user = await User.findOne({ 
      _id: req.params.userId, 
      organizationId: req.user.organizationId 
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Can't delete owner
    const org = await Organization.findById(req.user.organizationId);
    if (user._id.equals(org.owner)) {
      return res.status(403).json({ error: 'Cannot delete organization owner' });
    }
    
    await user.deleteOne();
    org.usage.activeUsers -= 1;
    await org.save();
    
    res.json({ message: 'User removed from organization' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get subscription & billing info
router.get('/billing', auth, checkPermission('settings', 'viewBilling'), async (req, res) => {
  try {
    const org = await Organization.findById(req.user.organizationId);
    res.json({
      subscription: org.subscription,
      limits: org.limits,
      usage: org.usage,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
