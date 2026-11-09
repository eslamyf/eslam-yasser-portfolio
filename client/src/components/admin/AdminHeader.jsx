import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../assets/Logo';
import { IconArrowUR } from '../../assets/icons';

export const AdminHeader = ({ user, logout }) => {
  return (
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
        <Logo size={42} />
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
  );
};

