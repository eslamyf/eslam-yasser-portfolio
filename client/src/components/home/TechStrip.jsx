import React from 'react';

export const TechStrip = () => {
  const baseLogos = [
    { title: 'MongoDB', src: '/assets/img/tech-color/mongodb.svg' },
    { title: 'JavaScript', src: '/assets/img/tech-color/javascript.svg' },
    { title: 'HTML5', src: '/assets/img/tech-color/html5.svg' },
    { title: 'CSS3', src: '/assets/img/tech-color/css3.svg' },
    { title: 'Git', src: '/assets/img/tech-color/git.svg' },
    { title: 'GitHub', src: '/assets/img/tech-color/github.svg' },
    { title: 'Postman', src: '/assets/img/tech-color/postman.svg' },
    { title: 'Bootstrap', src: '/assets/img/tech-color/bootstrap.svg' },
    { title: 'C++', src: '/assets/img/tech-color/cplusplus.svg' },
    { title: 'Python', src: '/assets/img/tech-color/python.svg' },
    { title: 'Angular', src: '/assets/img/tech-color/angular.svg' },
    { title: 'React', src: '/assets/img/tech-color/react.svg' },
    { title: 'Node.js', src: '/assets/img/tech-color/nodedotjs.svg' },
    { title: 'Express', src: '/assets/img/tech-color/express.svg' },
    { title: 'TypeScript', src: '/assets/img/tech-color/typescript.svg' }
  ];

  // Repeat 3 times per group (~3000px wide) so the band extends well beyond 1920/2560px
  // and loops with 0 gaps, 0 lag, and continuous coverage at all times
  const logos = [...baseLogos, ...baseLogos, ...baseLogos];

  const handleImageError = (e, name) => {
    const parent = e.target.parentElement;
    if (parent) {
      parent.innerHTML = `<span class="logo__txt">${name}</span>`;
    }
  };

  return (
    <section className="strip" aria-label="Technologies I work with">
      <div className="strip__track">
        <ul className="strip__group">
          {logos.map((logo, i) => (
            <li key={`g1-${i}`} className={`logo ${logo.inv ? 'logo--inv' : ''}`} title={logo.title}>
              <img
                src={logo.src}
                alt={logo.title}
                width="34"
                height="34"
                loading={i < 8 ? "eager" : "lazy"}
                decoding="async"
                onError={(e) => handleImageError(e, logo.title)}
              />
            </li>
          ))}
        </ul>
        <ul className="strip__group" aria-hidden="true">
          {logos.map((logo, i) => (
            <li key={`g2-${i}`} className={`logo ${logo.inv ? 'logo--inv' : ''}`} title={logo.title}>
              <img
                src={logo.src}
                alt={logo.title}
                width="34"
                height="34"
                loading="lazy"
                decoding="async"
                onError={(e) => handleImageError(e, logo.title)}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
