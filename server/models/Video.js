const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  videoFile: { type: String, required: true },
  originalVideoName: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
  category: { type: String, default: 'Demo' },
  date: { type: String, default: '' },
  status: { type: String, enum: ['published', 'draft'], default: 'published' },
  orderIndex: { type: Number, default: 1 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Video', videoSchema);
