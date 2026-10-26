import React, { useState, useEffect, useRef } from 'react';
import { initialExperiences, initialEducation, initialVolunteering } from '../../data/initialData';
import { journeyApi } from '../../api/client';

export const JourneySection = () => {
  const [activeTab, setActiveTab] = useState('experience');
  const [experiences, setExperiences] = useState(initialExperiences);
  const [education, setEducation] = useState(initialEducation);
  const [volunteering, setVolunteering] = useState(initialVolunteering);
  const timelineRef = useRef(null);
  const fillRef = useRef(null);

  useEffect(() => {
    journeyApi.getExperiences().then((res) => {
      if (res.data?.success && res.data?.data?.length > 0) setExperiences(res.data.data);
    }).catch(() => {});

    journeyApi.getEducation().then((res) => {
      if (res.data?.success && res.data?.data?.length > 0) setEducation(res.data.data);
    }).catch(() => {});

    journeyApi.getVolunteering().then((res) => {
      if (res.data?.success && res.data?.data?.length > 0) setVolunteering(res.data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const tl = timelineRef.current;
      const fill = fillRef.current;
      if (!tl || !fill) return;

      const active = tl.querySelector('.panel.is-active');
      if (!active) return;

      const vh = window.innerHeight;
      const r = active.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.65 - r.top) / Math.max(r.height, 1)));
      fill.style.setProperty('--fill', p.toFixed(3));

      const dots = active.querySelectorAll('.tl');
      dots.forEach((dot) => {
        const dotDot = dot.querySelector('.tl__dot');
        if (dotDot) {
          const rect = dotDot.getBoundingClientRect();
          dot.classList.toggle('is-lit', rect.top < vh * 0.65);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, experiences, education, volunteering]);

  return (
    <section className="section journey" id="journey">
      <div className="wrap">
        <div className="section__head">
          <p className="kicker reveal is-in">
            <span>05</span> Journey
          </p>
          <h2 className="title reveal is-in">Experience &amp; education.</h2>
        </div>

        <div className="tabs reveal is-in" role="tablist" aria-label="Journey categories">
          <button
            className={`tab ${activeTab === 'experience' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'experience'}
            onClick={() => setActiveTab('experience')}
          >
            Experience
          </button>
          <button
            className={`tab ${activeTab === 'education' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'education'}
            onClick={() => setActiveTab('education')}
          >
            Education
          </button>
          <button
            className={`tab ${activeTab === 'volunteering' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'volunteering'}
            onClick={() => setActiveTab('volunteering')}
          >
            Volunteering
          </button>
        </div>

        <div className="timeline" id="timeline" ref={timelineRef}>
          <span className="timeline__line">
            <span className="timeline__fill" id="timelineFill" ref={fillRef}></span>
          </span>

          <ol className={`panel ${activeTab === 'experience' ? 'is-active' : ''}`} data-panel="experience">
            {experiences.map((item, i) => (
              <li key={item._id || i} className="tl">
                <span className="tl__dot"></span>
                <div className="tl__card">
                  <time>{item.time || item.period || 'Present'}</time>
                  <h3>{item.title || item.position}</h3>
                  <p className="tl__org">{item.org || item.company}</p>
                  <p>{item.desc || item.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <ol className={`panel ${activeTab === 'education' ? 'is-active' : ''}`} data-panel="education">
            {education.map((item, i) => (
              <li key={item._id || i} className="tl">
                <span className="tl__dot"></span>
                <div className="tl__card">
                  <time>{item.time || item.period || 'Present'}</time>
                  <h3>{item.title || item.degree}</h3>
                  <p className="tl__org">{item.org || item.institution}</p>
                  <p>{item.desc || item.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <ol className={`panel ${activeTab === 'volunteering' ? 'is-active' : ''}`} data-panel="volunteering">
            {volunteering.map((item, i) => (
              <li key={item._id || i} className="tl">
                <span className="tl__dot"></span>
                <div className="tl__card">
                  <time>{item.time || item.period || (item.startDate ? `${item.startDate} — ${item.endDate || 'Present'}` : 'Present')}</time>
                  <h3>{item.title || item.role}</h3>
                  <p className="tl__org">{item.org || item.organization}</p>
                  <p>{item.desc || item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};
