import React, { useState, useEffect, useRef } from 'react';
import { initialStackLayers, initialBentoSkills } from '../../data/initialData';
import { skillApi } from '../../api/client';
import { IconCode, IconServer, IconCap, IconShield } from '../../assets/icons';

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

      const maxGap = window.innerWidth <= 860 ? 58 : 104;
      const currentGap = 12 + open * (maxGap - 12);
      scene.style.setProperty('--gap', currentGap.toFixed(1));
      scene.style.setProperty('--xr', p.toFixed(3));

      const idx = Math.min(
        initialStackLayers.length - 1,
        Math.max(0, Math.floor(Math.min(0.999, Math.max(0, (p - 0.12) / 0.88)) * initialStackLayers.length))
      );
      setActiveLayer(idx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
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

      <div className="xs" id="xs" ref={xsRef}>
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

            <ol className="xs__list" id="xsList">
              {initialStackLayers.map((layer, i) => (
                <li
                  key={i}
                  className={`xs__item ${activeLayer === i ? 'is-on' : ''}`}
                  style={{ '--a': layer.accent }}
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
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="wrap xs__more">
        <h3 className="sub reveal is-in">Everything else in the toolbox</h3>

        <div className="filters reveal is-in" role="tablist" aria-label="Filter skills">
          <button
            className={`filter ${filter === 'all' ? 'is-active' : ''}`}
            onClick={() => setFilter('all')}
            role="tab"
            aria-selected={filter === 'all'}
          >
            All
          </button>
          <button
            className={`filter ${filter === 'frontend' ? 'is-active' : ''}`}
            onClick={() => setFilter('frontend')}
            role="tab"
            aria-selected={filter === 'frontend'}
          >
            Frontend
          </button>
          <button
            className={`filter ${filter === 'backend' ? 'is-active' : ''}`}
            onClick={() => setFilter('backend')}
            role="tab"
            aria-selected={filter === 'backend'}
          >
            Backend
          </button>
          <button
            className={`filter ${filter === 'tools' ? 'is-active' : ''}`}
            onClick={() => setFilter('tools')}
            role="tab"
            aria-selected={filter === 'tools'}
          >
            Tools &amp; CS
          </button>
        </div>

        <div className="bento is-in" id="bento">
          <div
            className={`bento__cell bento__cell--lg ${filter !== 'all' && filter !== 'frontend' ? 'is-dim' : ''}`}
            data-group="frontend"
          >
            <h3>
              <IconCode className="i" /> {bentoSkills.frontend.title}
            </h3>
            <ul className="chips">
              {bentoSkills.frontend.skills.map((s, i) => (
                <li key={i} className={`chip-s ${s.core ? 'is-core' : ''}`} style={{ '--k': i }}>
                  {s.name}
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`bento__cell bento__cell--lg ${filter !== 'all' && filter !== 'backend' ? 'is-dim' : ''}`}
            data-group="backend"
          >
            <h3>
              <IconServer className="i" /> {bentoSkills.backend.title}
            </h3>
            <ul className="chips">
              {bentoSkills.backend.skills.map((s, i) => (
                <li key={i} className={`chip-s ${s.core ? 'is-core' : ''}`} style={{ '--k': i }}>
                  {s.name}
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`bento__cell ${filter !== 'all' && filter !== 'tools' ? 'is-dim' : ''}`}
            data-group="tools"
          >
            <h3>
              <IconCap className="i" /> {bentoSkills.foundations.title}
            </h3>
            <ul className="chips">
              {bentoSkills.foundations.skills.map((s, i) => (
                <li key={i} className={`chip-s ${s.core ? 'is-core' : ''}`} style={{ '--k': i }}>
                  {s.name}
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`bento__cell ${filter !== 'all' && filter !== 'tools' ? 'is-dim' : ''}`}
            data-group="tools"
          >
            <h3>
              <IconShield className="i" /> {bentoSkills.workflow.title}
            </h3>
            <ul className="chips">
              {bentoSkills.workflow.skills.map((s, i) => (
                <li key={i} className={`chip-s ${s.core ? 'is-core' : ''}`} style={{ '--k': i }}>
                  {s.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="note reveal is-in">Highlighted chips are the tools I use every day.</p>
      </div>
    </section>
  );
};
