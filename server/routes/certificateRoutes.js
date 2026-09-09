const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const File = require('../models/File');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const isMongoReady = () => mongoose.connection.readyState === 1;

const getFallbackCertificates = () => {
  const p = path.join(__dirname, '../../client/assets/data/work.json');
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    return (data.certificates || []).map((x, idx) => ({
      _id: `cert-${idx}`,
      name: x.title,
      issuer: x.subtitle || 'NTI',
      issueDate: x.year || '2026',
      description: x.description || '',
      pdfFile: '/assets/pdf/Eslam_Yasser_Resume.pdf',
      orderIndex: idx + 1
    }));
  }
  return [];
};

// GET /api/certificates - Public
router.get('/', async (req, res) => {
  try {
    if (isMongoReady()) {
      const items = await Certificate.find().sort({ orderIndex: 1, createdAt: -1 });
      if (items.length > 0) {
        return res.json({ success: true, count: items.length, data: items });
      }
    }
    const fallback = getFallbackCertificates();
    res.json({ success: true, count: fallback.length, data: fallback });
  } catch (err) {
    const fallback = getFallbackCertificates();
    res.json({ success: true, count: fallback.length, data: fallback });
  }
});

// Admin Routes
router.post('/admin/certificates', authMiddleware, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = req.body;

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
          relatedSection: 'Certificates'
        });
      }
      if (req.files.pdf && req.files.pdf[0]) {
        const file = req.files.pdf[0];
        data.pdfFile = `/uploads/certificates/${file.filename}`;
        data.originalPdfName = file.originalname;
        await File.create({
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: data.pdfFile,
          category: 'certificate',
          relatedSection: 'Certificates'
        });
      }
    }

    const item = new Certificate(data);
    await item.save();
    res.json({ success: true, message: 'Certificate added successfully', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/certificates/:id', authMiddleware, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = req.body;

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
          relatedSection: 'Certificates'
        });
      }
      if (req.files.pdf && req.files.pdf[0]) {
        const file = req.files.pdf[0];
        data.pdfFile = `/uploads/certificates/${file.filename}`;
        data.originalPdfName = file.originalname;
        await File.create({
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: data.pdfFile,
          category: 'certificate',
          relatedSection: 'Certificates'
        });
      }
    }

    const item = await Certificate.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, message: 'Certificate updated successfully', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/certificates/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Certificate.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, message: 'Certificate deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
