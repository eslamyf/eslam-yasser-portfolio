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

const handleGetInquiries = async (req, res) => {
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
};

router.get('/', protect, handleGetInquiries);
router.get('/admin/inquiries', protect, handleGetInquiries);

const handleUpdateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const id = req.params.id;

    if (isMongoReady()) {
      await Inquiry.findByIdAndUpdate(id, { status });
    }
    const item = fallbackInquiries.find(i => i._id === id);
    if (item) item.status = status;
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.patch('/:id/status', protect, handleUpdateInquiryStatus);
router.patch('/admin/inquiries/:id/status', protect, handleUpdateInquiryStatus);

const handleDeleteInquiry = async (req, res) => {
  try {
    const id = req.params.id;
    if (isMongoReady()) {
      await Inquiry.findByIdAndDelete(id);
    }
    const idx = fallbackInquiries.findIndex(i => i._id === id);
    if (idx !== -1) fallbackInquiries.splice(idx, 1);

    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.delete('/:id', protect, handleDeleteInquiry);
router.delete('/admin/inquiries/:id', protect, handleDeleteInquiry);

module.exports = router;
