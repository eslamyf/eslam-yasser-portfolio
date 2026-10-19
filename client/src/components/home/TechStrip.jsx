import React from 'react';

export const TechStrip = () => {
  const logos = [
    { title: 'Angular', src: 'https://cdn.simpleicons.org/angular' },
    { title: 'React', src: 'https://cdn.simpleicons.org/react' },
    { title: 'TypeScript', src: 'https://cdn.simpleicons.org/typescript' },
    { title: 'Node.js', src: 'https://cdn.simpleicons.org/nodedotjs' },
    { title: 'Express', src: 'https://cdn.simpleicons.org/express/FFFFFF', inv: true },
    { title: 'MongoDB', src: 'https://cdn.simpleicons.org/mongodb' },
    { title: 'JavaScript', src: 'https://cdn.simpleicons.org/javascript' },
    { title: 'HTML5', src: 'https://cdn.simpleicons.org/html5' },
    { title: 'CSS3', src: 'https://cdn.simpleicons.org/css3/3C99DC' },
    { title: 'Git', src: 'https://cdn.simpleicons.org/git' },
    { title: 'GitHub', src: 'https://cdn.simpleicons.org/github/FFFFFF', inv: true },
    { title: 'Postman', src: 'https://cdn.simpleicons.org/postman' },
    { title: 'Bootstrap', src: 'https://cdn.simpleicons.org/bootstrap' },
    { title: 'C++', src: 'https://cdn.simpleicons.org/cplusplus/659AD2' },
    { title: 'Python', src: 'https://cdn.simpleicons.org/python/4B8BBE' }
  ];

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
            <li key={i} className={`logo ${logo.inv ? 'logo--inv' : ''}`} title={logo.title}>
              <img
                src={logo.src}
                alt={logo.title}
                width="34"
                height="34"
                loading="lazy"
                onError={(e) => handleImageError(e, logo.title)}
              />
            </li>
          ))}
        </ul>
        <ul className="strip__group" aria-hidden="true">
          {logos.map((logo, i) => (
            <li key={`dup-${i}`} className={`logo ${logo.inv ? 'logo--inv' : ''}`} title={logo.title}>
              <img
                src={logo.src}
                alt={logo.title}
                width="34"
                height="34"
                loading="lazy"
                onError={(e) => handleImageError(e, logo.title)}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
