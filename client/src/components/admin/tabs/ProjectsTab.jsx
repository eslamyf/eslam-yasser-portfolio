import React from 'react';
import { IconPlus, IconArrowUR } from '../../../assets/icons';

export const ProjectsTab = ({
  projects,
  newProject,
  setNewProject,
  handleAddProject,
  handleDeleteProject,
  isSubmitting
}) => {
  return (
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
  );
};

