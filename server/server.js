const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load .env locally if available (from server dir or root dir)
try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {}

const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const Experience = require('./models/Experience');
const Education = require('./models/Education');
const Volunteering = require('./models/Volunteering');
const Certificate = require('./models/Certificate');
const Skill = require('./models/Skill');
const CV = require('./models/CV');
const Testimonial = require('./models/Testimonial');

// Initialize Express App
const app = express();

// 1. HTTP Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Prevents breaking CDNs (Google Fonts, RemixIcons, Swiper, GSAP, etc.)
  crossOriginEmbedderPolicy: false
}));

// 2. Strict Whitelist CORS Policy
const allowedOrigins = [
  'https://eslam-yasser-portfolio.vercel.app',
  'https://eslamyasser.github.io',
  'http://localhost:5000',
  'http://localhost:5500',
  'http://localhost:5501',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5501',
  'http://localhost:3000',
  'http://localhost:5173'
];

if (process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS !== '*') {
  process.env.ALLOWED_ORIGINS.split(',').forEach(o => {
    const trimmed = o.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) allowedOrigins.push(trimmed);
  });
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.ALLOWED_ORIGINS === '*' || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Access denied for this origin.'));
    }
  },
  credentials: true
}));

// 3. API Global Rate Limiter (300 requests per 15 mins per IP)
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP. Please try again after 15 minutes.' }
});
app.use('/api', globalApiLimiter);

// 4. Strict Rate Limiter for Authentication to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/admin/login', authLimiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request Logger for Audit and Live Debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Serve Static Assets & Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, '../client/public/assets')));
app.use('/assets', express.static(path.join(__dirname, '../client/assets')));
app.use(express.static(path.join(__dirname, '../client/public')));
app.use(express.static(path.join(__dirname, '../client')));

// Database Connection & Initial Seeding
let isDbConnected = false;

connectDB().then(connected => {
  isDbConnected = connected;
  if (connected) {
    seedInitialData();
  }
});

// Middleware to ensure Database is connected on Serverless invocations (Vercel)
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (e) {}
  }
  next();
});

