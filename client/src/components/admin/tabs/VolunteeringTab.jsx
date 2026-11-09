import React from 'react';
import { IconPlus } from '../../../assets/icons';

export const VolunteeringTab = ({
  volunteering,
  newVolunteering,
  setNewVolunteering,
  handleAddVolunteering,
  handleDeleteVolunteering,
  isSubmitting
}) => {
  return (
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
  );
};

