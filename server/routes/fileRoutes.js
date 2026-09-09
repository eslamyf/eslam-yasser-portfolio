const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const File = require('../models/File');
const authMiddleware = require('../middleware/authMiddleware');
const { upload, baseUploadDir } = require('../middleware/uploadMiddleware');

const isMongoReady = () => mongoose.connection.readyState === 1;

// Allowed roots for public and uploaded files
const ALLOWED_ROOTS = [
  path.resolve(__dirname, '../../client/assets'),
  path.resolve(__dirname, '../uploads')
];

const DEFAULT_RESUME_PATH = path.resolve(__dirname, '../../client/assets/pdf/Eslam_Yasser_Resume.pdf');

// Common MIME Types lookup map
const MIME_TYPES = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mov': 'video/quicktime',
  '.zip': 'application/zip',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.json': 'application/json'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Securely resolves a requested file path, ensuring it stays strictly within ALLOWED_ROOTS.
 * Prevents path traversal vulnerabilities (e.g., ../../etc/passwd).
 */
function safeResolvePath(requestedPath) {
  if (!requestedPath || typeof requestedPath !== 'string') return null;

  // Clean relative path string
  let clean = decodeURIComponent(requestedPath)
    .replace(/^(\.\.[\/\\])+/, '')
    .replace(/^[/\\]+/, '')
    .trim();

  // 1. Check relative to client/ (e.g. assets/pdf/Eslam_Yasser_Resume.pdf)
  const clientCandidate = path.resolve(__dirname, '../../client', clean);
  for (const root of ALLOWED_ROOTS) {
    if (clientCandidate.startsWith(root) && fs.existsSync(clientCandidate) && fs.statSync(clientCandidate).isFile()) {
      return clientCandidate;
    }
  }

  // 2. Check relative to server/ (e.g. uploads/cv/filename.pdf)
  const serverCandidate = path.resolve(__dirname, '..', clean);
  for (const root of ALLOWED_ROOTS) {
    if (serverCandidate.startsWith(root) && fs.existsSync(serverCandidate) && fs.statSync(serverCandidate).isFile()) {
      return serverCandidate;
    }
  }

  // 3. Check inside uploads subdirectories by base filename
  const fileName = path.basename(clean);
  const subdirs = ['cv', 'certificates', 'projects', 'documents', 'videos', 'images'];
  for (const sub of subdirs) {
    const candidate = path.resolve(baseUploadDir, sub, fileName);
    if (candidate.startsWith(baseUploadDir) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  // 4. Check inside client/assets/pdf/
  const clientPdfCandidate = path.resolve(__dirname, '../../client/assets/pdf', fileName);
  if (fs.existsSync(clientPdfCandidate) && fs.statSync(clientPdfCandidate).isFile()) {
    return clientPdfCandidate;
  }

  return null;
}

/**
 * GET /api/files/download
 * Guaranteed Binary Download Endpoint
 */
router.get('/download', (req, res) => {
  try {
    const requestedPath = req.query.filePath || req.query.path || req.query.file;
    let absolutePath = safeResolvePath(requestedPath);

    // If requested CV/resume or path not provided, fallback to default canonical resume
    if (!absolutePath && (!requestedPath || requestedPath.toLowerCase().includes('resume') || requestedPath.toLowerCase().includes('cv'))) {
      if (fs.existsSync(DEFAULT_RESUME_PATH)) {
        absolutePath = DEFAULT_RESUME_PATH;
      }
    }

    if (!absolutePath || !fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server.' });
    }

    const stat = fs.statSync(absolutePath);
    const mimeType = getMimeType(absolutePath);
    const rawName = req.query.name || path.basename(absolutePath);
    const sanitizedName = rawName.replace(/[^\w\s.()\'\u0600-\u06FF-]/g, '_');

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(sanitizedName)}"`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Accept-Ranges');

    const fileStream = fs.createReadStream(absolutePath);
    fileStream.on('error', (err) => {
      console.error('[Download Stream Error]:', err);
      if (!res.headersSent) res.status(500).json({ success: false, message: 'Streaming error' });
    });
    fileStream.pipe(res);
  } catch (err) {
    console.error('[Download Handler Error]:', err);
    res.status(500).json({ success: false, message: 'Server error during download' });
  }
});

/**
 * GET /api/files/view (and /api/files/view-pdf)
 * In-Browser Inline Stream with Byte-Range Support (for PDFs, Videos, Images)
 */
const handleFileView = (req, res) => {
  try {
    const requestedPath = req.query.filePath || req.query.path || req.query.file;
    let absolutePath = safeResolvePath(requestedPath);

    // Fallback for CV/Resume if requested path unresolved
    if (!absolutePath && (!requestedPath || requestedPath.toLowerCase().includes('resume') || requestedPath.toLowerCase().includes('cv'))) {
      if (fs.existsSync(DEFAULT_RESUME_PATH)) {
        absolutePath = DEFAULT_RESUME_PATH;
      }
    }

    if (!absolutePath || !fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server.' });
    }

    const stat = fs.statSync(absolutePath);
    const fileSize = stat.size;
    const mimeType = getMimeType(absolutePath);
    const fileName = path.basename(absolutePath);
    const range = req.headers.range;

    // Support 206 Partial Content for byte-range streaming (PDF scrubbing & HTML5 Video)
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
        return res.end();
      }

      const chunkSize = (end - start) + 1;
      const fileStream = fs.createReadStream(absolutePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length, Content-Range, Accept-Ranges'
      });
      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length, Accept-Ranges'
      });
      fs.createReadStream(absolutePath).pipe(res);
    }
  } catch (err) {
    console.error('[View Handler Error]:', err);
    res.status(500).json({ success: false, message: 'Server error serving file' });
  }
};

