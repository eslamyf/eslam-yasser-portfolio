import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/Toast';
import {
  projectApi,
  certificateApi,
  skillApi,
  journeyApi,
  inquiryApi,
  cvApi,
  authApi
} from '../api/client';
import {
  IconShield,
  IconCode,
  IconServer,
  IconMail,
  IconDownload,
  IconArrowUR,
  IconPlus,
  IconUsers,
  IconKey,
  IconCheck
} from '../assets/icons';

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
        .then((res) => {
          if (res.data?.success) setProjects(res.data.data || []);
        })
        .finally(() => setLoading(false));
    } else if (activeTab === 'skills') {
      setLoading(true);
      skillApi.getAll()
        .then((res) => {
          if (res.data?.success) setSkills(res.data.data || []);
        })
        .finally(() => setLoading(false));
    } else if (activeTab === 'certificates') {
      setLoading(true);
      certificateApi.getAll()
        .then((res) => {
          if (res.data?.success) setCertificates(res.data.data || []);
        })
        .finally(() => setLoading(false));
    } else if (activeTab === 'volunteering') {
      setLoading(true);
      journeyApi.getVolunteering()
        .then((res) => {
          if (res.data?.success) setVolunteering(res.data.data || []);
        })
        .finally(() => setLoading(false));
    } else if (activeTab === 'inquiries') {
      setLoading(true);
      inquiryApi.getAll()
        .then((res) => {
          if (res.data?.success) setInquiries(res.data.data || []);
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab, token]);

  // Project handlers
  const handleAddProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: newProject.title,
        category: newProject.category,
        subtitle: newProject.subtitle,
        description: newProject.description,
        demo: newProject.liveUrl,
        liveUrl: newProject.liveUrl,
        github: newProject.githubUrl,
        githubUrl: newProject.githubUrl,
        coverImage: newProject.coverImage || 'assets/img/backend_api.webp',
        technologies: newProject.technologies
          ? newProject.technologies.split(',').map((t) => t.trim()).filter(Boolean)
          : []
      };
      const res = await projectApi.create(payload);
      if (res.data?.success) {
        showToast('Project created successfully!');
        setProjects([res.data.data, ...projects]);
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
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectApi.delete(id);
      setProjects(projects.filter((p) => (p._id || p.id) !== id));
      showToast('Project deleted successfully');
    } catch (err) {
      showToast('Error deleting project');
    }
  };

  // Skill handlers
  const handleAddSkill = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: newSkill.name.trim(),
        category: newSkill.category.toLowerCase(),
        level: newSkill.level,
        proficiency: Number(newSkill.proficiency) || 85,
        icon: newSkill.icon || 'ri-code-line'
      };
      const res = await skillApi.create(payload);
      if (res.data?.success) {
        showToast('Skill added successfully!');
        setSkills([res.data.data, ...skills]);
        setNewSkill({
          name: '',
          category: 'frontend',
          level: 'Advanced',
          proficiency: 90,
          icon: 'ri-code-line'
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error adding skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await skillApi.delete(id);
      setSkills(skills.filter((s) => (s._id || s.id) !== id));
      showToast('Skill deleted');
    } catch (err) {
      showToast('Error deleting skill');
    }
  };

  // Certificate handlers
  const handleAddCert = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: newCert.title.trim(),
        title: newCert.title.trim(),
        issuer: newCert.issuer.trim(),
        issueDate: newCert.issueDate.trim() || '2026',
        credentialId: newCert.credentialId.trim(),
        credentialUrl: newCert.credentialUrl.trim(),
        link: newCert.credentialUrl.trim(),
        image: newCert.image.trim() || newCert.credentialUrl.trim(),
        skills: newCert.skills
          ? newCert.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : []
      };
      const res = await certificateApi.create(payload);
      if (res.data?.success) {
        showToast('Certificate added successfully!');
        setCertificates([res.data.data, ...certificates]);
        setNewCert({
          title: '',
          issuer: '',
          issueDate: '2026',
          credentialId: '',
          credentialUrl: '',
          skills: '',
          image: ''
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error adding certificate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCert = async (id) => {
    if (!window.confirm('Delete certificate?')) return;
    try {
      await certificateApi.delete(id);
      setCertificates(certificates.filter((c) => (c._id || c.id) !== id));
      showToast('Certificate deleted');
    } catch (err) {
      showToast('Error deleting certificate');
    }
  };

  // Volunteering handlers
  const handleAddVolunteering = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        role: newVolunteering.role.trim(),
        title: newVolunteering.role.trim(),
        organization: newVolunteering.organization.trim(),
        subtitle: newVolunteering.organization.trim(),
        startDate: newVolunteering.startDate.trim() || '2025',
        endDate: newVolunteering.endDate.trim() || 'Present',
        description: newVolunteering.description.trim()
      };
      const res = await journeyApi.createVolunteering(payload);
      if (res.data?.success) {
        showToast('Volunteering entry added!');
        setVolunteering([res.data.data, ...volunteering]);
        setNewVolunteering({
          role: '',
          organization: '',
          startDate: '2025',
          endDate: 'Present',
          description: ''
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error adding volunteering entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVolunteering = async (id) => {
    if (!window.confirm('Delete volunteering item?')) return;
    try {
      await journeyApi.deleteVolunteering(id);
      setVolunteering(volunteering.filter((v) => (v._id || v.id) !== id));
      showToast('Volunteering item deleted');
    } catch (err) {
      showToast('Error deleting item');
    }
  };

  // Inquiry handlers
  const handleDeleteInquiry = async (id) => {
    try {
      await inquiryApi.delete(id);
      setInquiries(inquiries.filter((inq) => (inq._id || inq.id) !== id));
      showToast('Message deleted');
    } catch (err) {
      showToast('Error deleting message');
    }
  };

  // CV upload handler
  const handleUploadCV = async (e) => {
    e.preventDefault();
    if (!cvFile) return;
    const formData = new FormData();
    formData.append('cv', cvFile);
    setIsSubmitting(true);
    try {
      const res = await cvApi.upload(formData);
      if (res.data?.success) {
        showToast('CV uploaded successfully!');
        setCvFile(null);
      }
    } catch (err) {
      showToast('Error uploading CV');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password change handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      showToast('New passwords do not match!');
      return;
    }
    if (passData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await authApi.changePassword({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      if (res.data?.success) {
        showToast('Password updated securely!');
        setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error changing password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems = [
    { id: 'projects', label: 'Projects', icon: IconCode, count: projects.length },
    { id: 'skills', label: 'Skills', icon: IconServer, count: skills.length },
    { id: 'certificates', label: 'Certificates', icon: IconShield, count: certificates.length },
    { id: 'volunteering', label: 'Volunteering', icon: IconUsers, count: volunteering.length },
    { id: 'inquiries', label: 'Inbox', icon: IconMail, count: inquiries.length },
    { id: 'cv', label: 'CV Document', icon: IconDownload },
    { id: 'security', label: 'Security & Auth', icon: IconKey }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* Top Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 2.5rem',
        borderBottom: '1px solid var(--line)',
        background: 'var(--surface)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'hsl(var(--brand) / 0.15)',
            color: 'hsl(var(--brand))'
          }}>
            <IconShield className="i" />
          </span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Eslam Yasser · CMS</h1>
              <span style={{
                fontSize: '0.72rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                background: 'rgba(52, 211, 153, 0.15)',
                color: '#34d399',
                fontWeight: 600
              }}>
                Security Verified
              </span>
            </div>
            <small style={{ color: 'var(--mut)' }}>Portfolio Control Center &bull; Logged in as {user?.username || 'admin'}</small>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="btn btn--ghost btn--sm">
            <span>View Live Site</span>
            <IconArrowUR className="i" />
          </Link>
          <button
            onClick={logout}
            className="btn btn--sm"
            style={{ border: '1px solid rgba(255, 75, 75, 0.4)', color: '#ff6b6b' }}
          >
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', minHeight: 'calc(100vh - 80px)' }}>
        {/* Sidebar Nav */}
        <aside style={{ borderRight: '1px solid var(--line)', padding: '1.5rem', background: 'var(--surface-2)' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1.1rem',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    background: isActive ? 'hsl(var(--brand) / 0.15)' : 'transparent',
                    color: isActive ? 'hsl(var(--brand))' : 'var(--mut)',
                    border: isActive ? '1px solid hsl(var(--brand) / 0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <Icon className="i" />
                    <span>{tab.label}</span>
                  </div>
                  {typeof tab.count === 'number' && (
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.1rem 0.5rem',
                      borderRadius: '10px',
                      background: isActive ? 'hsl(var(--brand) / 0.25)' : 'rgba(255,255,255,0.06)',
                      color: isActive ? 'hsl(var(--brand))' : 'var(--mut)'
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main style={{ padding: '2.5rem', overflowY: 'auto' }}>
          {loading && (
            <div style={{ padding: '1rem', color: 'hsl(var(--brand))', fontWeight: 600 }}>
              Loading data...
            </div>
          )}

          {/* TAB 1: PROJECTS */}
          {activeTab === 'projects' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Projects Management</h2>
                  <p style={{ color: 'var(--mut)', fontSize: '0.9rem', margin: '0.3rem 0 0 0' }}>Manage portfolio projects, live links, and technologies</p>
                </div>
                <span style={{ background: 'var(--surface)', padding: '0.4rem 0.9rem', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '0.85rem', color: 'var(--mut)' }}>
                  Total: {projects.length}
                </span>
              </div>

              {/* Add Project Form */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '18px', padding: '1.75rem', marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Add New Project</h3>
                <form onSubmit={handleAddProject} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Title *</label>
                    <input
                      type="text"
                      required
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      placeholder="e.g. Aqarlo Luxe"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Category</label>
                    <input
                      type="text"
                      value={newProject.category}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                      placeholder="e.g. MEAN Stack, Backend, Web App"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Subtitle</label>
                    <input
                      type="text"
                      value={newProject.subtitle}
                      onChange={(e) => setNewProject({ ...newProject, subtitle: e.target.value })}
                      placeholder="Short tagline or summary (e.g. Real Estate Management System)"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Detailed project explanation..."
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Technologies (comma separated)</label>
                    <input
                      type="text"
                      value={newProject.technologies}
                      onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                      placeholder="Angular, Node.js, MongoDB, TypeScript"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Cover Image URL</label>
                    <input
                      type="text"
                      value={newProject.coverImage}
                      onChange={(e) => setNewProject({ ...newProject, coverImage: e.target.value })}
                      placeholder="assets/img/backend_api.webp or https://..."
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>GitHub Code URL</label>
                    <input
                      type="url"
                      value={newProject.githubUrl}
                      onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                      placeholder="https://github.com/eslamyasser/..."
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Live Demo URL</label>
                    <input
                      type="url"
                      value={newProject.liveUrl}
                      onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                      placeholder="https://project-demo.com"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn btn--primary btn--sm" disabled={isSubmitting}>
                      <IconPlus className="i" />
                      <span>{isSubmitting ? 'Saving...' : 'Add Project'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Projects List */}
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {projects.map((proj) => {
                  const pId = proj._id || proj.id;
                  const techs = Array.isArray(proj.technologies) ? proj.technologies : (proj.tags || []);
                  return (
                    <div
                      key={pId}
                      style={{
                        padding: '1.5rem',
                        background: 'var(--surface)',
                        border: '1px solid var(--line)',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'hsl(var(--brand) / 0.15)', color: 'hsl(var(--brand))' }}>
                              {proj.category || 'Project'}
                            </span>
                            <h4 style={{ margin: 0, fontSize: '1.15rem' }}>{proj.title}</h4>
                          </div>
                          {proj.subtitle && <p style={{ color: 'var(--mut)', fontSize: '0.88rem', margin: 0 }}>{proj.subtitle}</p>}
                        </div>
                        <button
                          onClick={() => handleDeleteProject(pId)}
                          style={{
                            color: '#ff6b6b',
                            background: 'rgba(255, 75, 75, 0.08)',
                            border: '1px solid rgba(255, 75, 75, 0.3)',
                            borderRadius: '8px',
                            padding: '0.45rem 0.9rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600
                          }}
                        >
                          Delete
                        </button>
                      </div>

                      <p style={{ color: 'var(--ink)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                        {proj.description}
                      </p>

                      {techs.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                          {techs.map((t, idx) => (
                            <span key={idx} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'var(--surface-2)', color: 'var(--mut)', border: '1px solid var(--line)' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                        {(proj.githubUrl || proj.github) && (
                          <a href={proj.githubUrl || proj.github} target="_blank" rel="noreferrer" style={{ color: 'hsl(var(--brand))', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            GitHub Repository <IconArrowUR className="i" style={{ width: '14px', height: '14px' }} />
                          </a>
                        )}
                        {(proj.liveUrl || proj.demo) && (
                          <a href={proj.liveUrl || proj.demo} target="_blank" rel="noreferrer" style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            Live Demo <IconArrowUR className="i" style={{ width: '14px', height: '14px' }} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS */}
          {activeTab === 'skills' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Skills Management (الاسكليز)</h2>
                  <p style={{ color: 'var(--mut)', fontSize: '0.9rem', margin: '0.3rem 0 0 0' }}>Add, organize, and customize technical competencies and tools</p>
                </div>
                <span style={{ background: 'var(--surface)', padding: '0.4rem 0.9rem', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '0.85rem', color: 'var(--mut)' }}>
                  Total: {skills.length}
                </span>
              </div>

              {/* Add Skill Form */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '18px', padding: '1.75rem', marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Add New Skill</h3>
                <form onSubmit={handleAddSkill} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Skill Name *</label>
                    <input
                      type="text"
                      required
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      placeholder="e.g. Angular, Node.js, C++"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Category</label>
                    <select
                      value={newSkill.category}
                      onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    >
                      <option value="frontend">Frontend</option>
                      <option value="backend">Backend</option>
                      <option value="tools">Tools &amp; CS</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Level</label>
                    <select
                      value={newSkill.level}
                      onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    >
                      <option value="Advanced">Advanced (متقدم)</option>
                      <option value="Intermediate">Intermediate (متوسط)</option>
                      <option value="Basic">Basic (أساسي)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Proficiency %</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newSkill.proficiency}
                      onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                      placeholder="90"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 4' }}>
                    <button type="submit" className="btn btn--primary btn--sm" disabled={isSubmitting}>
                      <IconPlus className="i" />
                      <span>{isSubmitting ? 'Saving...' : 'Add Skill'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Skills Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {skills.map((s) => {
                  const sId = s._id || s.id;
                  const prof = s.proficiency || 85;
                  return (
                    <div
                      key={sId}
                      style={{
                        padding: '1.25rem',
                        background: 'var(--surface)',
                        border: '1px solid var(--line)',
                        borderRadius: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{s.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--mut)', textTransform: 'capitalize' }}>
                            {s.category} &bull; {s.level || 'Advanced'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteSkill(sId)}
                          style={{
                            color: '#ff6b6b',
                            background: 'transparent',
                            border: '1px solid rgba(255, 75, 75, 0.3)',
                            borderRadius: '6px',
                            padding: '0.3rem 0.6rem',
                            cursor: 'pointer',
                            fontSize: '0.78rem'
                          }}
                        >
                          Delete
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--mut)', marginBottom: '0.3rem' }}>
                          <span>Proficiency</span>
                          <span>{prof}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--surface-2)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${prof}%`, height: '100%', background: 'hsl(var(--brand))', borderRadius: '3px' }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Certificates Management (الشهايد)</h2>
                  <p style={{ color: 'var(--mut)', fontSize: '0.9rem', margin: '0.3rem 0 0 0' }}>Manage verified credentials, issuers, and badges</p>
                </div>
                <span style={{ background: 'var(--surface)', padding: '0.4rem 0.9rem', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '0.85rem', color: 'var(--mut)' }}>
                  Total: {certificates.length}
                </span>
              </div>

              {/* Add Certificate Form */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '18px', padding: '1.75rem', marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Add New Certificate</h3>
                <form onSubmit={handleAddCert} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Certificate Title *</label>
                    <input
                      type="text"
                      required
                      value={newCert.title}
                      onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                      placeholder="e.g. AWS Certified Solutions Architect"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Issuer / Organization *</label>
                    <input
                      type="text"
                      required
                      value={newCert.issuer}
                      onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                      placeholder="e.g. Amazon Web Services, NTI, Udemy, Creativa"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Issue Date / Year</label>
                    <input
                      type="text"
                      value={newCert.issueDate}
                      onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                      placeholder="e.g. July 2026 or 2026"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Credential ID</label>
                    <input
                      type="text"
                      value={newCert.credentialId}
                      onChange={(e) => setNewCert({ ...newCert, credentialId: e.target.value })}
                      placeholder="e.g. AWS-PSA-88231"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Credential / Verification Link</label>
                    <input
                      type="url"
                      value={newCert.credentialUrl}
                      onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
                      placeholder="https://..."
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Skills / Tags (comma separated)</label>
                    <input
                      type="text"
                      value={newCert.skills}
                      onChange={(e) => setNewCert({ ...newCert, skills: e.target.value })}
                      placeholder="Python, Algorithms, Cloud Architecture"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <button type="submit" className="btn btn--primary btn--sm" disabled={isSubmitting}>
                      <IconPlus className="i" />
                      <span>{isSubmitting ? 'Saving...' : 'Add Certificate'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Certificates List */}
              <div style={{ display: 'grid', gap: '1rem' }}>
                {certificates.map((cert) => {
                  const cId = cert._id || cert.id;
                  const title = cert.title || cert.name;
                  const issuer = cert.issuer || cert.subtitle || cert.organization;
                  const date = cert.issueDate || cert.year;
                  const link = cert.link || cert.credentialUrl;
                  return (
                    <div
                      key={cId}
                      style={{
                        padding: '1.25rem 1.5rem',
                        background: 'var(--surface)',
                        border: '1px solid var(--line)',
                        borderRadius: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h4>
                          <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'hsl(var(--brand) / 0.15)', color: 'hsl(var(--brand))' }}>
                            {issuer}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--mut)' }}>
                          <span>Date: {date || '2026'}</span>
                          {cert.credentialId && <span>ID: {cert.credentialId}</span>}
                          {link && (
                            <a href={link} target="_blank" rel="noreferrer" style={{ color: 'hsl(var(--brand))' }}>
                              View Credential &rarr;
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCert(cId)}
                        style={{
                          color: '#ff6b6b',
                          background: 'rgba(255, 75, 75, 0.08)',
                          border: '1px solid rgba(255, 75, 75, 0.3)',
                          borderRadius: '8px',
                          padding: '0.45rem 0.9rem',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: VOLUNTEERING */}
          {activeTab === 'volunteering' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Volunteering Activities (التطوع)</h2>
                  <p style={{ color: 'var(--mut)', fontSize: '0.9rem', margin: '0.3rem 0 0 0' }}>Manage community roles, mentoring, and student activities</p>
                </div>
                <span style={{ background: 'var(--surface)', padding: '0.4rem 0.9rem', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '0.85rem', color: 'var(--mut)' }}>
                  Total: {volunteering.length}
                </span>
              </div>

              {/* Add Volunteering Form */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '18px', padding: '1.75rem', marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Add Volunteering Activity</h3>
                <form onSubmit={handleAddVolunteering} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Role / Title *</label>
                    <input
                      type="text"
                      required
                      value={newVolunteering.role}
                      onChange={(e) => setNewVolunteering({ ...newVolunteering, role: e.target.value })}
                      placeholder="e.g. Head of PR Team, Technical Mentor"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Organization / Community *</label>
                    <input
                      type="text"
                      required
                      value={newVolunteering.organization}
                      onChange={(e) => setNewVolunteering({ ...newVolunteering, organization: e.target.value })}
                      placeholder="e.g. Students for Egypt, ClassMate Platform"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Start Date</label>
                    <input
                      type="text"
                      value={newVolunteering.startDate}
                      onChange={(e) => setNewVolunteering({ ...newVolunteering, startDate: e.target.value })}
                      placeholder="2025 or June 2025"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>End Date</label>
                    <input
                      type="text"
                      value={newVolunteering.endDate}
                      onChange={(e) => setNewVolunteering({ ...newVolunteering, endDate: e.target.value })}
                      placeholder="Present or 2026"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Description</label>
                    <textarea
                      rows={3}
                      value={newVolunteering.description}
                      onChange={(e) => setNewVolunteering({ ...newVolunteering, description: e.target.value })}
                      placeholder="Responsibilities, achievements, impact..."
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <button type="submit" className="btn btn--primary btn--sm" disabled={isSubmitting}>
                      <IconPlus className="i" />
                      <span>{isSubmitting ? 'Saving...' : 'Add Volunteering'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Volunteering List */}
              <div style={{ display: 'grid', gap: '1rem' }}>
                {volunteering.map((v) => {
                  const vId = v._id || v.id;
                  const role = v.role || v.title;
                  const org = v.organization || v.subtitle;
                  const period = v.period || v.time || `${v.startDate || '2025'} - ${v.endDate || 'Present'}`;
                  return (
                    <div
                      key={vId}
                      style={{
                        padding: '1.25rem 1.5rem',
                        background: 'var(--surface)',
                        border: '1px solid var(--line)',
                        borderRadius: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{role}</h4>
                          <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'hsl(var(--brand) / 0.15)', color: 'hsl(var(--brand))' }}>
                            {org}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--mut)' }}>{period}</span>
                        {v.description && <p style={{ fontSize: '0.9rem', color: 'var(--ink)', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>{v.description}</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteVolunteering(vId)}
                        style={{
                          color: '#ff6b6b',
                          background: 'rgba(255, 75, 75, 0.08)',
                          border: '1px solid rgba(255, 75, 75, 0.3)',
                          borderRadius: '8px',
                          padding: '0.45rem 0.9rem',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: INQUIRIES INBOX */}
          {activeTab === 'inquiries' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Inquiries Inbox</h2>
                  <p style={{ color: 'var(--mut)', fontSize: '0.9rem', margin: '0.3rem 0 0 0' }}>Client inquiries, project proposals, and messages</p>
                </div>
                <span style={{ background: 'var(--surface)', padding: '0.4rem 0.9rem', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '0.85rem', color: 'var(--mut)' }}>
                  Total: {inquiries.length}
                </span>
              </div>

              {inquiries.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--line)' }}>
                  <IconMail className="i" style={{ width: '40px', height: '40px', color: 'var(--mut)', marginBottom: '0.75rem' }} />
                  <p style={{ color: 'var(--mut)', margin: 0 }}>No inquiries in the inbox yet.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {inquiries.map((inq) => {
                    const inqId = inq._id || inq.id;
                    return (
                      <div
                        key={inqId}
                        style={{
                          padding: '1.5rem',
                          background: 'var(--surface)',
                          border: '1px solid var(--line)',
                          borderRadius: '16px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <div>
                            <b style={{ fontSize: '1.05rem', color: 'var(--ink)' }}>{inq.name}</b>
                            <span style={{ color: 'var(--mut)', fontSize: '0.88rem', marginLeft: '0.75rem' }}>&lt;{inq.email}&gt;</span>
                          </div>
                          <button
                            onClick={() => handleDeleteInquiry(inqId)}
                            style={{
                              color: '#ff6b6b',
                              background: 'transparent',
                              border: '1px solid rgba(255, 75, 75, 0.3)',
                              borderRadius: '6px',
                              padding: '0.3rem 0.7rem',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                        {inq.subject && (
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--brand))', marginBottom: '0.4rem' }}>
                            Subject: {inq.subject}
                          </div>
                        )}
                        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--ink)', lineHeight: '1.6', background: 'var(--surface-2)', padding: '1rem', borderRadius: '10px' }}>
                          {inq.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CV DOCUMENT */}
          {activeTab === 'cv' && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>CV Document Management</h2>
              <p style={{ color: 'var(--mut)', fontSize: '0.9rem', marginBottom: '2rem' }}>Upload your latest PDF CV for recruiters and clients to download directly</p>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '18px', padding: '2rem', maxWidth: '520px' }}>
                <form onSubmit={handleUploadCV}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Select new PDF Curriculum Vitae:
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setCvFile(e.target.files[0])}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: '1px solid var(--line)',
                      background: 'var(--surface-2)',
                      color: 'var(--ink)',
                      marginBottom: '1.25rem'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn--primary btn--sm"
                    disabled={!cvFile || isSubmitting}
                  >
                    <IconDownload className="i" />
                    <span>{isSubmitting ? 'Uploading...' : 'Upload & Activate CV'}</span>
                  </button>
                </form>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.9rem' }}>
                    <IconCheck className="i" />
                    <span>Current Active CV: EslamCV.pdf</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SECURITY & AUTH */}
          {activeTab === 'security' && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Security &amp; Credentials Center</h2>
              <p style={{ color: 'var(--mut)', fontSize: '0.9rem', marginBottom: '2rem' }}>Manage administrative credentials, token validity, and rate limits</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '960px' }}>
                {/* Change Password */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '18px', padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <IconKey className="i" style={{ color: 'hsl(var(--brand))' }} /> Change Password
                  </h3>
                  <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Current Password</label>
                      <input
                        type="password"
                        required
                        value={passData.currentPassword}
                        onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>New Password (min 6 characters)</label>
                      <input
                        type="password"
                        required
                        value={passData.newPassword}
                        onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={passData.confirmPassword}
                        onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                      />
                    </div>
                    <button type="submit" className="btn btn--primary btn--sm" disabled={isSubmitting} style={{ marginTop: '0.5rem' }}>
                      <IconShield className="i" />
                      <span>{isSubmitting ? 'Updating...' : 'Update Password'}</span>
                    </button>
                  </form>
                </div>

                {/* Security Overview & Protections */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '18px', padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Active Security Guardrails</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#34d399', marginTop: '2px' }}><IconCheck className="i" /></span>
                      <div>
                        <b style={{ display: 'block', fontSize: '0.95rem' }}>Bcrypt Password Hashing</b>
                        <small style={{ color: 'var(--mut)' }}>Salt rounds 10 with cryptographically secure one-way hashing</small>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#34d399', marginTop: '2px' }}><IconCheck className="i" /></span>
                      <div>
                        <b style={{ display: 'block', fontSize: '0.95rem' }}>JWT Bearer Authentication</b>
                        <small style={{ color: 'var(--mut)' }}>HMAC-SHA256 signed tokens with 7-day expiration and automatic invalidation on 401</small>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#34d399', marginTop: '2px' }}><IconCheck className="i" /></span>
                      <div>
                        <b style={{ display: 'block', fontSize: '0.95rem' }}>Brute-Force Rate Limiting</b>
                        <small style={{ color: 'var(--mut)' }}>Max 20 login attempts per 15-minute window on auth endpoints</small>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#34d399', marginTop: '2px' }}><IconCheck className="i" /></span>
                      <div>
                        <b style={{ display: 'block', fontSize: '0.95rem' }}>Helmet HTTP Security Headers</b>
                        <small style={{ color: 'var(--mut)' }}>X-Content-Type-Options, X-Frame-Options, and Strict-Transport-Security</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
