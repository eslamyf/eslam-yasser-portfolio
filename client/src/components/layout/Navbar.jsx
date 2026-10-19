import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { IconSun, IconMoon } from '../../assets/icons';

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pillRef = useRef(null);
  const indicatorRef = useRef(null);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'journey', label: 'Journey' },
    { id: 'proof', label: 'Proof' },
    { id: 'contact', label: 'Contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const sections = navItems.map(item => document.getElementById(item.id)).filter(Boolean);
      const scrollPos = window.scrollY + window.innerHeight * 0.35;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec.offsetTop <= scrollPos) {
          setActiveSection(sec.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!pillRef.current || !indicatorRef.current) return;
    const activeLink = pillRef.current.querySelector(`a[href="#${activeSection}"]`);
    if (activeLink) {
      const pillRect = pillRef.current.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      const left = linkRect.left - pillRect.left;
      const width = linkRect.width;
      indicatorRef.current.style.transform = `translateX(${left}px)`;
      indicatorRef.current.style.width = `${width}px`;
      indicatorRef.current.style.opacity = '1';
    }
  }, [activeSection]);

  const scrollTo = (e, id) => {
    e.preventDefault();
    setDrawerOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className={`nav ${isScrolled ? 'is-scrolled' : ''}`} id="nav">
        <a href="#home" onClick={(e) => scrollTo(e, 'home')} className="nav__logo" aria-label="Eslam Yasser — home">
          <span className="nav__mark">E</span>
          <span className="nav__name">Eslam</span>
        </a>

        <nav className="nav__pill" id="navPill" ref={pillRef} aria-label="Primary">
          <span className="nav__indicator" id="navIndicator" ref={indicatorRef} aria-hidden="true"></span>
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => scrollTo(e, item.id)}
              className={activeSection === item.id ? 'is-active' : ''}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <button
            type="button"
            className="theme"
            id="themeToggle"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            aria-pressed={theme === 'light'}
          >
            <IconSun className="i i-sun" />
            <IconMoon className="i i-moon" />
          </button>

          <a
            href="#contact"
            onClick={(e) => scrollTo(e, 'contact')}
            className="btn btn--sm btn--glow nav__cta"
            data-magnetic
          >
            <span>Hire me</span>
          </a>

          <button
            className="nav__burger"
            id="burger"
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            aria-controls="drawer"
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <div className={`drawer ${drawerOpen ? 'is-open' : ''}`} id="drawer" aria-hidden={!drawerOpen}>
        <nav aria-label="Mobile">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => scrollTo(e, item.id)}
              className={activeSection === item.id ? 'is-active' : ''}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
};
