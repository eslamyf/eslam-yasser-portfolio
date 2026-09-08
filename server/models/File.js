const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  storedName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  category: { type: String, enum: ['cv', 'certificate', 'video', 'image', 'document'], default: 'document' },
  relatedSection: { type: String, default: 'General' },
  status: { type: String, enum: ['active', 'archived'], default: 'active' }
}, {
  timestamps: true
});

module.exports = mongoose.model('File', fileSchema);
