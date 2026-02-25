const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ═══════════════════════════════════════════════════════════
// ORGANIZATION SIGNUP (First user becomes Org Admin + creates org)
// ═══════════════════════════════════════════════════════════
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, phone, organizationName } = req.body;

    // Validation
    if (!email || !password || !name || !organizationName) {
      return res.status(400).json({ error: 'Email, password, name, and organization name required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create organization first
    const org = new Organization({
      name: organizationName,
      email: email,
      phone: phone,
      subscription: {
        plan: 'free', // Start with free plan
        status: 'trial',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
      },
      limits: {
        tournaments: 2,
        usersPerTournament: 3,
        totalUsers: 5,
        storageGB: 1,
        customBranding: false,
        whiteLabel: false,
        apiAccess: false,
        advancedAnalytics: false,
      },
      usage: {
        tournamentsCreated: 0,
        activeUsers: 1,
        storageUsedMB: 0,
      },
      settings: {
        defaultCurrency: 'INR',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        autoApproveRegistrations: false,
        requirePaymentProof: true,
        enablePublicBrackets: true,
        enableLiveScoring: true,
      },
    });

    // Create user as org_admin
    const user = new User({
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save hook
      name,
      phone,
      organizationId: org._id,
      role: 'org_admin', // First user is always org admin
      isActive: true,
      isVerified: true, // Auto-verify first user
    });

    await user.save();
    
    // Set org owner
    org.owner = user._id;
    await org.save();

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        organizationId: org._id 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Organization created successfully',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: org._id,
        organizationName: org.name,
        permissions: user.permissions,
      },
      organization: {
        _id: org._id,
        name: org.name,
        slug: org.slug,
        subscription: org.subscription,
      },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// LOGIN (Users login to their organization)
// ═══════════════════════════════════════════════════════════
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is disabled. Contact your administrator.' });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get organization
    const org = await Organization.findById(user.organizationId);
    if (!org) {
      return res.status(403).json({ error: 'Organization not found' });
    }

    // Check if organization is active
    if (!org.isActive) {
      return res.status(403).json({ error: 'Organization is suspended. Contact support.' });
    }

    // Check subscription status
    if (org.subscription.status === 'suspended') {
      return res.status(403).json({ error: 'Subscription suspended. Please renew to continue.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        organizationId: org._id,
        permissions: user.permissions,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        organizationId: org._id,
        organizationName: org.name,
        permissions: user.permissions,
        avatar: user.avatar,
      },
      organization: {
        _id: org._id,
        name: org.name,
        slug: org.slug,
        subscription: org.subscription,
        limits: org.limits,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// VERIFY TOKEN (Check if user is still authenticated)
// ═══════════════════════════════════════════════════════════
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token or user disabled' });
    }

    const org = await Organization.findById(user.organizationId);
    if (!org || !org.isActive) {
      return res.status(403).json({ error: 'Organization not found or suspended' });
    }

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        organizationId: org._id,
        organizationName: org.name,
        permissions: user.permissions,
        avatar: user.avatar,
      },
      organization: {
        _id: org._id,
        name: org.name,
        slug: org.slug,
        subscription: org.subscription,
        limits: org.limits,
      },
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ═══════════════════════════════════════════════════════════
// FORGOT PASSWORD (Request reset token)
// ═══════════════════════════════════════════════════════════
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If email exists, reset link will be sent' });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // TODO: Send email with reset link
    // For now, return token in response (remove in production)
    res.json({ 
      message: 'Reset link sent to email',
      resetToken, // REMOVE THIS IN PRODUCTION
      resetLink: `http://localhost:3000/reset-password/${resetToken}` // REMOVE THIS IN PRODUCTION
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// RESET PASSWORD (Using token from email)
// ═══════════════════════════════════════════════════════════
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    user.password = newPassword; // Will be hashed by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. Please login.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// CHANGE PASSWORD (Authenticated user)
// ═══════════════════════════════════════════════════════════
const auth = require('../middleware/auth');

router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    const isValid = await user.comparePassword(currentPassword);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword; // Will be hashed
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// UPDATE PROFILE (Authenticated user)
// ═══════════════════════════════════════════════════════════
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    
    await user.save();

    res.json({
      message: 'Profile updated',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// FIRST-TIME PASSWORD SETUP (For invited users)
// ═══════════════════════════════════════════════════════════
router.post('/setup-password', async (req, res) => {
  try {
    const { email, temporaryPassword, newPassword } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check temp password
    const isValid = await user.comparePassword(temporaryPassword);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid temporary password' });
    }

    // Set new password
    user.password = newPassword;
    user.isVerified = true;
    await user.save();

    // Generate token and log them in
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        organizationId: user.organizationId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Password set successfully',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
