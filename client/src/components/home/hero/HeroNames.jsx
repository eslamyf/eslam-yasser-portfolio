import React from 'react';

export const HeroNames = React.forwardRef(({ firstLetters, lastLetters }, ref) => {
  return (
    <div className="hero-ref__names" ref={ref}>
      <div className="hero-ref__name hero-ref__n1" aria-label="Eslam">
        <span className="hero-ref__mask" aria-hidden="true">
          {firstLetters.map((char, index) => (
            <span key={index} className="hero-ref__ch">
              {char}
            </span>
          ))}
        </span>
      </div>
      <div className="hero-ref__name hero-ref__n2" aria-label="Yasser">
        <span className="hero-ref__mask" aria-hidden="true">
          {lastLetters.map((char, index) => (
            <span key={index} className="hero-ref__ch">
              {char}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
});

HeroNames.displayName = 'HeroNames';

