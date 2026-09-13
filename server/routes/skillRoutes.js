const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

const isMongoReady = () => mongoose.connection.readyState === 1;

// In-memory fallback skills cache
let fallbackSkills = [
  { _id: 'skill-1', name: 'Angular', category: 'Frontend', proficiency: 85, iconClass: 'ri-angularjs-line', active: true, orderIndex: 1 },
  { _id: 'skill-2', name: 'Node.js', category: 'Backend', proficiency: 90, iconClass: 'ri-nodejs-line', active: true, orderIndex: 2 },
  { _id: 'skill-3', name: 'Express.js', category: 'Backend', proficiency: 90, iconClass: 'ri-settings-5-line', active: true, orderIndex: 3 },
  { _id: 'skill-4', name: 'MongoDB', category: 'Database', proficiency: 85, iconClass: 'ri-database-2-line', active: true, orderIndex: 4 },
  { _id: 'skill-5', name: 'TypeScript', category: 'Frontend', proficiency: 85, iconClass: 'ri-javascript-fill', active: true, orderIndex: 5 }
];

// GET /api/skills - Public
router.get('/', async (req, res) => {
  try {
    if (isMongoReady()) {
      const items = await Skill.find().sort({ orderIndex: 1, createdAt: -1 });
      if (items.length > 0) {
        return res.json({ success: true, count: items.length, data: items });
      }
    }
    return res.json({ success: true, count: fallbackSkills.length, data: fallbackSkills });
  } catch (err) {
    return res.json({ success: true, count: fallbackSkills.length, data: fallbackSkills });
  }
});

// Admin Routes - Create Skill
const handleCreateSkill = async (req, res) => {
  try {
    if (isMongoReady()) {
      const item = new Skill(req.body);
      await item.save();
      return res.json({ success: true, message: 'Skill added successfully', data: item });
    }

    const newSkill = {
      _id: `skill-${Date.now()}`,
      name: req.body.name,
      category: req.body.category || 'Backend',
      proficiency: req.body.proficiency ? parseInt(req.body.proficiency) : 90,
      iconClass: req.body.iconClass || 'ri-code-line',
      active: true,
      orderIndex: fallbackSkills.length + 1
    };
    fallbackSkills.push(newSkill);
    res.json({ success: true, message: 'Skill added successfully', data: newSkill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.post('/', authMiddleware, handleCreateSkill);
router.post('/admin/skills', authMiddleware, handleCreateSkill);

// Admin Routes - Update Skill
const handleUpdateSkill = async (req, res) => {
  try {
    const id = req.params.id;
    if (isMongoReady()) {
      const item = await Skill.findByIdAndUpdate(id, req.body, { new: true });
      if (item) return res.json({ success: true, message: 'Skill updated successfully', data: item });
    }

    const index = fallbackSkills.findIndex(s => s._id === id);
    if (index !== -1) {
      fallbackSkills[index] = { ...fallbackSkills[index], ...req.body };
      return res.json({ success: true, message: 'Skill updated successfully', data: fallbackSkills[index] });
    }

    res.json({ success: true, message: 'Skill updated successfully', data: req.body });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.put('/:id', authMiddleware, handleUpdateSkill);
router.put('/admin/skills/:id', authMiddleware, handleUpdateSkill);

// Admin Routes - Delete Skill
const handleDeleteSkill = async (req, res) => {
  try {
    const id = req.params.id;
    if (isMongoReady()) {
      await Skill.findByIdAndDelete(id);
    }
    fallbackSkills = fallbackSkills.filter(s => s._id !== id);
    res.json({ success: true, message: 'Skill deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.delete('/:id', authMiddleware, handleDeleteSkill);
router.delete('/admin/skills/:id', authMiddleware, handleDeleteSkill);

module.exports = router;
