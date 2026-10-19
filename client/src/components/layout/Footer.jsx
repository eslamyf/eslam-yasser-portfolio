import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IconPin, IconArrowUp } from '../../assets/icons';

export const Footer = () => {
  const [cairoTime, setCairoTime] = useState('');
  const year = new Date().getFullYear();

  useEffect(() => {
    const updateTime = () => {
      try {
        const t = new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Africa/Cairo'
        }).format(new Date());
        setCairoTime(t ? `${t} local time` : '');
      } catch (e) {
        setCairoTime('');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer__giant" aria-hidden="true">ESLAM YASSER</div>
      <div className="wrap footer__row">
        <p>
          &copy; <span id="year">{year}</span> Eslam Yasser · Full-Stack MEAN Developer &amp; Web Instructor
        </p>
        <p className="footer__time">
          <IconPin className="i" /> Qena, Egypt · <span id="cairoTime">{cairoTime || '--:--'}</span>
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin" style={{ opacity: 0.25, fontSize: '0.8rem', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.target.style.opacity = 1} onMouseLeave={(e) => e.target.style.opacity = 0.25}>
            Admin Portal
          </Link>
          <a href="#home" onClick={scrollToTop} className="footer__top" aria-label="Back to top">
            <IconArrowUp className="i" />
          </a>
        </div>
      </div>
    </footer>
  );
};
