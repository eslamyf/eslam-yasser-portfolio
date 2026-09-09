const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { uploadToCloudinary, isCloudinaryConfigured, deleteFromCloudinary, extractPublicId } = require('../config/cloudinary');

const jsonPath = path.join(__dirname, '../../client/assets/data/projects.json');

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
      let projects = await Project.find(query).sort({ orderIndex: 1, createdAt: -1 });
      if (projects.length === 0) {
        projects = getFallbackProjects();
      }
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
      videoUrl,
      images,
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

    // Parse images array (may come as JSON string or comma-separated)
    let parsedImages = [];
    if (Array.isArray(images)) {
      parsedImages = images.filter(Boolean);
    } else if (typeof images === 'string' && images.trim()) {
      try { parsedImages = JSON.parse(images); } catch { parsedImages = images.split(',').map(s => s.trim()).filter(Boolean); }
    }

    let newProjectData = {
      title,
      category,
      description,
      subtitle: subtitle || '',
      fullDescription: fullDescription || '',
      image: image || 'assets/img/backend_api.jpg',
      images: parsedImages,
      date: date || new Date().getFullYear().toString(),
      demo: demo || '',
      github: github || '',
      youtubeUrl: youtubeUrl || '',
      videoUrl: videoUrl || '',
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
        // Parse images array if sent as string
        if (req.body.images && typeof req.body.images === 'string') {
          try { req.body.images = JSON.parse(req.body.images); } catch { req.body.images = req.body.images.split(',').map(s => s.trim()).filter(Boolean); }
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
// @desc    Upload single project image (local fallback or Cloudinary)
// @access  Private (Admin)
router.post('/admin/upload', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    // Try Cloudinary first
    if (isCloudinaryConfigured()) {
      const cloudResult = await uploadToCloudinary(req.file.path, 'portfolio/projects', 'image');
      if (cloudResult) {
        return res.json({
          success: true,
          message: 'Image uploaded to Cloudinary!',
          filePath: cloudResult.secure_url,
          cloudinaryUrl: cloudResult.secure_url,
          publicId: cloudResult.public_id
        });
      }
    }

    // Fallback to local storage
    const relativePath = `/uploads/projects/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Image uploaded locally!',
      filePath: relativePath
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
});

// @route   POST /api/admin/upload-multiple
// @desc    Upload multiple project images (gallery support)
// @access  Private (Admin)
router.post('/admin/upload-multiple', protect, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image' });
    }

    const uploadedUrls = [];

    for (const file of req.files) {
      if (isCloudinaryConfigured()) {
        const cloudResult = await uploadToCloudinary(file.path, 'portfolio/projects', 'image');
        if (cloudResult) {
          uploadedUrls.push({ url: cloudResult.secure_url, publicId: cloudResult.public_id });
          continue;
        }
      }
      // Fallback: local path
      uploadedUrls.push({ url: `/uploads/projects/${file.filename}`, publicId: null });
    }

    res.json({
      success: true,
      message: `${uploadedUrls.length} image(s) uploaded successfully!`,
      files: uploadedUrls,
      urls: uploadedUrls.map(f => f.url)
    });
  } catch (error) {
    console.error('Multi-upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload images' });
  }
});

module.exports = router;
