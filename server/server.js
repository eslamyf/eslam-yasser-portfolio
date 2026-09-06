const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets & frontend files
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '../')));

// Database Connection & Initial Seeding
let isDbConnected = false;

connectDB().then(connected => {
  isDbConnected = connected;
  if (connected) {
    seedInitialData();
  }
});

// Helper function to seed initial admin user & existing projects from projects.json
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

    // 2. Seed Projects from projects.json if DB is empty
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      const projectsJsonPath = path.join(__dirname, '../assets/data/projects.json');
      if (fs.existsSync(projectsJsonPath)) {
        const rawData = fs.readFileSync(projectsJsonPath, 'utf8');
        const initialProjects = JSON.parse(rawData);
        
        for (let i = 0; i < initialProjects.length; i++) {
          const item = initialProjects[i];
          const project = new Project({
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
          await project.save();
        }
        console.log(`[Seed] Successfully imported ${initialProjects.length} projects from projects.json into MongoDB.`);
      }
    }
  } catch (error) {
    console.error('[Seed Error]:', error.message);
  }
}

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api', require('./routes/projectRoutes')); // for /api/admin/projects
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api', require('./routes/inquiryRoutes')); // for /api/admin/inquiries
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api', require('./routes/analyticsRoutes')); // for /api/admin/analytics

// Admin Dashboard route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin.html'));
});

// Fallback for single page app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
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
