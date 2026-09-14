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

const workJsonPath = path.join(__dirname, '../../client/assets/data/work.json');

const getWorkData = () => {
  if (fs.existsSync(workJsonPath)) {
    try {
      return JSON.parse(fs.readFileSync(workJsonPath, 'utf8'));
    } catch {
      return { experience: [], education: [], volunteering: [], certificates: [] };
    }
  }
  return { experience: [], education: [], volunteering: [], certificates: [] };
};

const saveWorkData = (data) => {
  try {
    fs.writeFileSync(workJsonPath, JSON.stringify(data, null, 4), 'utf8');
  } catch (err) {
    console.warn('Failed to save work.json fallback:', err.message);
  }
};

const getFallbackCertificates = () => {
  const data = getWorkData();
  return (data.certificates || []).map((x, idx) => ({
    _id: x._id || `cert-${idx}`,
    name: x.title || x.name,
    issuer: x.subtitle || x.issuer || 'NTI',
    issueDate: x.year || x.issueDate || '2026',
    description: x.description || '',
    pdfFile: x.pdfFile || '/assets/pdf/EslamCV.pdf',
    orderIndex: x.orderIndex || idx + 1
  }));
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

const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]);

// Admin Routes - Create Certificate
const handleCreateCertificate = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        const file = req.files.image[0];
        data.image = `/uploads/images/${file.filename}`;
        if (isMongoReady()) {
          await File.create({
            originalName: file.originalname,
            storedName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            path: data.image,
            category: 'image',
            relatedSection: 'Certificates'
          }).catch(() => {});
        }
      }
      if (req.files.pdf && req.files.pdf[0]) {
        const file = req.files.pdf[0];
        data.pdfFile = `/uploads/certificates/${file.filename}`;
        data.originalPdfName = file.originalname;
        if (isMongoReady()) {
          await File.create({
            originalName: file.originalname,
            storedName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            path: data.pdfFile,
            category: 'certificate',
            relatedSection: 'Certificates'
          }).catch(() => {});
        }
      }
    }

    if (isMongoReady()) {
      const item = new Certificate(data);
      await item.save();
      return res.json({ success: true, message: 'Certificate added successfully', data: item });
    }

    const workData = getWorkData();
    if (!workData.certificates) workData.certificates = [];
    const newEntry = {
      _id: `cert-${Date.now()}`,
      title: data.name,
      name: data.name,
      subtitle: data.issuer,
      issuer: data.issuer,
      year: data.issueDate || '2026',
      issueDate: data.issueDate || '2026',
      description: data.description || '',
      pdfFile: data.pdfFile || '/assets/pdf/EslamCV.pdf',
      orderIndex: data.orderIndex ? parseInt(data.orderIndex) : workData.certificates.length + 1
    };
    workData.certificates.unshift(newEntry);
    saveWorkData(workData);
    return res.json({ success: true, message: 'Certificate added successfully', data: newEntry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.post('/', authMiddleware, uploadFields, handleCreateCertificate);
router.post('/admin/certificates', authMiddleware, uploadFields, handleCreateCertificate);

// Admin Routes - Update Certificate
const handleUpdateCertificate = async (req, res) => {
  try {
    const data = { ...req.body };
    const id = req.params.id;

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        const file = req.files.image[0];
        data.image = `/uploads/images/${file.filename}`;
        if (isMongoReady()) {
          await File.create({
            originalName: file.originalname,
            storedName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            path: data.image,
            category: 'image',
            relatedSection: 'Certificates'
          }).catch(() => {});
        }
      }
      if (req.files.pdf && req.files.pdf[0]) {
        const file = req.files.pdf[0];
        data.pdfFile = `/uploads/certificates/${file.filename}`;
        data.originalPdfName = file.originalname;
        if (isMongoReady()) {
          await File.create({
            originalName: file.originalname,
            storedName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            path: data.pdfFile,
            category: 'certificate',
            relatedSection: 'Certificates'
          }).catch(() => {});
        }
      }
    }

    if (isMongoReady()) {
      const item = await Certificate.findByIdAndUpdate(id, data, { new: true });
      if (item) {
        return res.json({ success: true, message: 'Certificate updated successfully', data: item });
      }
    }

    const workData = getWorkData();
    if (workData.certificates) {
      const index = workData.certificates.findIndex((x, idx) => (x._id === id || `cert-${idx}` === id));
      if (index !== -1) {
        workData.certificates[index] = {
          ...workData.certificates[index],
          title: data.name || workData.certificates[index].title,
          name: data.name || workData.certificates[index].name,
          subtitle: data.issuer || workData.certificates[index].subtitle,
          issuer: data.issuer || workData.certificates[index].issuer,
          year: data.issueDate || workData.certificates[index].year,
          issueDate: data.issueDate || workData.certificates[index].issueDate,
          pdfFile: data.pdfFile || workData.certificates[index].pdfFile,
          description: data.description !== undefined ? data.description : workData.certificates[index].description
        };
        saveWorkData(workData);
        return res.json({ success: true, message: 'Certificate updated successfully', data: workData.certificates[index] });
      }
    }

    res.json({ success: true, message: 'Certificate updated successfully', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.put('/:id', authMiddleware, uploadFields, handleUpdateCertificate);
router.put('/admin/certificates/:id', authMiddleware, uploadFields, handleUpdateCertificate);

// Admin Routes - Delete Certificate
const handleDeleteCertificate = async (req, res) => {
  try {
    const id = req.params.id;
    if (isMongoReady()) {
      const item = await Certificate.findByIdAndDelete(id);
      if (item) {
        return res.json({ success: true, message: 'Certificate deleted successfully' });
      }
    }

    const workData = getWorkData();
    if (workData.certificates) {
      workData.certificates = workData.certificates.filter((x, idx) => x._id !== id && `cert-${idx}` !== id);
      saveWorkData(workData);
    }

    res.json({ success: true, message: 'Certificate deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.delete('/:id', authMiddleware, handleDeleteCertificate);
router.delete('/admin/certificates/:id', authMiddleware, handleDeleteCertificate);

module.exports = router;
