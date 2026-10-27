import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/Toast';
import { IconShield, IconArrowL } from '../assets/icons';
import { Logo } from '../assets/Logo';

export const AdminLoginPage = () => {
  const { login, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      showToast('Welcome back, Admin!');
      navigate('/admin/dashboard');
    } else {
      setError(res.message || 'Invalid credentials');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(circle at 50% 30%, hsl(var(--brand) / 0.15), transparent 70%), var(--bg)',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px'
      }}>
        <Link to="/" className="btn btn--ghost btn--sm">
          <IconArrowL className="i" />
          <span>Back to Portfolio</span>
        </Link>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: '0 24px 60px -20px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <Logo size={64} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            Admin Portal
          </h2>
          <p style={{ color: 'var(--mut)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            Sign in to manage your portfolio content
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(255, 75, 75, 0.12)',
            border: '1px solid rgba(255, 75, 75, 0.3)',
            borderRadius: '12px',
            color: '#ff6b6b',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mut)', marginBottom: '0.5rem' }}>
              Email Address or Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="eslam9076460@gmail.com or admin"
              required
              style={{
                width: '100%',
                padding: '0.9rem 1.1rem',
                borderRadius: '14px',
                border: '1px solid var(--line)',
                background: 'var(--surface-2)',
                color: 'var(--ink)',
                fontSize: '0.98rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mut)', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              style={{
                width: '100%',
                padding: '0.9rem 1.1rem',
                borderRadius: '14px',
                border: '1px solid var(--line)',
                background: 'var(--surface-2)',
                color: 'var(--ink)',
                fontSize: '0.98rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
