import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/Toast';
import {
  projectApi,
  certificateApi,
  skillApi,
  journeyApi,
  inquiryApi,
  cvApi
} from '../api/client';
import api from '../api/client';
import {
  IconCode,
  IconCap,
  IconMail,
  IconServer,
  IconKey,
  IconDownload,
  IconUsers
} from '../assets/icons';

import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { ProjectsTab } from '../components/admin/tabs/ProjectsTab';
import { SkillsTab } from '../components/admin/tabs/SkillsTab';
import { CertificatesTab } from '../components/admin/tabs/CertificatesTab';
import { VolunteeringTab } from '../components/admin/tabs/VolunteeringTab';
import { InquiriesTab } from '../components/admin/tabs/InquiriesTab';
import { CvTab } from '../components/admin/tabs/CvTab';
import { SecurityTab } from '../components/admin/tabs/SecurityTab';

export const AdminDashboard = () => {
  const { token, user, logout, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('projects');
  const [loading, setLoading] = useState(false);

  // Data states
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [skills, setSkills] = useState([]);
  const [volunteering, setVolunteering] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  // Form states
  const [newProject, setNewProject] = useState({
    title: '',
    category: 'MEAN Stack',
    subtitle: '',
    description: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    coverImage: ''
  });

  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'frontend',
    level: 'Advanced',
    proficiency: 90,
    icon: 'ri-code-line'
  });

  const [newCert, setNewCert] = useState({
    title: '',
    issuer: '',
    issueDate: '2026',
    credentialId: '',
    credentialUrl: '',
    skills: '',
    image: ''
  });

  const [newVolunteering, setNewVolunteering] = useState({
    role: '',
    organization: '',
    startDate: '2025',
    endDate: 'Present',
    description: ''
  });

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [cvFile, setCvFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Load data according to active tab
  useEffect(() => {
    if (!token) return;

    if (activeTab === 'projects') {
      setLoading(true);
      projectApi.getAll()
        .then(res => setProjects(res.data.data || res.data || []))
        .catch(err => showToast(err.response?.data?.message || 'Error fetching projects', 'error'))
        .finally(() => setLoading(false));
    } else if (activeTab === 'certificates') {
      setLoading(true);
      certificateApi.getAll()
        .then(res => setCertificates(res.data.data || res.data || []))
        .catch(err => showToast(err.response?.data?.message || 'Error fetching certificates', 'error'))
        .finally(() => setLoading(false));
    } else if (activeTab === 'skills') {
      setLoading(true);
      skillApi.getAll()
        .then(res => setSkills(res.data.data || res.data || []))
        .catch(err => showToast(err.response?.data?.message || 'Error fetching skills', 'error'))
        .finally(() => setLoading(false));
    } else if (activeTab === 'volunteering') {
      setLoading(true);
      journeyApi.getVolunteering()
        .then(res => setVolunteering(res.data.data || res.data || []))
        .catch(err => showToast(err.response?.data?.message || 'Error fetching volunteering', 'error'))
        .finally(() => setLoading(false));
    } else if (activeTab === 'inquiries') {
      setLoading(true);
      inquiryApi.getAll()
        .then(res => setInquiries(res.data.data || res.data || []))
        .catch(err => showToast(err.response?.data?.message || 'Error fetching inquiries', 'error'))
        .finally(() => setLoading(false));
    }
  }, [activeTab, token, showToast]);

  // --- Handlers ---
  const handleAddProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: newProject.title,
        category: newProject.category,
        subtitle: newProject.subtitle,
        description: newProject.description,
        technologies: newProject.technologies.split(',').map(t => t.trim()).filter(Boolean),
        githubUrl: newProject.githubUrl,
        liveUrl: newProject.liveUrl,
        coverImage: newProject.coverImage || 'assets/img/backend_api.webp',
        image: newProject.coverImage || 'assets/img/backend_api.webp'
      };
      await projectApi.create(payload);
      showToast('Project added successfully!', 'success');
      setNewProject({
        title: '',
        category: 'MEAN Stack',
        subtitle: '',
        description: '',
        technologies: '',
        githubUrl: '',
        liveUrl: '',
        coverImage: ''
      });
      const res = await projectApi.getAll();
      setProjects(res.data.data || res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add project', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectApi.delete(id);
      showToast('Project removed', 'success');
      setProjects(prev => prev.filter(p => (p._id || p.id) !== id));
    } catch (err) {
      showToast('Failed to delete project', 'error');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: newSkill.name,
        category: newSkill.category,
        level: newSkill.level,
        proficiency: Number(newSkill.proficiency) || 90,
        icon: newSkill.icon
      };
      await skillApi.create(payload);
      showToast('Skill added!', 'success');
      setNewSkill({
        name: '',
        category: 'frontend',
        level: 'Advanced',
        proficiency: 90,
        icon: 'ri-code-line'
      });
      const res = await skillApi.getAll();
      setSkills(res.data.data || res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add skill', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await skillApi.delete(id);
      showToast('Skill deleted', 'success');
      setSkills(prev => prev.filter(s => (s._id || s.id) !== id));
    } catch (err) {
      showToast('Failed to delete skill', 'error');
    }
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: newCert.title,
        issuer: newCert.issuer,
        issueDate: newCert.issueDate,
        credentialId: newCert.credentialId,
        credentialUrl: newCert.credentialUrl,
        skills: newCert.skills.split(',').map(s => s.trim()).filter(Boolean),
        image: newCert.image
      };
      await certificateApi.create(payload);
      showToast('Certificate added!', 'success');
      setNewCert({
        title: '',
        issuer: '',
        issueDate: '2026',
        credentialId: '',
        credentialUrl: '',
        skills: '',
        image: ''
      });
      const res = await certificateApi.getAll();
      setCertificates(res.data.data || res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add certificate', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCert = async (id) => {
    if (!window.confirm('Delete this certificate?')) return;
    try {
      await certificateApi.delete(id);
      showToast('Certificate deleted', 'success');
      setCertificates(prev => prev.filter(c => (c._id || c.id) !== id));
    } catch (err) {
      showToast('Failed to delete certificate', 'error');
    }
  };

  const handleAddVolunteering = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await journeyApi.createVolunteering(newVolunteering);
      showToast('Volunteering added!', 'success');
      setNewVolunteering({
        role: '',
        organization: '',
        startDate: '2025',
        endDate: 'Present',
        description: ''
      });
      const res = await journeyApi.getVolunteering();
      setVolunteering(res.data.data || res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add activity', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVolunteering = async (id) => {
    if (!window.confirm('Delete this volunteering record?')) return;
    try {
      await journeyApi.deleteVolunteering(id);
      showToast('Activity deleted', 'success');
      setVolunteering(prev => prev.filter(v => (v._id || v.id) !== id));
    } catch (err) {
      showToast('Failed to delete activity', 'error');
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await inquiryApi.delete(id);
      showToast('Message deleted', 'success');
      setInquiries(prev => prev.filter(m => (m._id || m.id) !== id));
    } catch (err) {
      showToast('Failed to delete message', 'error');
    }
  };

  const handleUploadCV = async (e) => {
    e.preventDefault();
    if (!cvFile) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('cv', cvFile);
      await cvApi.upload(formData);
      showToast('New CV uploaded & activated successfully!', 'success');
      setCvFile(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload CV file', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (passData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      showToast('Password updated successfully! Please re-login.', 'success');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => logout(), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems = [
    { id: 'projects', label: 'Projects (المشاريع)', icon: IconCode, count: projects.length },
    { id: 'skills', label: 'Skills (الاسكليز)', icon: IconServer, count: skills.length },
    { id: 'certificates', label: 'Certificates (الشهايد)', icon: IconCap, count: certificates.length },
    { id: 'volunteering', label: 'Volunteering (التطوع)', icon: IconUsers, count: volunteering.length },
    { id: 'inquiries', label: 'Inbox (الرسائل)', icon: IconMail, count: inquiries.length },
    { id: 'cv', label: 'CV Document (الـ CV)', icon: IconDownload },
    { id: 'security', label: 'Security & Auth', icon: IconKey }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <AdminHeader user={user} logout={logout} />

      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', minHeight: 'calc(100vh - 80px)' }}>
        <AdminSidebar navItems={navItems} activeTab={activeTab} setActiveTab={setActiveTab} />

        <main style={{ padding: '2.5rem', overflowY: 'auto' }}>
          {loading && (
            <div style={{ padding: '1rem', color: 'hsl(var(--brand))', fontWeight: 600 }}>
              Loading data...
            </div>
          )}

          {activeTab === 'projects' && (
            <ProjectsTab
              projects={projects}
              newProject={newProject}
              setNewProject={setNewProject}
              handleAddProject={handleAddProject}
              handleDeleteProject={handleDeleteProject}
              isSubmitting={isSubmitting}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsTab
              skills={skills}
              newSkill={newSkill}
              setNewSkill={setNewSkill}
              handleAddSkill={handleAddSkill}
              handleDeleteSkill={handleDeleteSkill}
              isSubmitting={isSubmitting}
            />
          )}

          {activeTab === 'certificates' && (
            <CertificatesTab
              certificates={certificates}
              newCert={newCert}
              setNewCert={setNewCert}
              handleAddCert={handleAddCert}
              handleDeleteCert={handleDeleteCert}
              isSubmitting={isSubmitting}
            />
          )}

          {activeTab === 'volunteering' && (
            <VolunteeringTab
              volunteering={volunteering}
              newVolunteering={newVolunteering}
              setNewVolunteering={setNewVolunteering}
              handleAddVolunteering={handleAddVolunteering}
              handleDeleteVolunteering={handleDeleteVolunteering}
              isSubmitting={isSubmitting}
            />
          )}

          {activeTab === 'inquiries' && (
            <InquiriesTab
              inquiries={inquiries}
              handleDeleteInquiry={handleDeleteInquiry}
            />
          )}

          {activeTab === 'cv' && (
            <CvTab
              cvFile={cvFile}
              setCvFile={setCvFile}
              handleUploadCV={handleUploadCV}
              isSubmitting={isSubmitting}
            />
          )}

          {activeTab === 'security' && (
            <SecurityTab
              passData={passData}
              setPassData={setPassData}
              handleChangePassword={handleChangePassword}
              isSubmitting={isSubmitting}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
