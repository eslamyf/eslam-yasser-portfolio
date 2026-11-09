import React from 'react';
import { IconKey, IconShield, IconCheck } from '../../../assets/icons';

export const SecurityTab = ({
  passData,
  setPassData,
  handleChangePassword,
  isSubmitting
}) => {
  return (
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
  );
};

