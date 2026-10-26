const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const isMongoReady = () => mongoose.connection.readyState === 1;

const getJwtSecret = () => process.env.JWT_SECRET || 'dev_jwt_secret_configure_in_env_for_production';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: '7d'
  });
};

const handleLogin = async (req, res) => {
  try {
    const rawIdentifier = (req.body.username || req.body.email || '').trim();
    const password = (req.body.password || '').trim();

    if (!rawIdentifier || !password) {
      return res.status(400).json({ success: false, message: 'Please enter username/email and password' });
    }

    const envAdminEmail = (process.env.ADMIN_EMAIL || 'eslam9076460@gmail.com').toLowerCase().trim();
    const envAdminUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase().trim();
    const lowerIdentifier = rawIdentifier.toLowerCase();

    // 1. Try MongoDB authentication if connected
    if (isMongoReady()) {
      try {
        const user = await User.findOne({
          $or: [
            { email: lowerIdentifier },
            { username: rawIdentifier }
          ]
        }).maxTimeMS(3000);

        if (user && (await user.matchPassword(password))) {
          return res.json({
            success: true,
            token: generateToken(user._id),
            user: { id: user._id, username: user.username, email: user.email, role: user.role }
          });
        }
      } catch (dbErr) {
        console.warn('[Mongo Auth Notice, falling back to ENV verification]:', dbErr.message);
      }
    }

    // 2. Fallback authentication using secure ADMIN_PASSWORD_HASH or ADMIN_PASSWORD from environment variables
    const isIdentifierValid = lowerIdentifier === envAdminEmail || lowerIdentifier === envAdminUsername || lowerIdentifier === 'admin';

    if (isIdentifierValid) {
      if (process.env.ADMIN_PASSWORD_HASH) {
        const isHashMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
        if (isHashMatch) {
          return res.json({
            success: true,
            token: generateToken('fallback-admin-id-123'),
            user: { id: 'fallback-admin-id-123', username: process.env.ADMIN_USERNAME || 'admin', email: envAdminEmail, role: 'admin' }
          });
        }
      } else if (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
        return res.json({
          success: true,
          token: generateToken('fallback-admin-id-123'),
          user: { id: 'fallback-admin-id-123', username: process.env.ADMIN_USERNAME || 'admin', email: envAdminEmail, role: 'admin' }
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email/username or password (اسم المستخدم أو كلمة المرور غير صحيحة)'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

router.post('/login', handleLogin);
router.post('/admin/login', handleLogin);

// GET /api/auth/me or /api/admin/me
const handleMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user || { id: 'admin', username: process.env.ADMIN_USERNAME || 'admin', role: 'admin' }
  });
};

router.get('/me', protect, handleMe);
router.get('/admin/me', protect, handleMe);

// POST /change-password
const handleChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    if (isMongoReady()) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect (كلمة المرور الحالية غير صحيحة)' });
      }

      user.password = newPassword;
      await user.save();
      return res.json({ success: true, message: 'Password updated successfully (تم تغيير كلمة المرور بنجاح)' });
    }

    return res.json({ success: true, message: 'Password change requested' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ success: false, message: 'Server error changing password' });
  }
};

router.post('/change-password', protect, handleChangePassword);
router.post('/admin/change-password', protect, handleChangePassword);

module.exports = router;
