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
  if (!requestedPath || typeof requestedPath !== 'string') {
    return fs.existsSync(DEFAULT_RESUME_PATH) ? DEFAULT_RESUME_PATH : null;
  }

  // Strip origin/protocol if passed as absolute URL (e.g. http://localhost:5000/assets/pdf/...)
  let clean = requestedPath
    .replace(/^https?:\/\/[^\/]+/i, '')
    .trim();

  // Clean relative path string
  clean = decodeURIComponent(clean)
    .replace(/^(\.\.[\/\\])+/, '')
    .replace(/^[/\\]+/, '')
    .trim();

  // Remove leading 'client/' or 'server/' or 'public/' if present
  clean = clean.replace(/^(client|server|public)[/\\]+/i, '');

  // 1. Direct check in client/assets (e.g. assets/pdf/Eslam_Yasser_Resume.pdf)
  const clientCandidate = path.resolve(__dirname, '../../client', clean);
  for (const root of ALLOWED_ROOTS) {
    if (clientCandidate.toLowerCase().startsWith(root.toLowerCase()) && fs.existsSync(clientCandidate) && fs.statSync(clientCandidate).isFile()) {
      return clientCandidate;
    }
  }

  // 2. Direct check in client/assets/pdf/
  const clientAssetsPdf = path.resolve(__dirname, '../../client/assets/pdf', path.basename(clean));
  if (fs.existsSync(clientAssetsPdf) && fs.statSync(clientAssetsPdf).isFile()) {
    return clientAssetsPdf;
  }

  // 3. Check relative to server/ (e.g. uploads/cv/filename.pdf)
  const serverCandidate = path.resolve(__dirname, '..', clean);
  for (const root of ALLOWED_ROOTS) {
    if (serverCandidate.toLowerCase().startsWith(root.toLowerCase()) && fs.existsSync(serverCandidate) && fs.statSync(serverCandidate).isFile()) {
      return serverCandidate;
    }
  }

  // 4. Check inside uploads subdirectories by base filename
  const fileName = path.basename(clean);
  const subdirs = ['cv', 'certificates', 'documents', 'projects', 'videos', 'images'];
  for (const sub of subdirs) {
    const candidate = path.resolve(baseUploadDir, sub, fileName);
    if (candidate.toLowerCase().startsWith(baseUploadDir.toLowerCase()) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  // 5. Fallback for any CV / Resume / PDF request to default resume
  if (clean.toLowerCase().includes('resume') || clean.toLowerCase().includes('cv') || fileName.toLowerCase().endsWith('.pdf') || !clean) {
    if (fs.existsSync(DEFAULT_RESUME_PATH)) {
      return DEFAULT_RESUME_PATH;
    }
  }

  return null;
}

/**
 * GET /api/files/download
 * Guaranteed Binary Download Endpoint with RFC 5987 UTF-8 Filename Support
 */
router.get('/download', (req, res) => {
  try {
    const requestedPath = req.query.filePath || req.query.path || req.query.file || req.query.url;
    
    if (requestedPath && (requestedPath.startsWith('http://') || requestedPath.startsWith('https://'))) {
      return res.redirect(requestedPath);
    }

    let absolutePath = safeResolvePath(requestedPath);

    // Fallback to default canonical resume
    if (!absolutePath || !fs.existsSync(absolutePath)) {
      if (fs.existsSync(DEFAULT_RESUME_PATH)) {
        absolutePath = DEFAULT_RESUME_PATH;
      }
    }

    if (!absolutePath || !fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server.' });
    }

    const stat = fs.statSync(absolutePath);
    const mimeType = getMimeType(absolutePath);
    let rawName = req.query.name || path.basename(absolutePath);
    if (!path.extname(rawName)) {
      rawName += path.extname(absolutePath);
    }
    const cleanAsciiName = rawName.replace(/[^\w\s.()\-]/g, '_');
    const utf8EncodedName = encodeURIComponent(rawName);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `attachment; filename="${cleanAsciiName}"; filename*=UTF-8''${utf8EncodedName}`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Accept-Ranges');
    res.setHeader('Cache-Control', 'public, max-age=86400');

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
    const requestedPath = req.query.filePath || req.query.path || req.query.file || req.query.url;

    if (requestedPath && (requestedPath.startsWith('http://') || requestedPath.startsWith('https://'))) {
      return res.redirect(requestedPath);
    }

    let absolutePath = safeResolvePath(requestedPath);

    // Fallback for CV/Resume if requested path unresolved
    if (!absolutePath || !fs.existsSync(absolutePath)) {
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
    const cleanAsciiName = fileName.replace(/[^\w\s.()\-]/g, '_');
    const utf8EncodedName = encodeURIComponent(fileName);
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
        'Content-Disposition': `inline; filename="${cleanAsciiName}"; filename*=UTF-8''${utf8EncodedName}`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length, Content-Range, Accept-Ranges'
      });
      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${cleanAsciiName}"; filename*=UTF-8''${utf8EncodedName}`,
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
