import React, { useEffect, useRef } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CustomCursor } from '../components/layout/CustomCursor';
import { HeroWorkstation } from '../components/home/HeroWorkstation';
import { AboutSection } from '../components/home/AboutSection';
import { ServicesSection } from '../components/home/ServicesSection';
import { ProjectsSection } from '../components/home/ProjectsSection';
import { ExplodedSkills } from '../components/home/ExplodedSkills';
import { JourneySection } from '../components/home/JourneySection';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { ContactSection } from '../components/home/ContactSection';
import { useMagnetic } from '../hooks/useMagnetic';
import { useTilt } from '../hooks/useTilt';

export const HomePage = () => {
  const pageRef = useRef(null);
  const progressRef = useRef(null);

  useMagnetic(pageRef);
  useTilt(pageRef);

  // Scroll Restoration on Refresh & Initial Load
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (window.location.hash) {
      const targetEl = document.querySelector(window.location.hash);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'instant' });
        return;
      }
    }

    const savedPos = sessionStorage.getItem('portfolio_scroll_pos');
    const targetY = savedPos !== null ? parseInt(savedPos, 10) : 0;

    if (targetY <= 30) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } else {
      const restorePos = () => {
        window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });
        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }
      };
      restorePos();
      requestAnimationFrame(restorePos);
      const t1 = setTimeout(restorePos, 60);
      const t2 = setTimeout(restorePos, 220);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  // Track scroll position continuously for accurate reload restoration
  useEffect(() => {
    let ticking = false;
    const savePosition = () => {
      sessionStorage.setItem('portfolio_scroll_pos', window.scrollY.toString());
      ticking = false;
    };

    const handleScrollSave = () => {
      if (!ticking) {
        requestAnimationFrame(savePosition);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScrollSave, { passive: true });
    window.addEventListener('beforeunload', savePosition);
    window.addEventListener('pagehide', savePosition);

    return () => {
      window.removeEventListener('scroll', handleScrollSave);
      window.removeEventListener('beforeunload', savePosition);
      window.removeEventListener('pagehide', savePosition);
    };
  }, []);

  // Smooth scroll handler for anchor links
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        if (window.history.pushState) {
          window.history.pushState(null, '', href);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTotal > 0 ? window.scrollY / scrollTotal : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={pageRef} className="home-wrapper">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="progress" id="progress" ref={progressRef} aria-hidden="true"></div>
      <CustomCursor />
      <div className="grain" aria-hidden="true"></div>

      <Navbar />

      <main id="main">
        <HeroWorkstation />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
        <ExplodedSkills />
        <JourneySection />
        <TestimonialsSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
};
