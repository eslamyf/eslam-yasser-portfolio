import React from 'react';

export const HeroNames = React.forwardRef(({ firstLetters, lastLetters }, ref) => {
  return (
    <div className="hero-ref__names" ref={ref} aria-hidden="true">
      <div className="hero-ref__name hero-ref__n1">
        <span className="hero-ref__mask">
          {firstLetters.map((char, index) => (
            <span key={index} className="hero-ref__ch">
              {char}
            </span>
          ))}
        </span>
      </div>
      <div className="hero-ref__name hero-ref__n2">
        <span className="hero-ref__mask">
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

