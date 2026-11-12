const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

const path = require('path');
const fs = require('fs');

const isMongoReady = () => mongoose.connection.readyState === 1;

const skillsPath = path.join(__dirname, '../data/skills.json');

const getFallbackSkills = () => {
  try {
    if (fs.existsSync(skillsPath)) {
      return JSON.parse(fs.readFileSync(skillsPath, 'utf8'));
    }
  } catch (e) {}
  return [
    { _id: 'skill-1', name: 'Angular', category: 'Frontend', proficiency: 85, iconClass: 'ri-angularjs-line', active: true, orderIndex: 1 },
    { _id: 'skill-2', name: 'Node.js', category: 'Backend', proficiency: 90, iconClass: 'ri-nodejs-line', active: true, orderIndex: 2 },
    { _id: 'skill-3', name: 'Express.js', category: 'Backend', proficiency: 90, iconClass: 'ri-settings-5-line', active: true, orderIndex: 3 },
    { _id: 'skill-4', name: 'MongoDB', category: 'Database', proficiency: 85, iconClass: 'ri-database-2-line', active: true, orderIndex: 4 },
    { _id: 'skill-5', name: 'TypeScript', category: 'Frontend', proficiency: 85, iconClass: 'ri-javascript-fill', active: true, orderIndex: 5 }
  ];
};

const saveFallbackSkills = (skills) => {
  const targetDirs = [
    path.join(__dirname, '../data'),
    path.join(__dirname, '../../client/public/assets/data')
  ];
  for (const dir of targetDirs) {
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'skills.json'), JSON.stringify(skills, null, 2), 'utf8');
    } catch (err) {}
  }
};

const syncSkillsToJson = async () => {
  try {
    let items = [];
    if (isMongoReady()) {
      items = await Skill.find().sort({ orderIndex: 1, createdAt: -1 }).lean();
    }
    if (!items || items.length === 0) {
      items = getFallbackSkills();
    }
    const cleanSkills = items.map(s => ({
      ...s,
      _id: s._id?.toString() || s._id
    }));
    saveFallbackSkills(cleanSkills);
  } catch (err) {}
};

// GET /api/skills - Public
router.get('/', async (req, res) => {
  try {
    if (isMongoReady()) {
      const items = await Skill.find().sort({ orderIndex: 1, createdAt: -1 });
      if (items.length > 0) {
        return res.json({ success: true, count: items.length, data: items });
      }
    }
    const skills = getFallbackSkills();
    return res.json({ success: true, count: skills.length, data: skills });
  } catch (err) {
    const skills = getFallbackSkills();
    return res.json({ success: true, count: skills.length, data: skills });
  }
});

// Admin Routes - Create Skill
const handleCreateSkill = async (req, res) => {
  try {
    const payload = {
      name: req.body.name,
      category: (req.body.category || 'backend').toString().trim().toLowerCase(),
      level: req.body.level || 'Advanced',
      proficiency: req.body.proficiency ? parseInt(req.body.proficiency) : 85,
      icon: req.body.icon || req.body.iconClass || 'ri-code-line',
      status: req.body.status || 'published',
      orderIndex: req.body.orderIndex ? parseInt(req.body.orderIndex) : 1
    };

    if (!payload.name) {
      return res.status(400).json({ success: false, message: 'Skill name is required' });
    }

    if (isMongoReady()) {
      const item = new Skill(payload);
      await item.save();
      await syncSkillsToJson();
      return res.json({ success: true, message: 'Skill added successfully', data: item });
    }

    const skills = getFallbackSkills();
    const newSkill = {
      _id: `skill-${Date.now()}`,
      ...payload
    };
    skills.push(newSkill);
    saveFallbackSkills(skills);
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
      if (item) {
        await syncSkillsToJson();
        return res.json({ success: true, message: 'Skill updated successfully', data: item });
      }
    }

    const skills = getFallbackSkills();
    const index = skills.findIndex(s => s._id === id);
    if (index !== -1) {
      skills[index] = { ...skills[index], ...req.body };
      saveFallbackSkills(skills);
      return res.json({ success: true, message: 'Skill updated successfully', data: skills[index] });
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
    if (isMongoReady() && mongoose.Types.ObjectId.isValid(id)) {
      await Skill.findByIdAndDelete(id);
      await syncSkillsToJson();
    }
    const skills = getFallbackSkills().filter(s => s._id !== id);
    saveFallbackSkills(skills);
    res.json({ success: true, message: 'Skill deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.delete('/:id', authMiddleware, handleDeleteSkill);
router.delete('/admin/skills/:id', authMiddleware, handleDeleteSkill);

module.exports = router;
