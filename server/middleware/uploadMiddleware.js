const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define uploads directory root inside server
const baseUploadDir = path.join(__dirname, '../uploads');

// Create subdirectories
const dirs = {
  images: path.join(baseUploadDir, 'images'),
  pdfs: path.join(baseUploadDir, 'pdfs'),
  videos: path.join(baseUploadDir, 'videos'),
  cv: path.join(baseUploadDir, 'cv'),
  documents: path.join(baseUploadDir, 'documents')
};

Object.values(dirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fileType = req.body.fileCategory || req.query.category || '';
    const isCv = fileType === 'cv' || req.baseUrl.includes('cv') || file.fieldname === 'cv' || (file.originalname && file.originalname.toLowerCase().includes('cv'));
    
    if (isCv) {
      cb(null, dirs.cv);
    } else if (file.mimetype.startsWith('image/')) {
      cb(null, dirs.images);
    } else if (file.mimetype === 'application/pdf') {
      cb(null, dirs.pdfs);
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, dirs.videos);
    } else {
      cb(null, dirs.documents);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const sanitizeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${sanitizeName}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'application/pdf',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Allowed: Images, PDFs, and Videos.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for video files
});

module.exports = {
  upload,
  baseUploadDir,
  dirs
};
