const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // --- REQUIRED FIELDS (حقول إجبارية) ---
  title: {
    type: String,
    required: [true, 'Project title is required (عنوان المشروع مطلوب)'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Project category is required (تصنيف المشروع مطلوب)'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required (وصف المشروع مطلوب)'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Project image is required (صورة المشروع مطلوبة)'],
    default: 'assets/img/backend_api.jpg'
  },
  date: {
    type: String,
    required: [true, 'Project date is required (تاريخ المشروع مطلوب)'],
    default: '2026'
  },

  // --- OPTIONAL FIELDS (حقول اختيارية) ---
  subtitle: {
    type: String,
    default: '',
    trim: true
  },
  fullDescription: {
    type: String,
    default: '',
    trim: true
  },
  demo: {
    type: String,
    default: '',
    trim: true
  },
  github: {
    type: String,
    default: '',
    trim: true
  },
  youtubeUrl: {
    type: String,
    default: '',
    trim: true
  },
  youtubeId: {
    type: String,
    default: ''
  },
  technologies: {
    type: [String],
    default: []
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published'
  },
  orderIndex: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Helper to extract YouTube Video ID from full URLs
projectSchema.pre('save', function (next) {
  if (this.youtubeUrl) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = this.youtubeUrl.match(regExp);
    if (match && match[2].length === 11) {
      this.youtubeId = match[2];
    } else if (this.youtubeUrl.length === 11) {
      this.youtubeId = this.youtubeUrl;
    }
  } else {
    this.youtubeId = '';
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
