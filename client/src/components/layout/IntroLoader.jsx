import React, { useState, useEffect } from 'react';

export const IntroLoader = () => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHidden(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (hidden) return null;

  return (
    <div className="intro" aria-hidden="true">
      <div className="intro__mark">E</div>
      <div className="intro__bar">
        <i></i>
      </div>
    </div>
  );
};
