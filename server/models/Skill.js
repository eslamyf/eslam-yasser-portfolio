const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true, lowercase: true },
  level: { type: String, default: 'Advanced' },
  proficiency: { type: Number, default: 85 },
  icon: { type: String, default: 'ri-code-line' },
  status: { type: String, enum: ['published', 'draft'], default: 'published' },
  orderIndex: { type: Number, default: 1 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Skill', skillSchema);
