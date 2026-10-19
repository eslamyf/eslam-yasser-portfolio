import React, { useEffect, useRef } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CustomCursor } from '../components/layout/CustomCursor';
import { IntroLoader } from '../components/layout/IntroLoader';
import { HeroWorkstation } from '../components/home/HeroWorkstation';
import { TechStrip } from '../components/home/TechStrip';
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
      <IntroLoader />

      <Navbar />

      <main id="main">
        <HeroWorkstation />
        <TechStrip />
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
