const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const isMongoReady = () => mongoose.connection.readyState === 1;

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'eslam_portfolio_super_secret_jwt_key_2026_x987!', {
    expiresIn: '7d'
  });
};

// @route   POST /api/admin/login
// @desc    Admin login & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please enter username and password' });
    }

    const defaultAdminUsername = process.env.ADMIN_USERNAME || 'admin';
    const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (isMongoReady()) {
      const user = await User.findOne({ username });
      if (user && (await user.matchPassword(password))) {
        return res.json({
          success: true,
          token: generateToken(user._id),
          user: { id: user._id, username: user.username, role: user.role }
        });
      }
    }

    // Fallback authentication check if MongoDB is not running or user isn't in DB yet
    if (username === defaultAdminUsername && password === defaultAdminPassword) {
      return res.json({
        success: true,
        token: generateToken('fallback-admin-id-123'),
        user: { id: 'fallback-admin-id-123', username: defaultAdminUsername, role: 'admin' }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid username or password (اسم المستخدم أو كلمة المرور غير صحيحة)'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @route   GET /api/admin/me
// @desc    Get current admin user details
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user || { id: 'admin', username: process.env.ADMIN_USERNAME || 'admin', role: 'admin' }
  });
});

module.exports = router;
