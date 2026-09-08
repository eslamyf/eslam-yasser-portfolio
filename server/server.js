const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const Experience = require('./models/Experience');
const Education = require('./models/Education');
const Volunteering = require('./models/Volunteering');
const Certificate = require('./models/Certificate');
const Skill = require('./models/Skill');
const CV = require('./models/CV');

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Assets & Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, '../client/assets/img/uploads')));
app.use('/assets', express.static(path.join(__dirname, '../client/assets')));
app.use(express.static(path.join(__dirname, '../client')));

// Database Connection & Initial Seeding
let isDbConnected = false;

connectDB().then(connected => {
  isDbConnected = connected;
  if (connected) {
    seedInitialData();
  }
});

// Helper function to seed initial admin user & default records from JSON files
async function seedInitialData() {
  try {
    // 1. Seed Admin User
    const adminCount = await User.countDocuments();
    if (adminCount === 0) {
      const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
      const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const admin = new User({
        username: defaultUsername,
        password: defaultPassword,
        role: 'admin'
      });
      await admin.save();
      console.log(`[Seed] Default Admin Created -> Username: "${defaultUsername}", Password: "${defaultPassword}"`);
    }

    // 2. Seed Projects
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      const projectsJsonPath = path.join(__dirname, '../client/assets/data/projects.json');
      if (fs.existsSync(projectsJsonPath)) {
        const initialProjects = JSON.parse(fs.readFileSync(projectsJsonPath, 'utf8'));
        for (let i = 0; i < initialProjects.length; i++) {
          const item = initialProjects[i];
          await Project.create({
            title: item.title,
            category: item.category,
            subtitle: item.subtitle || '',
            description: item.description,
            date: item.date || '2026',
            image: item.image || 'assets/img/backend_api.jpg',
            demo: item.demo || '',
            github: item.github || '',
            status: 'published',
            orderIndex: i + 1
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
            name: item.title,
            issuer: item.subtitle || 'NTI',
            issueDate: item.year || '2026',
            description: item.description || '',
            orderIndex: i + 1
          });
        }
        console.log('[Seed] Imported Certificate records.');
      }
    }

    // 4. Seed Active CV if empty
    if (await CV.countDocuments() === 0) {
      await CV.create({
        name: 'Eslam Yasser - Resume.pdf',
        version: '1.0',
        pdfFile: '/assets/pdf/Eslam_Yasser_Resume.pdf',
        originalName: 'Eslam_Yasser_Resume.pdf',
        active: true
      });
      console.log('[Seed] Created default Active CV record.');
    }

  } catch (error) {
    console.error('[Seed Error]:', error.message);
  }
}

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/experience', require('./routes/experienceRoutes'));
app.use('/api/education', require('./routes/educationRoutes'));
app.use('/api/volunteering', require('./routes/volunteeringRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/cv', require('./routes/cvRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Admin Dashboard route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/admin.html'));
});

// Fallback for single page app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
=====================================================
🚀 Full-Stack Portfolio Server Running!
📡 PORT: http://localhost:${PORT}
🔐 Admin Dashboard: http://localhost:${PORT}/admin
=====================================================
  `);
});
