const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const authMiddleware = require('../middleware/authMiddleware');

const mongoose = require('mongoose');
const isMongoReady = () => mongoose.connection.readyState === 1;

// GET /api/skills - Public
router.get('/', async (req, res) => {
  try {
    if (isMongoReady()) {
      const items = await Skill.find().sort({ orderIndex: 1, createdAt: -1 });
      return res.json({ success: true, count: items.length, data: items });
    }
    return res.json({ success: true, count: 0, data: [] });
  } catch (err) {
    return res.json({ success: true, count: 0, data: [] });
  }
});

// Admin Routes
router.post('/admin/skills', authMiddleware, async (req, res) => {
  try {
    const item = new Skill(req.body);
    await item.save();
    res.json({ success: true, message: 'Skill added successfully', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/skills/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, message: 'Skill updated successfully', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/skills/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Skill.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, message: 'Skill deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
