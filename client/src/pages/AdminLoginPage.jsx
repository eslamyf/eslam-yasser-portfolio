import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/Toast';
import { Logo } from '../assets/Logo';

export const AdminLoginPage = () => {
  const { login, loading, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // If already logged in, redirect immediately to dashboard
  useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      showToast('مرحباً بك مجدداً في لوحة التحكم!', 'success');
      navigate('/admin/dashboard');
    } else {
      setError(res.message || 'بيانات الدخول غير صحيحة، يرجى المحاولة مجدداً');
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
      position: 'relative',
      boxSizing: 'border-box'
    }}>
      {/* Back to Portfolio Link */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px'
      }}>
        <Link to="/" className="btn btn--ghost btn--sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fa-solid fa-arrow-left"></i>
          <span>العودة للموقع (Portfolio)</span>
        </Link>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: '0 24px 60px -20px rgba(0,0,0,0.5)',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <Logo size={64} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 0.4rem 0' }}>
            لوحة تحكم المسؤول &bull; CMS
          </h2>
          <p style={{ color: 'var(--mut)', fontSize: '0.92rem', margin: 0 }}>
            تسجيل الدخول لإدارة محتوى ومشاريع الموقع
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.85rem 1rem',
            background: 'rgba(255, 75, 75, 0.12)',
            border: '1px solid rgba(255, 75, 75, 0.3)',
            borderRadius: '12px',
            color: '#ff6b6b',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem', textAlign: 'right' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--mut)', marginBottom: '0.5rem' }}>
              البريد الإلكتروني أو اسم المستخدم
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username or email"
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.5rem',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface-2)',
                  color: 'var(--ink)',
                  fontSize: '0.98rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  direction: 'ltr'
                }}
              />
              <i
                className="fa-solid fa-user"
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--mut)',
                  fontSize: '0.9rem'
                }}
              ></i>
            </div>
          </div>

          <div style={{ marginBottom: '1.75rem', textAlign: 'right' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--mut)', marginBottom: '0.5rem' }}>
              كلمة المرور
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.5rem',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface-2)',
                  color: 'var(--ink)',
                  fontSize: '0.98rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  direction: 'ltr'
                }}
              />
              <i
                className="fa-solid fa-lock"
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--mut)',
                  fontSize: '0.9rem'
                }}
              ></i>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>جاري التحقق والدخول...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket"></i>
                <span>تسجيل الدخول</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
