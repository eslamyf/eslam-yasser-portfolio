const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const jsonPath = path.join(__dirname, '../../assets/data/projects.json');

// Helper to read fallback JSON projects
const getFallbackProjects = () => {
  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    return JSON.parse(raw);
  }
  return [];
};

// Helper to write fallback JSON projects
const saveFallbackProjects = (projects) => {
  fs.writeFileSync(jsonPath, JSON.stringify(projects, null, 4), 'utf8');
};

// Check if MongoDB connection is ready
const isMongoReady = () => mongoose.connection.readyState === 1;

// @route   GET /api/projects
// @desc    Get all published projects (or all if admin query present)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { includeDrafts } = req.query;

    if (isMongoReady()) {
      let query = { status: 'published' };
      if (includeDrafts === 'true') {
        query = {};
      }
      const projects = await Project.find(query).sort({ orderIndex: 1, createdAt: -1 });
      return res.json({ success: true, count: projects.length, data: projects });
    } else {
      // Fallback mode using JSON file
      let projects = getFallbackProjects();
      if (includeDrafts !== 'true') {
        projects = projects.filter(p => p.status !== 'draft');
      }
      return res.json({ success: true, count: projects.length, data: projects });
    }
  } catch (error) {
    console.warn('MongoDB error, using fallback JSON projects:', error.message);
    const projects = getFallbackProjects();
    return res.json({ success: true, count: projects.length, data: projects });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    if (isMongoReady()) {
      const project = await Project.findById(req.params.id);
      if (project) return res.json({ success: true, data: project });
    }
    
    const projects = getFallbackProjects();
    const project = projects.find(p => p.id === req.params.id || p._id === req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== ADMIN PROTECTED ROUTES ====================

// @route   POST /api/admin/projects
// @desc    Create new project
// @access  Private (Admin)
router.post('/admin/projects', protect, async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      subtitle,
      fullDescription,
      image,
      date,
      demo,
      github,
      youtubeUrl,
      technologies,
      isFeatured,
      status,
      orderIndex
    } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Title, Category, and Description.'
      });
    }

    let parsedTech = [];
    if (Array.isArray(technologies)) {
      parsedTech = technologies;
    } else if (typeof technologies === 'string' && technologies.trim()) {
      parsedTech = technologies.split(',').map(t => t.trim());
    }

    let newProjectData = {
      title,
      category,
      description,
      subtitle: subtitle || '',
      fullDescription: fullDescription || '',
      image: image || 'assets/img/backend_api.jpg',
      date: date || new Date().getFullYear().toString(),
      demo: demo || '',
      github: github || '',
      youtubeUrl: youtubeUrl || '',
      technologies: parsedTech,
      isFeatured: isFeatured === true || isFeatured === 'true',
      status: status || 'published',
      orderIndex: orderIndex ? parseInt(orderIndex) : 0
    };

    if (isMongoReady()) {
      const newProject = new Project(newProjectData);
      await newProject.save();
      return res.status(201).json({
        success: true,
        message: 'Project created successfully! (تم إضافة المشروع بنجاح)',
        data: newProject
      });
    } else {
      const projects = getFallbackProjects();
      newProjectData.id = Date.now().toString();
      newProjectData._id = newProjectData.id;
      projects.unshift(newProjectData);
      saveFallbackProjects(projects);

      return res.status(201).json({
        success: true,
        message: 'Project created successfully! (تم إضافة المشروع بنجاح)',
        data: newProjectData
      });
    }
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating project' });
  }
});

// @route   PUT /api/admin/projects/:id
// @desc    Update project
// @access  Private (Admin)
router.put('/admin/projects/:id', protect, async (req, res) => {
  try {
    const id = req.params.id;

    if (isMongoReady()) {
      let project = await Project.findById(id);
      if (project) {
        if (req.body.technologies && typeof req.body.technologies === 'string') {
          req.body.technologies = req.body.technologies.split(',').map(t => t.trim());
        }
        project = await Project.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        return res.json({
          success: true,
          message: 'Project updated successfully! (تم تعديل المشروع بنجاح)',
          data: project
        });
      }
    }

    const projects = getFallbackProjects();
    const index = projects.findIndex(p => p.id === id || p._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    projects[index] = { ...projects[index], ...req.body };
    saveFallbackProjects(projects);

    res.json({
      success: true,
      message: 'Project updated successfully! (تم تعديل المشروع بنجاح)',
      data: projects[index]
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating project' });
  }
});

// @route   DELETE /api/admin/projects/:id
// @desc    Delete project
// @access  Private (Admin)
router.delete('/admin/projects/:id', protect, async (req, res) => {
  try {
    const id = req.params.id;

    if (isMongoReady()) {
      const project = await Project.findById(id);
      if (project) {
        await project.deleteOne();
        return res.json({ success: true, message: 'Project deleted successfully! (تم حذف المشروع بنجاح)' });
      }
    }

    let projects = getFallbackProjects();
    const initialLen = projects.length;
    projects = projects.filter(p => p.id !== id && p._id !== id);
    
    if (projects.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    saveFallbackProjects(projects);
    res.json({ success: true, message: 'Project deleted successfully! (تم حذف المشروع بنجاح)' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, message: 'Server error deleting project' });
  }
});

// @route   POST /api/admin/upload
// @desc    Upload project image
// @access  Private (Admin)
router.post('/admin/upload', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }
    const relativePath = `assets/img/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Image uploaded successfully!',
      filePath: relativePath
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
});

module.exports = router;
