const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Video = require('../models/Video');
const File = require('../models/File');
const authMiddleware = require('../middleware/authMiddleware');
const { upload, baseUploadDir } = require('../middleware/uploadMiddleware');

const mongoose = require('mongoose');
const isMongoReady = () => mongoose.connection.readyState === 1;

// GET /api/videos - Public
router.get('/', async (req, res) => {
  try {
    if (isMongoReady()) {
      const items = await Video.find().sort({ orderIndex: 1, createdAt: -1 });
      return res.json({ success: true, count: items.length, data: items });
    }
    return res.json({ success: true, count: 0, data: [] });
  } catch (err) {
    return res.json({ success: true, count: 0, data: [] });
  }
});

// GET /api/videos/stream/:id - Video Range Requests Streaming
router.get('/stream/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video || !video.videoFile) {
      return res.status(404).send('Video not found');
    }

    let videoPath = path.join(__dirname, '../..', video.videoFile);
    if (!fs.existsSync(videoPath)) {
      videoPath = path.join(__dirname, '../uploads/videos', path.basename(video.videoFile));
    }

    if (!fs.existsSync(videoPath)) {
      return res.status(404).send('Video file missing on server');
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    res.status(500).send('Error streaming video: ' + err.message);
  }
});

// Admin Routes
router.post('/admin/videos', authMiddleware, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = req.body;

    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        const file = req.files.thumbnail[0];
        data.thumbnail = `/uploads/images/${file.filename}`;
        await File.create({
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: data.thumbnail,
          category: 'image',
          relatedSection: 'Videos'
        });
      }
      if (req.files.video && req.files.video[0]) {
        const file = req.files.video[0];
        data.videoFile = `/uploads/videos/${file.filename}`;
        data.originalVideoName = file.originalname;
        data.fileSize = file.size;
        await File.create({
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: data.videoFile,
          category: 'video',
          relatedSection: 'Videos'
        });
      }
    }

    const item = new Video(data);
    await item.save();
    res.json({ success: true, message: 'Video added successfully', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/videos/:id', authMiddleware, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = req.body;

    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        const file = req.files.thumbnail[0];
        data.thumbnail = `/uploads/images/${file.filename}`;
        await File.create({
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: data.thumbnail,
          category: 'image',
          relatedSection: 'Videos'
        });
      }
      if (req.files.video && req.files.video[0]) {
        const file = req.files.video[0];
        data.videoFile = `/uploads/videos/${file.filename}`;
        data.originalVideoName = file.originalname;
        data.fileSize = file.size;
        await File.create({
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: data.videoFile,
          category: 'video',
          relatedSection: 'Videos'
        });
      }
    }

    const item = await Video.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, message: 'Video updated successfully', data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/videos/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Video.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
