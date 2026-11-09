import React from 'react';
import { IconPlus } from '../../../assets/icons';

export const SkillsTab = ({
  skills,
  newSkill,
  setNewSkill,
  handleAddSkill,
  handleDeleteSkill,
  isSubmitting
}) => {
  return (
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
  );
};