// Helper function to seed initial admin user & default records from JSON files
async function seedInitialData() {
  try {
    // 1. Seed / Ensure Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || 'eslam9076460@gmail.com').toLowerCase().trim();
    const adminUsername = (process.env.ADMIN_USERNAME || 'admin').trim();
    let admin = await User.findOne({
      $or: [{ email: adminEmail }, { username: adminUsername }]
    });

    if (!admin) {
      admin = new User({
        username: adminUsername,
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD_HASH || '$2a$12$KzXzX/zQHH/tk58GGR7nKOAH9u./VNl1T3PdTlXSocn8CrylIQJW.',
        role: 'admin'
      });
      await admin.save();
      console.log(`[Seed] Admin User Created -> Username: "${adminUsername}", Email: "${adminEmail}"`);
    } else {
      let needsSave = false;
      if (!admin.email) {
        admin.email = adminEmail;
        needsSave = true;
      }
      if (process.env.ADMIN_PASSWORD_HASH && admin.password !== process.env.ADMIN_PASSWORD_HASH) {
        admin.password = process.env.ADMIN_PASSWORD_HASH;
        needsSave = true;
      }
      if (needsSave) {
        await admin.save();
        console.log(`[Seed] Admin User Updated -> Email & Hash synchronized.`);
      }
    }

    // 2. Seed Projects
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      const projectsJsonPath = path.join(__dirname, '../client/assets/data/projects.json');
      if (fs.existsSync(projectsJsonPath)) {
        const initialProjects = JSON.parse(fs.readFileSync(projectsJsonPath, 'utf8'));
        for (let i = 0; i < initialProjects.length; i++) {
          const item = initialProjects[i];
          const cover = item.coverImage || item.image || 'assets/img/backend_api.webp';
          const gal = item.gallery || item.images || [cover];
          await Project.create({
            title: item.title,
            category: item.category,
            subtitle: item.subtitle || '',
            description: item.description,
            date: item.date || '2026',
            coverImage: cover,
            image: cover,
            gallery: gal,
            images: gal,
            technologies: item.technologies || [],
            demo: item.demo || '',
            github: item.github || '',
            status: 'published',
            orderIndex: item.orderIndex || (i + 1)
          });
        }
        console.log(`[Seed] Imported ${initialProjects.length} projects.`);
      }
    }

    // 3. Seed Work Data (Experience, Education, Volunteering, Certificates)
    const workJsonPath = path.join(__dirname, '../client/assets/data/work.json');
    if (fs.existsSync(workJsonPath)) {
      const workData = JSON.parse(fs.readFileSync(workJsonPath, 'utf8'));

      if (await Experience.countDocuments() === 0 && workData.experience) {
        for (let i = 0; i < workData.experience.length; i++) {
          const item = workData.experience[i];
          const dates = item.year ? item.year.split('-') : ['2026', 'Present'];
          await Experience.create({
            title: item.title,
            company: item.subtitle || 'Company',
            startDate: dates[0] ? dates[0].trim() : '2026',
            endDate: dates[1] ? dates[1].trim() : 'Present',
            description: item.description || '',
            orderIndex: i + 1
          });
        }
        console.log('[Seed] Imported Experience records.');
      }

      if (await Education.countDocuments() === 0 && workData.education) {
        for (let i = 0; i < workData.education.length; i++) {
          const item = workData.education[i];
          const dates = item.year ? item.year.split('-') : ['2024', '2028'];
          await Education.create({
            degree: item.title,
            institution: item.subtitle || 'Qena University',
            startDate: dates[0] ? dates[0].trim() : '2024',
            endDate: dates[1] ? dates[1].trim() : '2028',
            description: item.description || '',
            orderIndex: i + 1
          });
        }
        console.log('[Seed] Imported Education records.');
      }

      if (await Volunteering.countDocuments() === 0 && workData.volunteering) {
        for (let i = 0; i < workData.volunteering.length; i++) {
          const item = workData.volunteering[i];
          const dates = item.year ? item.year.split('-') : ['2026', 'Present'];
          await Volunteering.create({
            role: item.title,
            organization: item.subtitle || 'Community',
            startDate: dates[0] ? dates[0].trim() : '2026',
            endDate: dates[1] ? dates[1].trim() : 'Present',
            description: item.description || '',
            orderIndex: i + 1
          });
        }
        console.log('[Seed] Imported Volunteering records.');
      }

      if (await Certificate.countDocuments() === 0 && workData.certificates) {
        for (let i = 0; i < workData.certificates.length; i++) {
          const item = workData.certificates[i];
          await Certificate.create({
            name: item.title || item.name,
            issuer: item.subtitle || item.issuer || 'NTI',
            issueDate: item.year || item.issueDate || '2026',
            credentialId: item.credentialId || '',
            description: item.description || '',
            image: item.image || '',
            pdfFile: item.pdfFile || '',
            originalPdfName: item.originalPdfName || '',
            orderIndex: item.orderIndex || (i + 1)
          });
        }
        console.log('[Seed] Imported Certificate records.');
      }
    }

    // 4. Seed Active CV if empty
    if (await CV.countDocuments() === 0) {
      await CV.create({
        name: 'EslamCV.pdf',
        version: 'v2.0',
        pdfFile: '/uploads/cv/EslamCV.pdf',
        originalName: 'EslamCV.pdf',
        fileSize: 74803,
        active: true
      });
      console.log('[Seed] Created default Active CV record.');
    }

    // 5. Seed Testimonials if empty
    if (await Testimonial.countDocuments() === 0) {
      const testimonialsJsonPath = path.join(__dirname, '../client/assets/data/testimonials.json');
      if (fs.existsSync(testimonialsJsonPath)) {
        const initialTestimonials = JSON.parse(fs.readFileSync(testimonialsJsonPath, 'utf8'));
        for (let i = 0; i < initialTestimonials.length; i++) {
          await Testimonial.create(initialTestimonials[i]);
        }
        console.log('[Seed] Imported Testimonials records.');
      }
    }

    // 6. Seed Skills if empty
    if (await Skill.countDocuments() === 0) {
      const defaultSkills = [
        { name: 'Angular', category: 'frontend', level: 'Advanced', proficiency: 90, icon: 'ri-angularjs-line', orderIndex: 1 },
        { name: 'TypeScript', category: 'frontend', level: 'Advanced', proficiency: 88, icon: 'ri-javascript-line', orderIndex: 2 },
        { name: 'JavaScript', category: 'frontend', level: 'Advanced', proficiency: 92, icon: 'ri-javascript-fill', orderIndex: 3 },
        { name: 'HTML5 & CSS3', category: 'frontend', level: 'Advanced', proficiency: 95, icon: 'ri-html5-line', orderIndex: 4 },
        { name: 'Bootstrap & Tailwind', category: 'frontend', level: 'Intermediate', proficiency: 85, icon: 'ri-layout-line', orderIndex: 5 },
        { name: 'Node.js', category: 'backend', level: 'Advanced', proficiency: 92, icon: 'ri-nodejs-line', orderIndex: 6 },
        { name: 'Express.js', category: 'backend', level: 'Advanced', proficiency: 90, icon: 'ri-server-line', orderIndex: 7 },
        { name: 'MongoDB', category: 'backend', level: 'Advanced', proficiency: 88, icon: 'ri-database-2-line', orderIndex: 8 },
        { name: 'REST APIs & JWT', category: 'backend', level: 'Advanced', proficiency: 90, icon: 'ri-shield-keyhole-line', orderIndex: 9 },
        { name: 'Data Structures & Algorithms', category: 'tools', level: 'Advanced', proficiency: 88, icon: 'ri-git-branch-line', orderIndex: 10 },
        { name: 'C++ & OOP', category: 'tools', level: 'Advanced', proficiency: 85, icon: 'ri-terminal-box-line', orderIndex: 11 },
        { name: 'Python', category: 'tools', level: 'Intermediate', proficiency: 80, icon: 'ri-code-box-line', orderIndex: 12 },
        { name: 'Git & GitHub', category: 'tools', level: 'Advanced', proficiency: 90, icon: 'ri-github-fill', orderIndex: 13 },
        { name: 'Cloudinary CDN', category: 'tools', level: 'Advanced', proficiency: 85, icon: 'ri-cloud-line', orderIndex: 14 }
      ];
      await Skill.insertMany(defaultSkills);
      console.log('[Seed] Imported default Skills records.');
    }

  } catch (error) {
    console.error('[Seed Error]:', error.message);
  }
}

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/experience', require('./routes/experienceRoutes'));
app.use('/api/experiences', require('./routes/experienceRoutes'));
app.use('/api/education', require('./routes/educationRoutes'));
app.use('/api/volunteering', require('./routes/volunteeringRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/cv', require('./routes/cvRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Serve React SPA bundle from client/dist if available
const clientDistPath = path.join(__dirname, '../client/dist');
const hasDist = fs.existsSync(clientDistPath);
if (hasDist) {
  app.use(express.static(clientDistPath));
}

// Single-page app fallback for all frontend routes (excluding /api and /uploads)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  if (hasDist) {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Start Server (Only when run directly and not in Vercel Serverless environment)
if (require.main === module && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
=====================================================
🚀 Full-Stack Portfolio Server Running!
📡 PORT: http://localhost:${PORT}
🔐 Admin Dashboard: http://localhost:${PORT}/admin
=====================================================
    `);
  });
}

module.exports = app;
