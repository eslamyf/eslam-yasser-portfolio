import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../assets/Logo';

export const AdminHeader = ({ user, logout }) => {
  return (
    <header className="admin-header">
      <div className="admin-header__brand">
        <Logo size={42} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 className="admin-header__title">إسلام ياسر &bull; لوحة التحكم</h1>
            <span className="admin-header__badge">
              <i className="fa-solid fa-shield-halved" style={{ marginLeft: '0.35rem' }}></i>
              متصل ومحمٍ
            </span>
          </div>
          <div className="admin-header__sub">
            مركز الإدارة الشامل للموقع &bull; مرحباً، {user?.username || 'المسؤول'}
          </div>
        </div>
      </div>

      <div className="admin-header__actions">
        <Link to="/" className="btn btn--ghost btn--sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>زيارة الموقع</span>
          <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.85rem' }}></i>
        </Link>
        <button
          onClick={logout}
          className="btn btn--sm"
          style={{
            border: '1px solid rgba(255, 75, 75, 0.4)',
            color: '#ff6b6b',
            background: 'rgba(255, 75, 75, 0.08)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </header>
  );
};
