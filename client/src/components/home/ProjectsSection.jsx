import React, { useState, useEffect, useRef } from 'react';
import { initialProjects } from '../../data/initialData';
import { projectApi } from '../../api/client';
import { IconGithub, IconArrowUR } from '../../assets/icons';

export const ProjectsSection = () => {
  const [projects, setProjects] = useState(initialProjects);
  const stackRef = useRef(null);
  const termRef = useRef(null);

  useEffect(() => {
    projectApi
      .getAll()
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          const dbProjects = res.data.data.map((p, idx) => {
            const imgUrl = p.coverImage || p.image || '';
            const formattedImg = imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('/') ? `/${imgUrl}` : imgUrl;
            return {
              _id: p._id || p.id,
              no: `0${idx + 1}`,
              type: p.category || 'Full-Stack',
              accent: idx === 0 ? '205 100% 62%' : idx === 1 ? '28 100% 60%' : '150 80% 52%',
              title: p.title,
              subtitle: p.subtitle || p.shortDescription || '',
              description: p.description,
              tags: Array.isArray(p.technologies)
                ? p.technologies
                : (typeof p.technologies === 'string' ? p.technologies.split(/[\s,]+/).filter(Boolean) : (p.tags || ['Angular', 'Node.js', 'MongoDB'])),
              codeUrl: p.githubUrl || p.github || 'https://github.com/eslamyasser',
              liveUrl: p.liveUrl || p.demo || '',
              coverImage: formattedImg,
              mockType: p.mockType || (idx === 0 ? 'web' : idx === 1 ? 'phone' : 'term')
            };
          });
          setProjects(dbProjects);
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const term = termRef.current;
    if (!term) return;

    const lines = [
      '$ curl -X POST /api/auth/login',
      '→ 200 OK · JWT issued · 42ms',
      '$ curl /api/admin/users -H "Bearer …"',
      '→ 403 Forbidden · role: user',
      '$ curl /api/posts?limit=100 (×120)',
      '→ 429 Too Many Requests · rate limited',
      '$ upload avatar.png',
      '→ 201 Created · cdn.cloudinary.com/…'
    ];

    let running = true;
    const wait = (ms) => new Promise((res) => setTimeout(res, ms));

    const run = async () => {
      while (running) {
        term.innerHTML = '';
        for (let i = 0; i < lines.length && running; i++) {
          const line = lines[i];
          const span = document.createElement('span');
          span.className = line.startsWith('$')
            ? 'cmd'
            : line.includes('200') || line.includes('201')
              ? 'ok'
              : line.includes('403')
                ? 'err'
                : 'warn';
          term.appendChild(span);

          if (line.startsWith('$')) {
            for (let c = 0; c < line.length && running; c++) {
              span.textContent += line[c];
              await wait(18);
            }
            await wait(240);
          } else {
            span.textContent = line;
            await wait(450);
          }
          term.appendChild(document.createTextNode('\n'));
        }
        await wait(3000);
      }
    };

    run();
    return () => {
      running = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const stack = stackRef.current;
      if (!stack) return;
      const cards = stack.querySelectorAll('.proj');
      const vh = window.innerHeight;
      cards.forEach((card, i) => {
        const nextCard = cards[i + 1];
        if (nextCard) {
          const nextR = nextCard.getBoundingClientRect();
          const threshold = Math.max(card.offsetHeight * 0.75, 1);
          const diff = Math.max(0, Math.min(1, (vh - nextR.top) / threshold));
          const s = 1 - diff * 0.05;
          const b = 1 - diff * 0.15;
          card.style.setProperty('--s', s.toFixed(3));
          card.style.setProperty('--b', b.toFixed(3));
        } else {
          card.style.setProperty('--s', '1');
          card.style.setProperty('--b', '1');
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [projects]);

  return (
    <section className="section projects" id="projects">
      <div className="wrap">
        <div className="section__head">
          <p className="kicker reveal is-in">
            <span>03</span> Selected work
          </p>
          <h2 className="title reveal is-in">Projects I'm proud of.</h2>
        </div>
      </div>

      <div className="wrap stack" id="stack" ref={stackRef}>
        {projects.map((proj, i) => (
          <article
            key={proj._id || i}
            className="proj"
            style={{ '--accent': proj.accent || '205 100% 62%', '--n': i }}
          >
            <div className="proj__spot" aria-hidden="true"></div>
            <div className="proj__info">
              <div className="proj__meta">
                <span className="proj__no">{proj.no || `0${i + 1}`}</span>
                <span className="proj__type">{proj.type}</span>
              </div>
              <h3>{proj.title}</h3>
              {proj.subtitle && <p className="proj__sub">{proj.subtitle}</p>}
              <p className="proj__desc">{proj.description}</p>
              <ul className="tags">
                {proj.tags?.map((tag, tIdx) => (
                  <li key={tIdx}>{tag}</li>
                ))}
              </ul>
              <div className="proj__links">
                {proj.codeUrl && (
                  <a
                    href={proj.codeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--ghost btn--sm"
                    data-magnetic
                  >
                    <IconGithub className="i i--fill" />
                    <span>Code</span>
                  </a>
                )}
                {proj.liveUrl && (
                  <a
                    href={proj.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--primary btn--sm"
                    data-magnetic
                  >
                    <span>Live Demo</span>
                    <IconArrowUR className="i" />
                  </a>
                )}
              </div>
            </div>

            <div className="proj__shot">
              {proj.coverImage ? (
                <div className="mock mock--web mock--has-image">
                  <div className="mock__bar">
                    <i></i><i></i><i></i>
                    <span>
                      {proj.liveUrl
                        ? proj.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
                        : `${proj.title.toLowerCase().replace(/[^a-z0-9]/g, '')}.app`}
                    </span>
                  </div>
                  <div className="mock__body mock__body--image">
                    <img
                      src={proj.coverImage}
                      alt={proj.title}
                      className="mock__project-img"
                      loading="lazy"
                    />
                  </div>
                </div>
              ) : proj.mockType === 'web' ? (
                <div className="mock mock--web">
                  <div className="mock__bar">
                    <i></i><i></i><i></i>
                    <span>aqarlo.app/listings</span>
                  </div>
                  <div className="mock__body">
                    <div className="mock__hero">
                      <b></b><em></em><u>Find your place</u>
                    </div>
                    <div className="mock__cards">
                      <div><s></s><p>Villa · New Cairo</p><small>$420k</small></div>
                      <div><s></s><p>Penthouse · Zamalek</p><small>$310k</small></div>
                      <div><s></s><p>Studio · Maadi</p><small>$95k</small></div>
                    </div>
                  </div>
                </div>
              ) : proj.mockType === 'phone' ? (
                <div className="mock mock--phone">
                  <div className="phone">
                    <div className="phone__notch"></div>
                    <div className="phone__top">
                      <span>Deliver to <b>Campus Gate 2</b></span>
                      <i>3</i>
                    </div>
                    <div className="phone__chips">
                      <em className="on">Burgers</em>
                      <em>Pizza</em>
                      <em>Healthy</em>
                    </div>
                    <div className="phone__item">
                      <s></s>
                      <div><p>Smash Burger</p><small>Fav ♥ · 15 min</small></div>
                      <b>+</b>
                    </div>
                    <div className="phone__item">
                      <s></s>
                      <div><p>Margherita</p><small>Fav ♥ · 20 min</small></div>
                      <b>+</b>
                    </div>
                    <div className="phone__cart">View cart · 2 items</div>
                  </div>
                </div>
              ) : (
                <div className="mock mock--term">
                  <div className="mock__bar">
                    <i></i><i></i><i></i>
                    <span>api — zsh</span>
                  </div>
                  <pre className="term" ref={termRef} id="term"></pre>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
