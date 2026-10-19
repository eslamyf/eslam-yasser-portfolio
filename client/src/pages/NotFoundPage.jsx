import React from 'react';
import { Link } from 'react-router-dom';
import { IconArrowL } from '../assets/icons';

export const NotFoundPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      background: 'var(--bg)',
      color: 'var(--ink)'
    }}>
      <h1 style={{
        fontSize: 'clamp(5rem, 15vw, 10rem)',
        fontWeight: 800,
        fontFamily: 'var(--font-display)',
        background: 'linear-gradient(120deg, hsl(var(--brand)), hsl(var(--cyan)))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: 0
      }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.75rem', marginTop: '1rem', marginBottom: '0.5rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--mut)', maxWidth: '420px', marginBottom: '2rem' }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn--primary" data-magnetic>
        <IconArrowL className="i" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};
