import React from 'react';
import { IconPlus } from '../../../assets/icons';

export const CertificatesTab = ({
  certificates,
  newCert,
  setNewCert,
  handleAddCert,
  handleDeleteCert,
  isSubmitting
}) => {
  return (
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
  );
};