router.get('/view', handleFileView);
router.get('/view-pdf', handleFileView);

/**
 * POST /api/files/upload
 * Unified File Upload Handler
 */
router.post('/upload', authMiddleware, upload.any(), async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const relativeFolder = path.basename(file.destination);
    const filePath = `/uploads/${relativeFolder}/${file.filename}`;

    let category = 'document';
    if (relativeFolder === 'cv') category = 'cv';
    else if (relativeFolder === 'certificates') category = 'certificate';
    else if (relativeFolder === 'images') category = 'image';
    else if (relativeFolder === 'videos') category = 'video';
    else if (relativeFolder === 'projects') category = 'project';

    if (isMongoReady()) {
      try {
        await File.create({
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: filePath,
          category: category,
          relatedSection: req.body.relatedSection || 'Admin Upload'
        });
      } catch (dbErr) {
        console.warn('[File Model Save Warning]:', dbErr.message);
      }
    }

    return res.json({
      success: true,
      message: 'File uploaded successfully!',
      filePath: filePath,
      originalName: file.originalname,
      storedName: file.filename,
      size: file.size,
      mimeType: file.mimetype,
      category: category
    });
  } catch (err) {
    console.error('[Upload Handler Error]:', err);
    return res.status(500).json({ success: false, message: err.message || 'File upload failed' });
  }
});

/**
 * GET /api/files
 * List tracked files for Admin
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (isMongoReady()) {
      const files = await File.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: files.length, data: files });
    }
    return res.json({ success: true, count: 0, data: [] });
  } catch (err) {
    return res.json({ success: true, count: 0, data: [] });
  }
});

/**
 * DELETE /api/files/:id
 * Delete file record & file from disk
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (isMongoReady()) {
      const file = await File.findById(req.params.id);
      if (!file) return res.status(404).json({ success: false, message: 'File record not found' });

      const absolutePath = safeResolvePath(file.path);
      if (absolutePath && fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
      await File.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'File deleted successfully.' });
    }
    res.json({ success: true, message: 'Delete processed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
