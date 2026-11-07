import React, { createContext, useContext, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#F6F4EF' : '#0A0E2E');
    }
  }, [theme]);

  const toggleTheme = (e) => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';

    // Get origin coordinates of the toggle button / click
    let x = window.innerWidth - 75;
    let y = 35;

    if (e) {
      if (typeof e.clientX === 'number' && e.clientX > 0 && typeof e.clientY === 'number' && e.clientY > 0) {
        x = e.clientX;
        y = e.clientY;
      } else if (e.currentTarget && typeof e.currentTarget.getBoundingClientRect === 'function') {
        const rect = e.currentTarget.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }
    }

    // Maximum distance from origin to furthest screen corner
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Modern native View Transitions API with circular diagonal reveal
    if (document.startViewTransition && !isReducedMotion) {
      const transition = document.startViewTransition(() => {
        document.documentElement.setAttribute('data-theme', nextTheme);
        try {
          localStorage.setItem('theme', nextTheme);
        } catch (err) {}
        flushSync(() => {
          setTheme(nextTheme);
        });
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 800,
            easing: 'cubic-bezier(0.2, 0, 0, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      });
      return;
    }

    // Elegant circular overlay fallback for browsers without View Transitions
    const overlay = document.createElement('div');
    overlay.className = 'theme-circle-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 999999;
      background: ${nextTheme === 'light' ? '#F6F4EF' : '#0A0E2E'};
      clip-path: circle(0px at ${x}px ${y}px);
      transition: clip-path 0.8s cubic-bezier(0.2, 0, 0, 1), opacity 0.3s ease 0.75s;
    `;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`;
    });

    setTimeout(() => {
      document.documentElement.setAttribute('data-theme', nextTheme);
      setTheme(nextTheme);
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
      }, 350);
    }, 700);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
