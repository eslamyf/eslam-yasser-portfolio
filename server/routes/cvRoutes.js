const express = require('express');
const router = express.Router();
const CV = require('../models/CV');
const File = require('../models/File');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { initialCv, loadCvsFromFile, saveCvsToFile } = require('../utils/cvStore');

const mongoose = require('mongoose');
const isMongoReady = () => mongoose.connection.readyState === 1;

// GET /api/cv/active - Public (Get Active CV for Portfolio)
router.get('/active', async (req, res) => {
  try {
    if (isMongoReady()) {
      let cv = await CV.findOne({ active: true });
      if (!cv) cv = await CV.findOne().sort({ createdAt: -1 });
      if (cv) return res.json({ success: true, data: cv });
    }
    const fileCvs = loadCvsFromFile();
    const activeCv = fileCvs.find(x => x.active) || fileCvs[0] || initialCv;
    return res.json({ success: true, data: activeCv });
  } catch (err) {
    const fileCvs = loadCvsFromFile();
    return res.json({ success: true, data: fileCvs[0] || initialCv });
  }
});

// GET /api/cv - Public List All
router.get('/', async (req, res) => {
  try {
    if (isMongoReady()) {
      const cvs = await CV.find().sort({ createdAt: -1 });
      if (cvs.length > 0) return res.json({ success: true, count: cvs.length, data: cvs });
    }
    const fileCvs = loadCvsFromFile();
    return res.json({ success: true, count: fileCvs.length, data: fileCvs });
  } catch (err) {
    const fileCvs = loadCvsFromFile();
    return res.json({ success: true, count: fileCvs.length, data: fileCvs });
  }
});

// Create / Save CV Record (Supports both JSON payload and direct Multer file upload)
const handleSaveCv = async (req, res) => {
  try {
    const { name, version, pdfFile, active, setAsActive } = req.body || {};
    const isFileActive = active === true || active === 'true' || setAsActive === true || setAsActive === 'true';

    let finalPdfPath = pdfFile || '/assets/pdf/Eslam_Yasser_Resume.pdf';
    let originalName = name || 'Eslam_Yasser_Resume.pdf';
    let fileSize = 0;

    if (req.file) {
      finalPdfPath = `/uploads/cv/${req.file.filename}`;
      originalName = req.file.originalname;
      fileSize = req.file.size;
    }

    let savedRecord = null;

    if (isMongoReady()) {
      if (isFileActive) {
        await CV.updateMany({}, { active: false });
      }
      const cv = new CV({
        name: name || originalName,
        version: version || 'v1.0',
        pdfFile: finalPdfPath,
        originalName: originalName,
        fileSize: fileSize,
        active: isFileActive
      });
      savedRecord = await cv.save();
    }

    // Always update JSON disk file as well for 100% persistence
    let fileCvs = loadCvsFromFile();
    if (isFileActive) {
      fileCvs.forEach(item => { item.active = false; });
    }
    const newFileCv = {
      _id: savedRecord ? savedRecord._id.toString() : 'cv-' + Date.now(),
      name: name || originalName,
      version: version || 'v1.0',
      pdfFile: finalPdfPath,
      originalName: originalName,
      fileSize: fileSize,
      active: isFileActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    fileCvs.unshift(newFileCv);
    saveCvsToFile(fileCvs);

    return res.json({ success: true, message: 'CV record saved and persisted successfully', data: savedRecord || newFileCv });
  } catch (err) {
    console.error('Save CV error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error saving CV' });
  }
};

router.post('/', authMiddleware, upload.single('pdf'), handleSaveCv);
router.post('/admin/cv', authMiddleware, upload.single('pdf'), handleSaveCv);

// Activate CV Endpoint
const handleActivateCv = async (req, res) => {
  try {
    const id = req.params.id;
    let activatedRecord = null;

    if (isMongoReady()) {
      await CV.updateMany({}, { active: false });
      activatedRecord = await CV.findByIdAndUpdate(id, { active: true }, { new: true });
    }

    let fileCvs = loadCvsFromFile();
    fileCvs.forEach(item => {
      item.active = (item._id === id);
    });
    saveCvsToFile(fileCvs);

    const result = activatedRecord || fileCvs.find(x => x.active) || fileCvs[0];
    return res.json({ success: true, message: 'CV set as active successfully', data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.patch('/:id/active', authMiddleware, handleActivateCv);
router.put('/:id/active', authMiddleware, handleActivateCv);
router.put('/admin/cv/:id/activate', authMiddleware, handleActivateCv);
router.patch('/admin/cv/:id/activate', authMiddleware, handleActivateCv);

// Delete CV Endpoint
const handleDeleteCv = async (req, res) => {
  try {
    const id = req.params.id;
    if (isMongoReady()) {
      await CV.findByIdAndDelete(id);
    }

    let fileCvs = loadCvsFromFile();
    fileCvs = fileCvs.filter(x => x._id !== id);
    saveCvsToFile(fileCvs);

    res.json({ success: true, message: 'CV deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.delete('/:id', authMiddleware, handleDeleteCv);
router.delete('/admin/cv/:id', authMiddleware, handleDeleteCv);

module.exports = router;
