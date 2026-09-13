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

// In-memory fallback videos cache
let fallbackVideos = [];

// GET /api/videos - Public
router.get('/', async (req, res) => {
  try {
    if (isMongoReady()) {
      const items = await Video.find().sort({ orderIndex: 1, createdAt: -1 });
      if (items.length > 0) {
        return res.json({ success: true, count: items.length, data: items });
      }
    }
    return res.json({ success: true, count: fallbackVideos.length, data: fallbackVideos });
  } catch (err) {
    return res.json({ success: true, count: fallbackVideos.length, data: fallbackVideos });
  }
});

// GET /api/videos/stream/:id - Video Range Requests Streaming
router.get('/stream/:id', async (req, res) => {
  try {
    let video = null;
    if (isMongoReady()) {
      video = await Video.findById(req.params.id);
    } else {
      video = fallbackVideos.find(v => v._id === req.params.id);
    }

    if (!video || !video.videoPath) {
      return res.status(404).send('Video not found');
    }

    let videoPath = path.join(__dirname, '../..', video.videoPath);
    if (!fs.existsSync(videoPath)) {
      videoPath = path.join(__dirname, '../uploads/videos', path.basename(video.videoPath));
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

const uploadFields = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

// Admin Routes - Create Video
const handleCreateVideo = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        const file = req.files.thumbnail[0];
        data.thumbnail = `/uploads/images/${file.filename}`;
        if (isMongoReady()) {
          await File.create({
            originalName: file.originalname,
            storedName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            path: data.thumbnail,
            category: 'image',
            relatedSection: 'Videos'
          }).catch(() => {});
        }
      }
      if (req.files.video && req.files.video[0]) {
        const file = req.files.video[0];
        data.videoPath = `/uploads/videos/${file.filename}`;
        data.originalVideoName = file.originalname;
        data.fileSize = file.size;
        if (isMongoReady()) {
          await File.create({
            originalName: file.originalname,
            storedName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            path: data.videoPath,
            category: 'video',
            relatedSection: 'Videos'
          }).catch(() => {});
        }
      }
    }

    if (isMongoReady()) {
      const item = new Video(data);
      await item.save();
      return res.json({ success: true, message: 'Video added successfully', data: item });
    }

    const newVideo = {
      _id: `vid-${Date.now()}`,
      title: data.title,
      videoType: data.videoType || 'youtube',
      youtubeUrl: data.youtubeUrl || '',
      videoPath: data.videoPath || '',
      duration: data.duration || '',
      category: data.category || 'General',
      orderIndex: fallbackVideos.length + 1
    };
    fallbackVideos.unshift(newVideo);
    res.json({ success: true, message: 'Video added successfully', data: newVideo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.post('/', authMiddleware, uploadFields, handleCreateVideo);
router.post('/admin/videos', authMiddleware, uploadFields, handleCreateVideo);

// Admin Routes - Update Video
const handleUpdateVideo = async (req, res) => {
  try {
    const data = { ...req.body };
    const id = req.params.id;

    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        const file = req.files.thumbnail[0];
        data.thumbnail = `/uploads/images/${file.filename}`;
        if (isMongoReady()) {
          await File.create({
            originalName: file.originalname,
            storedName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            path: data.thumbnail,
            category: 'image',
            relatedSection: 'Videos'
          }).catch(() => {});
        }
      }
      if (req.files.video && req.files.video[0]) {
        const file = req.files.video[0];
        data.videoPath = `/uploads/videos/${file.filename}`;
        data.originalVideoName = file.originalname;
        data.fileSize = file.size;
        if (isMongoReady()) {
          await File.create({
            originalName: file.originalname,
            storedName: file.filename,
            mimeType: file.mimetype,
            size: file.size,
            path: data.videoPath,
            category: 'video',
            relatedSection: 'Videos'
          }).catch(() => {});
        }
      }
    }

    if (isMongoReady()) {
      const item = await Video.findByIdAndUpdate(id, data, { new: true });
      if (item) return res.json({ success: true, message: 'Video updated successfully', data: item });
    }

    const index = fallbackVideos.findIndex(v => v._id === id);
    if (index !== -1) {
      fallbackVideos[index] = { ...fallbackVideos[index], ...data };
      return res.json({ success: true, message: 'Video updated successfully', data: fallbackVideos[index] });
    }

    res.json({ success: true, message: 'Video updated successfully', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.put('/:id', authMiddleware, uploadFields, handleUpdateVideo);
router.put('/admin/videos/:id', authMiddleware, uploadFields, handleUpdateVideo);

// Admin Routes - Delete Video
const handleDeleteVideo = async (req, res) => {
  try {
    const id = req.params.id;
    if (isMongoReady()) {
      await Video.findByIdAndDelete(id);
    }
    fallbackVideos = fallbackVideos.filter(v => v._id !== id);
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.delete('/:id', authMiddleware, handleDeleteVideo);
router.delete('/admin/videos/:id', authMiddleware, handleDeleteVideo);

module.exports = router;
