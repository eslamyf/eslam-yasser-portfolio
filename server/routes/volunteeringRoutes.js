const express = require('express');
const router = express.Router();
const Volunteering = require('../models/Volunteering');
const File = require('../models/File');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const isMongoReady = () => mongoose.connection.readyState === 1;

const getFallbackVolunteering = () => {
  const p = path.join(__dirname, '../../client/assets/data/work.json');
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    return (data.volunteering || []).map((x, idx) => ({
      _id: `vol-${idx}`,
      role: x.title,
      organization: x.subtitle || 'Support Community',
      startDate: x.year ? x.year.split('-')[0].trim() : '2026',
      endDate: x.year && x.year.includes('-') ? x.year.split('-')[1].trim() : 'Present',
      description: x.description || '',
      orderIndex: idx + 1
    }));
  }
  return [];
};

// GET /api/volunteering - Public
router.get('/', async (req, res) => {
  try {
    if (isMongoReady()) {
      const items = await Volunteering.find().sort({ orderIndex: 1, createdAt: -1 });
      if (items.length > 0) {
        return res.json({ success: true, count: items.length, data: items });
      }
    }
    const fallback = getFallbackVolunteering();
    res.json({ success: true, count: fallback.length, data: fallback });
  } catch (err) {
    const fallback = getFallbackVolunteering();
    res.json({ success: true, count: fallback.length, data: fallback });
  }
});

// Admin Routes
router.post('/admin/volunteering', authMiddleware, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'files', maxCount: 5 }
]), async (req, res) => {
  try {
    const data = req.body;
    if (data.skills && typeof data.skills === 'string') {
      data.skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        const file = req.files.image[0];
        data.image = `/uploads/images/${file.filename}`;
        await File.create({
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: data.image,
          category: 'image',
          relatedSection: 'Volunteering'
        });
      }
      if (req.files.files && req.files.files.length > 0) {
        data.supportingFiles = [];
        for (const file of req.files.files) {
          const isPdf = file.mimetype === 'application/pdf';
          const filePath = `/uploads/documents/${file.filename}`;
          data.supportingFiles.push({
            path: filePath,
            originalName: file.originalname
          });
          await File.create({
            originalName: file.originalname,
            storedName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            path: filePath,
            category: isPdf ? 'document' : 'document',
            relatedSection: 'Volunteering'
          });
        }
      }
    }

    const item = new Volunteering(data);
    await item.save();
    res.json({ success: true, message: 'Volunteering entry added successfully', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/volunteering/:id', authMiddleware, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'files', maxCount: 5 }
]), async (req, res) => {
  try {
    const data = req.body;
    if (data.skills && typeof data.skills === 'string') {
      data.skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        const file = req.files.image[0];
        data.image = `/uploads/images/${file.filename}`;
        await File.create({
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: data.image,
          category: 'image',
          relatedSection: 'Volunteering'
        });
      }
      if (req.files.files && req.files.files.length > 0) {
        data.supportingFiles = [];
        for (const file of req.files.files) {
          const isPdf = file.mimetype === 'application/pdf';
          const filePath = `/uploads/documents/${file.filename}`;
          data.supportingFiles.push({
            path: filePath,
            originalName: file.originalname
          });
          await File.create({
            originalName: file.originalname,
            storedName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            path: filePath,
            category: isPdf ? 'document' : 'document',
            relatedSection: 'Volunteering'
          });
        }
      }
    }

    const item = await Volunteering.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Volunteering entry not found' });
    res.json({ success: true, message: 'Volunteering updated successfully', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/volunteering/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Volunteering.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Volunteering entry not found' });
    res.json({ success: true, message: 'Volunteering deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
