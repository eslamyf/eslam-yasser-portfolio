const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
const { protect } = require('../middleware/authMiddleware');

const isMongoReady = () => mongoose.connection.readyState === 1;

// In-memory fallback inquiries array
const fallbackInquiries = [
  {
    _id: 'inq-sample-1',
    name: 'أحمد محمود',
    email: 'ahmed.mahmoud@example.com',
    subject: 'استفسار عن تطوير تطبيق ويب',
    message: 'مرحباً إسلام، أريد الاستفسار عن إمكانية بناء نظام إدارة عقارات باستخدام MEAN Stack.',
    status: 'unread',
    createdAt: new Date()
  }
];

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many messages sent from this IP. Please try again after an hour.'
  }
});

// @route   POST /api/inquiries
// @desc    Submit a new contact message/inquiry
// @access  Public
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name, email, and message.'
      });
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (isMongoReady()) {
      const inquiry = new Inquiry({ name, email, subject: subject || 'Portfolio Contact Inquiry', message, ipAddress });
      await inquiry.save();
    } else {
      fallbackInquiries.unshift({
        _id: 'inq-' + Date.now(),
        name,
        email,
        subject: subject || 'Portfolio Contact Inquiry',
        message,
        status: 'unread',
        createdAt: new Date(),
        ipAddress
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully. (تم إرسال رسالتك بنجاح وسنقوم بالرد عليك في أقرب وقت)'
    });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
  }
});

// ==================== ADMIN PROTECTED ROUTES ====================

// @route   GET /api/admin/inquiries
// @desc    Get all inquiries
// @access  Private (Admin)
router.get('/admin/inquiries', protect, async (req, res) => {
  try {
    if (isMongoReady()) {
      const inquiries = await Inquiry.find().sort({ createdAt: -1 });
      const unreadCount = await Inquiry.countDocuments({ status: 'unread' });
      return res.json({ success: true, count: inquiries.length, unreadCount, data: inquiries });
    }

    const unreadCount = fallbackInquiries.filter(i => i.status === 'unread').length;
    res.json({
      success: true,
      count: fallbackInquiries.length,
      unreadCount,
      data: fallbackInquiries
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ success: false, message: 'Server error loading inquiries' });
  }
});

// @route   PATCH /api/admin/inquiries/:id/status
// @desc    Update inquiry status
// @access  Private (Admin)
router.patch('/admin/inquiries/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const id = req.params.id;

    if (isMongoReady()) {
      const inquiry = await Inquiry.findByIdAndUpdate(id, { status }, { new: true });
      if (inquiry) return res.json({ success: true, message: 'Inquiry status updated', data: inquiry });
    }

    const target = fallbackInquiries.find(i => i._id === id);
    if (target) {
      target.status = status;
      return res.json({ success: true, message: 'Inquiry status updated', data: target });
    }

    res.status(404).json({ success: false, message: 'Inquiry not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
});

// @route   DELETE /api/admin/inquiries/:id
// @desc    Delete inquiry
// @access  Private (Admin)
router.delete('/admin/inquiries/:id', protect, async (req, res) => {
  try {
    const id = req.params.id;

    if (isMongoReady()) {
      const inquiry = await Inquiry.findById(id);
      if (inquiry) {
        await inquiry.deleteOne();
        return res.json({ success: true, message: 'Inquiry deleted successfully' });
      }
    }

    const index = fallbackInquiries.findIndex(i => i._id === id);
    if (index !== -1) {
      fallbackInquiries.splice(index, 1);
      return res.json({ success: true, message: 'Inquiry deleted successfully' });
    }

    res.status(404).json({ success: false, message: 'Inquiry not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting inquiry' });
  }
});

module.exports = router;
