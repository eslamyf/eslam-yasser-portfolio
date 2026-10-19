import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/Toast';
import {
  projectApi,
  certificateApi,
  skillApi,
  inquiryApi,
  cvApi
} from '../api/client';
import {
  IconShield,
  IconCode,
  IconServer,
  IconMail,
  IconDownload,
  IconArrowUR,
  IconPlus
} from '../assets/icons';

export const AdminDashboard = () => {
  const { token, user, logout, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('projects');
  const [loading, setLoading] = useState(false);

  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [skills, setSkills] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  const [newProject, setNewProject] = useState({
    title: '',
    category: 'Full-Stack',
    description: '',
    technologies: '',
    githubUrl: '',
    liveUrl: ''
  });

  const [newCert, setNewCert] = useState({
    title: '',
    issuer: '',
    credentialUrl: '',
    skills: ''
  });

  const [cvFile, setCvFile] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!token) return;

    if (activeTab === 'projects') {
      setLoading(true);
      projectApi.getAll().then((res) => {
        if (res.data?.success) setProjects(res.data.data || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else if (activeTab === 'certificates') {
      setLoading(true);
      certificateApi.getAll().then((res) => {
        if (res.data?.success) setCertificates(res.data.data || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else if (activeTab === 'skills') {
      setLoading(true);
      skillApi.getAll().then((res) => {
        if (res.data?.success) setSkills(res.data.data || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else if (activeTab === 'inquiries') {
      setLoading(true);
      inquiryApi.getAll().then((res) => {
        if (res.data?.success) setInquiries(res.data.data || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [activeTab, token]);

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newProject,
        technologies: newProject.technologies.split(',').map((t) => t.trim()).filter(Boolean)
      };
      const res = await projectApi.create(payload);
      if (res.data?.success) {
        showToast('Project created successfully!');
        setProjects([res.data.data, ...projects]);
        setNewProject({ title: '', category: 'Full-Stack', description: '', technologies: '', githubUrl: '', liveUrl: '' });
      }
    } catch (err) {
      showToast('Error creating project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete project?')) return;
    try {
      await projectApi.delete(id);
      setProjects(projects.filter((p) => p._id !== id));
      showToast('Project deleted');
    } catch (err) {
      showToast('Error deleting project');
    }
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newCert,
        skills: newCert.skills.split(',').map((s) => s.trim()).filter(Boolean)
      };
      const res = await certificateApi.create(payload);
      if (res.data?.success) {
        showToast('Certificate added!');
        setCertificates([res.data.data, ...certificates]);
        setNewCert({ title: '', issuer: '', credentialUrl: '', skills: '' });
      }
    } catch (err) {
      showToast('Error adding certificate');
    }
  };

  const handleDeleteCert = async (id) => {
    if (!window.confirm('Delete certificate?')) return;
    try {
      await certificateApi.delete(id);
      setCertificates(certificates.filter((c) => c._id !== id));
      showToast('Certificate deleted');
    } catch (err) {
      showToast('Error deleting certificate');
    }
  };

  const handleDeleteInquiry = async (id) => {
    try {
      await inquiryApi.delete(id);
      setInquiries(inquiries.filter((inq) => inq._id !== id));
      showToast('Message deleted');
    } catch (err) {
      showToast('Error deleting message');
    }
  };

  const handleUploadCV = async (e) => {
    e.preventDefault();
    if (!cvFile) return;
    const formData = new FormData();
    formData.append('cv', cvFile);
    try {
      const res = await cvApi.upload(formData);
      if (res.data?.success) {
        showToast('CV uploaded successfully!');
        setCvFile(null);
      }
    } catch (err) {
      showToast('Error uploading CV');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 2.5rem',
        borderBottom: '1px solid var(--line)',
        background: 'var(--surface)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'hsl(var(--brand) / 0.15)',
            color: 'hsl(var(--brand))'
          }}>
            <IconShield className="i" />
          </span>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Eslam Yasser · CMS</h1>
            <small style={{ color: 'var(--mut)' }}>Full-Stack Portfolio Management</small>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="btn btn--ghost btn--sm">
            <span>View Live Site</span>
            <IconArrowUR className="i" />
          </Link>
          <button onClick={logout} className="btn btn--sm" style={{ border: '1px solid rgba(255, 75, 75, 0.4)', color: '#ff6b6b' }}>
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 'calc(100vh - 80px)' }}>
        <aside style={{ borderRight: '1px solid var(--line)', padding: '1.5rem', background: 'var(--surface-2)' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { id: 'projects', label: 'Projects', icon: IconCode },
              { id: 'certificates', label: 'Certificates', icon: IconShield },
              { id: 'inquiries', label: 'Inquiries Inbox', icon: IconMail },
              { id: 'cv', label: 'CV Document', icon: IconDownload }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.85rem 1.1rem',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    background: isActive ? 'hsl(var(--brand) / 0.15)' : 'transparent',
                    color: isActive ? 'hsl(var(--brand))' : 'var(--mut)',
                    border: isActive ? '1px solid hsl(var(--brand) / 0.3)' : '1px solid transparent',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  <Icon className="i" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main style={{ padding: '2.5rem', overflowY: 'auto' }}>
          {activeTab === 'projects' && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Projects</h2>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '18px', padding: '1.75rem', marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Add New Project</h3>
                <form onSubmit={handleAddProject} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Title</label>
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
                      placeholder="e.g. MEAN Stack"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Description</label>
                    <textarea
                      required
                      rows={3}
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Summary..."
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Technologies</label>
                    <input
                      type="text"
                      value={newProject.technologies}
                      onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                      placeholder="Angular, Node.js"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>GitHub URL</label>
                    <input
                      type="url"
                      value={newProject.githubUrl}
                      onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                      placeholder="https://github.com/..."
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <button type="submit" className="btn btn--primary btn--sm">
                      <IconPlus className="i" />
                      <span>Save Project</span>
                    </button>
                  </div>
                </form>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {projects.map((proj) => (
                  <div key={proj._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '14px' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{proj.title}</h4>
                      <p style={{ color: 'var(--mut)', fontSize: '0.85rem', marginTop: '0.35rem' }}>{proj.description}</p>
                    </div>
                    <button onClick={() => handleDeleteProject(proj._id)} style={{ color: '#ff6b6b', border: '1px solid rgba(255, 75, 75, 0.3)', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Certificates</h2>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '18px', padding: '1.75rem', marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Add Certificate</h3>
                <form onSubmit={handleAddCert} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Title</label>
                    <input
                      type="text"
                      required
                      value={newCert.title}
                      onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                      placeholder="Title..."
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '0.4rem' }}>Issuer</label>
                    <input
                      type="text"
                      value={newCert.issuer}
                      onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                      placeholder="Issuer..."
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <button type="submit" className="btn btn--primary btn--sm">
                      <IconPlus className="i" />
                      <span>Add Certificate</span>
                    </button>
                  </div>
                </form>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {certificates.map((cert) => (
                  <div key={cert._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '14px' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{cert.title}</h4>
                      <p style={{ color: 'var(--mut)', fontSize: '0.85rem' }}>{cert.issuer}</p>
                    </div>
                    <button onClick={() => handleDeleteCert(cert._id)} style={{ color: '#ff6b6b', border: '1px solid rgba(255, 75, 75, 0.3)', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Inquiries Inbox</h2>
              {inquiries.length === 0 ? (
                <p style={{ color: 'var(--mut)' }}>No messages yet.</p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {inquiries.map((inq) => (
                    <div key={inq._id} style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <b>{inq.name} ({inq.email})</b>
                        <button onClick={() => handleDeleteInquiry(inq._id)} style={{ color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                      </div>
                      <p>{inq.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'cv' && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>CV Document</h2>
              <form onSubmit={handleUploadCV} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '18px', padding: '1.75rem', maxWidth: '400px' }}>
                <input type="file" accept=".pdf" onChange={(e) => setCvFile(e.target.files[0])} style={{ marginBottom: '1rem' }} />
                <button type="submit" className="btn btn--primary btn--sm" disabled={!cvFile}>Upload CV</button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
