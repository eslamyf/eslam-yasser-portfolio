const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Base uploads directory inside server
const baseUploadDir = path.join(__dirname, '../uploads');

// Clean category directories
const dirs = {
  cv: path.join(baseUploadDir, 'cv'),
  certificates: path.join(baseUploadDir, 'certificates'),
  projects: path.join(baseUploadDir, 'projects'),
  documents: path.join(baseUploadDir, 'documents'),
  videos: path.join(baseUploadDir, 'videos'),
  images: path.join(baseUploadDir, 'images')
};

// Ensure all upload directories exist
Object.values(dirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const category = req.body.fileCategory || req.query.category || req.body.category || '';
    const fieldname = file.fieldname ? file.fieldname.toLowerCase() : '';
    const originalName = file.originalname ? file.originalname.toLowerCase() : '';

    if (category === 'cv' || fieldname === 'cv' || originalName.includes('cv') || req.baseUrl.includes('cv')) {
      cb(null, dirs.cv);
    } else if (category === 'certificates' || category === 'certificate' || fieldname === 'certificate' || req.baseUrl.includes('certificate')) {
      cb(null, dirs.certificates);
    } else if (category === 'projects' || category === 'project' || req.baseUrl.includes('project')) {
      cb(null, dirs.projects);
    } else if (file.mimetype.startsWith('image/')) {
      cb(null, dirs.images);
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, dirs.videos);
    } else if (file.mimetype === 'application/pdf') {
      cb(null, dirs.documents);
    } else {
      cb(null, dirs.documents);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_')
      .substring(0, 50);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    // PDFs & Documents
    'application/pdf', 'application/zip', 'application/x-zip-compressed',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Videos
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for videos and archives
});

module.exports = {
  upload,
  baseUploadDir,
  dirs
};
