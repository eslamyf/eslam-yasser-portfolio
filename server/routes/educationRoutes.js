const express = require('express');
const router = express.Router();
const Education = require('../models/Education');
const File = require('../models/File');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const isMongoReady = () => mongoose.connection.readyState === 1;

const getFallbackEducation = () => {
  const p = path.join(__dirname, '../../client/assets/data/work.json');
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    return (data.education || []).map((x, idx) => ({
      _id: `edu-${idx}`,
      degree: x.title,
      institution: x.subtitle || 'Qena University',
      startDate: x.year ? x.year.split('-')[0].trim() : '2024',
      endDate: x.year && x.year.includes('-') ? x.year.split('-')[1].trim() : '2028',
      description: x.description || '',
      orderIndex: idx + 1
    }));
  }
  return [];
};

// GET /api/education - Public
router.get('/', async (req, res) => {
  try {
    if (isMongoReady()) {
      const items = await Education.find().sort({ orderIndex: 1, createdAt: -1 });
      if (items.length > 0) {
        return res.json({ success: true, count: items.length, data: items });
      }
    }
    const fallback = getFallbackEducation();
    res.json({ success: true, count: fallback.length, data: fallback });
  } catch (err) {
    const fallback = getFallbackEducation();
    res.json({ success: true, count: fallback.length, data: fallback });
  }
});

// Admin Routes
router.post('/admin/education', authMiddleware, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = req.body;

    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        const file = req.files.logo[0];
        data.logo = `/uploads/images/${file.filename}`;
        await File.create({
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: data.logo,
          category: 'image',
          relatedSection: 'Education'
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
          relatedSection: 'Education'
        });
      }
    }

    const item = new Education(data);
    await item.save();
    res.json({ success: true, message: 'Education added successfully', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/education/:id', authMiddleware, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = req.body;

    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        const file = req.files.logo[0];
        data.logo = `/uploads/images/${file.filename}`;
        await File.create({
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: data.logo,
          category: 'image',
          relatedSection: 'Education'
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
          relatedSection: 'Education'
        });
      }
    }

    const item = await Education.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Education entry not found' });
    res.json({ success: true, message: 'Education updated successfully', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/education/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Education.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Education entry not found' });
    res.json({ success: true, message: 'Education deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
