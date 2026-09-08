const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const authMiddleware = require('../middleware/authMiddleware');

const { upload } = require('../middleware/uploadMiddleware');

const mongoose = require('mongoose');
const isMongoReady = () => mongoose.connection.readyState === 1;

// POST /api/files/upload - Universal file uploader endpoint (CV, PDF, Image, Video, Document)
const handleFileUpload = async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please select a valid file.' });
    }

    let category = 'document';
    let folder = 'documents';

    if (file.mimetype.startsWith('image/')) {
      category = 'image';
      folder = 'images';
    } else if (file.mimetype === 'application/pdf') {
      category = (file.originalname && file.originalname.toLowerCase().includes('cv')) || file.fieldname === 'cv' ? 'cv' : 'certificate';
      folder = category === 'cv' ? 'cv' : 'pdfs';
    } else if (file.mimetype.startsWith('video/')) {
      category = 'video';
      folder = 'videos';
    }

    const filePath = `/uploads/${folder}/${file.filename}`;

    if (isMongoReady()) {
      try {
        await File.create({
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: filePath,
          category: category,
          relatedSection: 'Admin Upload'
        });
      } catch (dbErr) {
        console.warn('File document save warning:', dbErr.message);
      }
    }

    return res.json({
      success: true,
      message: 'File uploaded successfully',
      filePath: filePath,
      originalName: file.originalname,
      storedName: file.filename,
      size: file.size,
      mimeType: file.mimetype,
      category: category
    });
  } catch (err) {
    console.error('Upload handler error:', err);
    return res.status(500).json({ success: false, message: err.message || 'File upload failed' });
  }
};

router.post('/upload', authMiddleware, upload.any(), handleFileUpload);
router.post('/admin/upload', authMiddleware, upload.any(), handleFileUpload);

// GET /api/files - List all tracked files (Admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (isMongoReady()) {
      const files = await File.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: files.length, data: files });
    }
    return res.json({ success: true, count: 0, data: [] });
  } catch (err) {
    console.error('Error loading files route:', err.message);
    return res.json({ success: true, count: 0, data: [] });
  }
});

// Universal File Path Resolver across all server upload folders and client assets
function resolveFilePath(filePath) {
  if (!filePath) return null;

  // Clean relative path string
  const cleanPath = filePath.replace(/^[/\\]+/, '').replace(/^(\.\.[\/\\])+/, '');
  const fileName = path.basename(cleanPath);

  // 1. Check exact path under server/ (e.g. server/uploads/pdfs/filename.pdf or server/uploads/cv/filename.pdf)
  const directServerPath = path.join(__dirname, '..', cleanPath);
  if (fs.existsSync(directServerPath)) return directServerPath;

  // 2. Check exact path under workspace root (e.g. uploads/cv/filename.pdf)
  const directRootPath = path.join(__dirname, '../..', cleanPath);
  if (fs.existsSync(directRootPath)) return directRootPath;

  // 3. Check exact path under client/ (e.g. client/assets/pdf/...)
  const directClientPath = path.join(__dirname, '../../client', cleanPath);
  if (fs.existsSync(directClientPath)) return directClientPath;

  // 4. Search across all server upload subdirectories (pdfs, cv, documents, images, videos) by fileName
  const uploadFolders = ['pdfs', 'cv', 'documents', 'images', 'videos'];
  for (const folder of uploadFolders) {
    const candidate = path.join(__dirname, '../uploads', folder, fileName);
    if (fs.existsSync(candidate)) return candidate;
  }

  // 5. Search inside client/assets/pdf/
  const clientPdfCandidate = path.join(__dirname, '../../client/assets/pdf', fileName);
  if (fs.existsSync(clientPdfCandidate)) return clientPdfCandidate;

  // 6. Search inside client/assets/
  const clientAssetCandidate = path.join(__dirname, '../../client/assets', fileName);
  if (fs.existsSync(clientAssetCandidate)) return clientAssetCandidate;

  // 7. Fallback to default Resume PDF if requested file cannot be found anywhere
  const defaultResume = path.join(__dirname, '../../client/assets/pdf/Eslam_Yasser_Resume.pdf');
  if (fs.existsSync(defaultResume)) return defaultResume;

  return null;
}

// GET /api/files/download - Guaranteed PDF Download endpoint
router.get('/download', async (req, res) => {
  try {
    const { filePath, name } = req.query;
    let absolutePath = resolveFilePath(filePath);

    if (!absolutePath || !fs.existsSync(absolutePath)) {
      console.warn('[Download] Could not resolve:', filePath, '- using fallback');
      absolutePath = path.join(__dirname, '../../client/assets/pdf/Eslam_Yasser_Resume.pdf');
    }

    if (!absolutePath || !fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'File not found. Please upload a CV first.' });
    }

    let downloadName = (name || path.basename(absolutePath)).replace(/[^\w\s.()\'\-]/g, '_');
    if (!downloadName.toLowerCase().endsWith('.pdf') && absolutePath.toLowerCase().endsWith('.pdf')) {
      downloadName = downloadName.replace(/\.[^/.]+$/, "") + '.pdf';
    }

    console.log('[Download] Sending file:', absolutePath, 'as:', downloadName);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.sendFile(absolutePath);
  } catch (err) {
    console.error('Download error:', err);
    const fallbackPath = path.join(__dirname, '../../client/assets/pdf/Eslam_Yasser_Resume.pdf');
    if (fs.existsSync(fallbackPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="Eslam_Yasser_Resume.pdf"');
      return res.sendFile(fallbackPath);
    }
    return res.status(500).json({ success: false, message: 'Server error during download' });
  }
});

// GET /api/files/view-pdf - Guaranteed PDF Inline Stream endpoint
router.get('/view-pdf', (req, res) => {
  try {
    const { filePath } = req.query;
    let absolutePath = resolveFilePath(filePath);

    if (!absolutePath || !fs.existsSync(absolutePath)) {
      console.warn('[ViewPDF] Could not resolve:', filePath, '- using fallback');
      absolutePath = path.join(__dirname, '../../client/assets/pdf/Eslam_Yasser_Resume.pdf');
    }

    if (!absolutePath || !fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'PDF file not found. Please upload a CV first.' });
    }

    console.log('[ViewPDF] Serving:', absolutePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(absolutePath);
  } catch (err) {
    console.error('View PDF error:', err);
    const fallbackPath = path.join(__dirname, '../../client/assets/pdf/Eslam_Yasser_Resume.pdf');
    if (fs.existsSync(fallbackPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      return res.sendFile(fallbackPath);
    }
    return res.status(500).json({ success: false, message: 'Server error serving PDF' });
  }
});


// DELETE /api/files/:id - Admin Delete File
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ success: false, message: 'File record not found' });

    const absolutePath = path.join(__dirname, '../..', file.path);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    await File.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'File deleted from server and database' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
