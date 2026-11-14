import React, { useState, useEffect, useRef } from 'react';
import { initialStackLayers, initialBentoSkills } from '../../data/initialData';
import { skillApi } from '../../api/client';
import { IconCode, IconServer, IconCap, IconShield } from '../../assets/icons';

const renderTechIcon = (name) => {
  const lower = (name || '').toLowerCase();
  const iconPaths = {
    'angular': '/assets/img/tech-color/angular.svg',
    'typescript': '/assets/img/tech-color/typescript.svg',
    'javascript': '/assets/img/tech-color/javascript.svg',
    'html5': '/assets/img/tech-color/html5.svg',
    'css3': '/assets/img/tech-color/css3.svg',
    'bootstrap': '/assets/img/tech-color/bootstrap.svg',
    'node.js': '/assets/img/tech-color/nodedotjs.svg',
    'express.js': '/assets/img/tech-color/express.svg',
    'mongodb': '/assets/img/tech-color/mongodb.svg',
    'python': '/assets/img/tech-color/python.svg',
    'c++': '/assets/img/tech-color/cplusplus.svg',
    'git & github': '/assets/img/tech-color/github.svg',
    'github': '/assets/img/tech-color/github.svg',
    'git': '/assets/img/tech-color/git.svg',
    'postman': '/assets/img/tech-color/postman.svg',
    'react': '/assets/img/tech-color/react.svg',
  };

  if (iconPaths[lower]) {
    return (
      <img
        src={iconPaths[lower]}
        alt=""
        width="18"
        height="18"
        loading="lazy"
        className="tech-chip__img"
      />
    );
  }

  if (lower.includes('api')) {
    return (
      <svg className="tech-chip__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" />
        <circle cx="5" cy="19" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (lower.includes('auth') || lower.includes('jwt')) {
    return (
      <svg className="tech-chip__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  }
  if (lower.includes('rbac') || lower.includes('security')) {
    return (
      <svg className="tech-chip__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }
  if (lower.includes('structure') || lower.includes('tree')) {
    return (
      <svg className="tech-chip__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="3" />
        <circle cx="6" cy="19" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M12 8v4M9 16l3-4 3 4" />
      </svg>
    );
  }
  if (lower.includes('oop')) {
    return (
      <svg className="tech-chip__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    );
  }
  if (lower.includes('cloud')) {
    return (
      <svg className="tech-chip__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      </svg>
    );
  }
  if (lower.includes('responsive') || lower.includes('ui')) {
    return (
      <svg className="tech-chip__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="14" x="3" y="3" rx="2" />
        <path d="M7 21h10M12 17v4" />
      </svg>
    );
  }

  return (
    <svg className="tech-chip__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
};

export const ExplodedSkills = () => {
  const xsRef = useRef(null);
  const xsSceneRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState(0);
  const [filter, setFilter] = useState('all');
  const [bentoSkills, setBentoSkills] = useState(initialBentoSkills);

  useEffect(() => {
    skillApi.getAll().then((res) => {
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const dbSkills = res.data.data;
        const updated = {
          frontend: { ...initialBentoSkills.frontend, skills: [...initialBentoSkills.frontend.skills] },
          backend: { ...initialBentoSkills.backend, skills: [...initialBentoSkills.backend.skills] },
          foundations: { ...initialBentoSkills.foundations, skills: [...initialBentoSkills.foundations.skills] },
          workflow: { ...initialBentoSkills.workflow, skills: [...initialBentoSkills.workflow.skills] }
        };

        dbSkills.forEach((s) => {
          const cat = (s.category || '').toLowerCase();
          const skillObj = { name: s.name, core: (s.level || '').toLowerCase() === 'advanced' || (s.proficiency && s.proficiency >= 90) };
          if (cat === 'frontend') {
            if (!updated.frontend.skills.some((x) => x.name.toLowerCase() === s.name.toLowerCase())) {
              updated.frontend.skills.push(skillObj);
            }
          } else if (cat === 'backend') {
            if (!updated.backend.skills.some((x) => x.name.toLowerCase() === s.name.toLowerCase())) {
              updated.backend.skills.push(skillObj);
            }
          } else {
            if (!updated.workflow.skills.some((x) => x.name.toLowerCase() === s.name.toLowerCase()) &&
                !updated.foundations.skills.some((x) => x.name.toLowerCase() === s.name.toLowerCase())) {
              updated.workflow.skills.push(skillObj);
            }
          }
        });
        setBentoSkills(updated);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const xs = xsRef.current;
      const scene = xsSceneRef.current;
      if (!xs || !scene) return;

      const total = Math.max(xs.offsetHeight - window.innerHeight, 1);
      const p = Math.min(1, Math.max(0, -xs.getBoundingClientRect().top / total));

      let open = Math.min(1, Math.max(0, p / 0.3));
      open = 1 - Math.pow(1 - open, 3);

      const isMobile = window.innerWidth <= 860;
      const maxGap = isMobile ? 48 : 100;
      const currentGap = 10 + open * (maxGap - 10);
      scene.style.setProperty('--gap', currentGap.toFixed(1));
      scene.style.setProperty('--xr', p.toFixed(3));

      const idx = Math.min(
        initialStackLayers.length - 1,
        Math.max(0, Math.floor(Math.min(0.999, Math.max(0, (p - 0.05) / 0.9)) * initialStackLayers.length))
      );
      setActiveLayer(idx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section className="section skills" id="skills">
      <div className="wrap">
        <div className="section__head">
          <p className="kicker reveal is-in">
            <span>04</span> Toolbox
          </p>
          <h2 className="title reveal is-in">The stack I think in.</h2>
        </div>
      </div>

      <div className="xs" id="xs" ref={xsRef} style={{ '--layers': initialStackLayers.length }}>
        <div className="xs__pin">
          <div className="wrap xs__grid">
            <div className="xs__stage" aria-hidden="true">
              <div className="xs__scene" id="xsScene" ref={xsSceneRef}>
                {initialStackLayers.map((layer, i) => (
                  <div
                    key={i}
                    className={`slab ${activeLayer === i ? 'is-on' : ''}`}
                    style={{ '--i': i, '--a': layer.accent }}
                  >
                    <span className="slab__tag">{layer.tag}</span>
                    <span className="slab__label">{layer.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="xs__mobile-pills" role="tablist" aria-label="Skill layers">
              {initialStackLayers.map((layer, i) => (
                <button
                  key={i}
                  id={`xsTab-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={activeLayer === i}
                  aria-controls={`xsLayer-${i}`}
                  className={`xs__mobile-pill ${activeLayer === i ? 'is-active' : ''}`}
                  style={{ '--a': layer.accent }}
                  onClick={() => setActiveLayer(i)}
                >
                  {layer.name}
                </button>
              ))}
            </div>

            <div className="xs__list" id="xsList">
              {initialStackLayers.map((layer, i) => (
                <div
                  key={i}
                  id={`xsLayer-${i}`}
                  role="tabpanel"
                  aria-labelledby={`xsTab-${i}`}
                  className={`xs__item ${activeLayer === i ? 'is-on' : ''}`}
                  style={{ '--a': layer.accent }}
                  onClick={() => setActiveLayer(i)}
                >
                  <h3>
                    {layer.name}
                    <small>{layer.tag}</small>
                  </h3>
                  <div className="xs__body">
                    <div>
                      <p>{layer.desc}</p>
                      <ul className="tags">
                        {layer.tags.map((tag, tIdx) => (
                          <li key={tIdx}>{tag}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="wrap xs__more">
        <div className="xs__more-header reveal is-in">
          <div>
            <p className="kicker">
              <span>04.1</span> Arsenal
            </p>
            <h3 className="title title--sm">Engineering Tech Stack &amp; Tools</h3>
            <p className="xs__more-desc">
              From reactive client architectures to resilient distributed backend services, high-throughput databases, and core CS fundamentals.
            </p>
          </div>
        </div>

        <div className="filters reveal is-in" role="tablist" aria-label="Filter skills">
          <button
            className={`filter ${filter === 'all' ? 'is-active' : ''}`}
            onClick={() => setFilter('all')}
            role="tab"
            aria-selected={filter === 'all'}
          >
            All Stack <span className="filter__badge">{
              (bentoSkills.frontend?.skills?.length || 0) +
              (bentoSkills.backend?.skills?.length || 0) +
              (bentoSkills.foundations?.skills?.length || 0) +
              (bentoSkills.workflow?.skills?.length || 0)
            }</span>
          </button>
          <button
            className={`filter ${filter === 'frontend' ? 'is-active' : ''}`}
            onClick={() => setFilter('frontend')}
            role="tab"
            aria-selected={filter === 'frontend'}
          >
            Frontend <span className="filter__badge">{bentoSkills.frontend?.skills?.length || 0}</span>
          </button>
          <button
            className={`filter ${filter === 'backend' ? 'is-active' : ''}`}
            onClick={() => setFilter('backend')}
            role="tab"
            aria-selected={filter === 'backend'}
          >
            Backend <span className="filter__badge">{bentoSkills.backend?.skills?.length || 0}</span>
          </button>
          <button
            className={`filter ${filter === 'tools' ? 'is-active' : ''}`}
            onClick={() => setFilter('tools')}
            role="tab"
            aria-selected={filter === 'tools'}
          >
            Tools &amp; CS <span className="filter__badge">{
              (bentoSkills.foundations?.skills?.length || 0) +
              (bentoSkills.workflow?.skills?.length || 0)
            }</span>
          </button>
        </div>

        <div className="bento is-in" id="bento">
          {/* Frontend Cell */}
          <div
            className={`bento__cell bento__cell--lg ${filter !== 'all' && filter !== 'frontend' ? 'is-dim' : ''}`}
            data-group="frontend"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
            }}
          >
            <span className="bento__corner-mark" aria-hidden="true">+</span>
            <div className="bento__head-row">
              <div className="bento__icon-frame bento__icon-frame--blue">
                <IconCode className="i" />
              </div>
              <div className="bento__head-meta">
                <span className="bento__tag">Client-Side Architecture</span>
                <h3 className="bento__title">{bentoSkills.frontend.title}</h3>
              </div>
              <span className="bento__count">{bentoSkills.frontend.skills.length} Technologies</span>
            </div>
            <div className="tech-matrix">
              {bentoSkills.frontend.skills.map((s, i) => (
                <div key={i} className={`tech-card ${s.core ? 'is-core' : ''}`} style={{ '--k': i }}>
                  <div className="tech-card__icon">{renderTechIcon(s.name)}</div>
                  <span className="tech-card__name">{s.name}</span>
                  {s.core && (
                    <span className="tech-card__beacon" title="Core Daily Driver" aria-label="Core Daily Driver">
                      <span className="tech-card__ping"></span>
                      <span className="tech-card__dot"></span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Backend Cell */}
          <div
            className={`bento__cell bento__cell--lg ${filter !== 'all' && filter !== 'backend' ? 'is-dim' : ''}`}
            data-group="backend"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
            }}
          >
            <span className="bento__corner-mark" aria-hidden="true">+</span>
            <div className="bento__head-row">
              <div className="bento__icon-frame bento__icon-frame--emerald">
                <IconServer className="i" />
              </div>
              <div className="bento__head-meta">
                <span className="bento__tag">Distributed &amp; REST APIs</span>
                <h3 className="bento__title">{bentoSkills.backend.title}</h3>
              </div>
              <span className="bento__count">{bentoSkills.backend.skills.length} Technologies</span>
            </div>
            <div className="tech-matrix">
              {bentoSkills.backend.skills.map((s, i) => (
                <div key={i} className={`tech-card ${s.core ? 'is-core' : ''}`} style={{ '--k': i }}>
                  <div className="tech-card__icon">{renderTechIcon(s.name)}</div>
                  <span className="tech-card__name">{s.name}</span>
                  {s.core && (
                    <span className="tech-card__beacon" title="Core Daily Driver" aria-label="Core Daily Driver">
                      <span className="tech-card__ping"></span>
                      <span className="tech-card__dot"></span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CS Foundations */}
          <div
            className={`bento__cell ${filter !== 'all' && filter !== 'tools' ? 'is-dim' : ''}`}
            data-group="tools"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
            }}
          >
            <span className="bento__corner-mark" aria-hidden="true">+</span>
            <div className="bento__head-row">
              <div className="bento__icon-frame bento__icon-frame--amber">
                <IconCap className="i" />
              </div>
              <div className="bento__head-meta">
                <span className="bento__tag">Algorithms &amp; Core</span>
                <h3 className="bento__title">{bentoSkills.foundations.title}</h3>
              </div>
              <span className="bento__count">{bentoSkills.foundations.skills.length} Subjects</span>
            </div>
            <div className="tech-matrix">
              {bentoSkills.foundations.skills.map((s, i) => (
                <div key={i} className={`tech-card ${s.core ? 'is-core' : ''}`} style={{ '--k': i }}>
                  <div className="tech-card__icon">{renderTechIcon(s.name)}</div>
                  <span className="tech-card__name">{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow & DevOps */}
          <div
            className={`bento__cell ${filter !== 'all' && filter !== 'tools' ? 'is-dim' : ''}`}
            data-group="tools"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
            }}
          >
            <span className="bento__corner-mark" aria-hidden="true">+</span>
            <div className="bento__head-row">
              <div className="bento__icon-frame bento__icon-frame--violet">
                <IconShield className="i" />
              </div>
              <div className="bento__head-meta">
                <span className="bento__tag">CI/CD &amp; Storage</span>
                <h3 className="bento__title">{bentoSkills.workflow.title}</h3>
              </div>
              <span className="bento__count">{bentoSkills.workflow.skills.length} Tools</span>
            </div>
            <div className="tech-matrix">
              {bentoSkills.workflow.skills.map((s, i) => (
                <div key={i} className={`tech-card ${s.core ? 'is-core' : ''}`} style={{ '--k': i }}>
                  <div className="tech-card__icon">{renderTechIcon(s.name)}</div>
                  <span className="tech-card__name">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* High-Tech Status Bar */}
        <div className="bento__status-bar reveal is-in">
          <div className="bento__legend">
            <span className="bento__legend-item">
              <span className="tech-card__beacon is-static" aria-hidden="true">
                <span className="tech-card__dot"></span>
              </span>
              <span>Daily Production Driver (Primary Expertise)</span>
            </span>
            <span className="bento__legend-sep" aria-hidden="true">/</span>
            <span className="bento__legend-item">
              <span className="bento__legend-bullet" aria-hidden="true"></span>
              <span>Enterprise Modern Standards</span>
            </span>
          </div>
          <div className="bento__badge-pill">
            <span className="bento__badge-dot" aria-hidden="true"></span>
            <span>100% Type-Safe &amp; Scalable Architecture</span>
          </div>
        </div>
      </div>
    </section>
  );
};
