const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Experience = require('../models/Experience');
const File = require('../models/File');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const isMongoReady = () => mongoose.connection.readyState === 1;

const getFallbackExperience = () => {
  const p = path.join(__dirname, '../../client/assets/data/work.json');
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    return (data.experience || []).map((x, idx) => ({
      _id: `exp-${idx}`,
      title: x.title,
      company: x.subtitle || 'Company',
      startDate: x.year ? x.year.split('-')[0].trim() : '2026',
      endDate: x.year && x.year.includes('-') ? x.year.split('-')[1].trim() : 'Present',
      description: x.description || '',
      orderIndex: idx + 1
    }));
  }
  return [];
};

// GET /api/experience - Public
router.get('/', async (req, res) => {
  try {
    if (isMongoReady()) {
      const items = await Experience.find().sort({ orderIndex: 1, createdAt: -1 });
      if (items.length > 0) {
        return res.json({ success: true, count: items.length, data: items });
      }
    }
    const fallback = getFallbackExperience();
    res.json({ success: true, count: fallback.length, data: fallback });
  } catch (err) {
    const fallback = getFallbackExperience();
    res.json({ success: true, count: fallback.length, data: fallback });
  }
});

// Admin Routes
router.post('/admin/experience', authMiddleware, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = req.body;
    if (data.skills && typeof data.skills === 'string') {
      data.skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        const file = req.files.logo[0];
        data.companyLogo = `/uploads/images/${file.filename}`;
        await File.create({
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: data.companyLogo,
          category: 'image',
          relatedSection: 'Experience'
        });
      }
      if (req.files.certificate && req.files.certificate[0]) {
        const file = req.files.certificate[0];
        const isPdf = file.mimetype === 'application/pdf';
        data.certificateFile = `/uploads/${isPdf ? 'certificates' : 'images'}/${file.filename}`;
        data.certificateOriginalName = file.originalname;
        await File.create({
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: data.certificateFile,
          category: isPdf ? 'certificate' : 'image',
          relatedSection: 'Experience'
        });
      }
    }

    const item = new Experience(data);
    await item.save();
    res.json({ success: true, message: 'Experience added successfully', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/experience/:id', authMiddleware, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = req.body;
    if (data.skills && typeof data.skills === 'string') {
      data.skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        const file = req.files.logo[0];
        data.companyLogo = `/uploads/images/${file.filename}`;
        await File.create({
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: data.companyLogo,
          category: 'image',
          relatedSection: 'Experience'
        });
      }
      if (req.files.certificate && req.files.certificate[0]) {
        const file = req.files.certificate[0];
        const isPdf = file.mimetype === 'application/pdf';
        data.certificateFile = `/uploads/${isPdf ? 'certificates' : 'images'}/${file.filename}`;
        data.certificateOriginalName = file.originalname;
        await File.create({
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: data.certificateFile,
          category: isPdf ? 'certificate' : 'image',
          relatedSection: 'Experience'
        });
      }
    }

    const item = await Experience.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Experience not found' });
    res.json({ success: true, message: 'Experience updated successfully', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/experience/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Experience.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Experience not found' });
    res.json({ success: true, message: 'Experience deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
