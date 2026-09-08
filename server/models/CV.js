const mongoose = require('mongoose');

const cvSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'Eslam Yasser - CV.pdf' },
  version: { type: String, default: '1.0' },
  pdfFile: { type: String, required: true },
  originalName: { type: String, required: true },
  fileSize: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('CV', cvSchema);
