import React, { useState } from 'react';
import { initialServices } from '../../data/initialData';
import { IconPlus } from '../../assets/icons';

export const ServicesSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex(prev => (prev === index ? -1 : index));
  };

  return (
    <section className="section services" id="services">
      <div className="wrap">
        <div className="section__head">
          <p className="kicker reveal is-in">
            <span>02</span> What I offer
          </p>
          <h2 className="title reveal is-in">Four ways I can help.</h2>
        </div>

        <ul className="svc-list" id="svcList">
          {initialServices.map((svc, i) => {
            const isOpen = openIndex === i;
            return (
              <li key={i} className={`svc ${isOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="svc__head"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                >
                  <span className="svc__num">{svc.num}</span>
                  <span className="svc__title">{svc.title}</span>
                  <span className="svc__icon">
                    <IconPlus className="i" />
                  </span>
                </button>
                <div className="svc__panel" style={{ maxHeight: isOpen ? '240px' : '0px', transition: 'max-height 0.4s var(--ease)' }}>
                  <div>
                    <p>{svc.desc}</p>
                    <ul className="tags">
                      {svc.tags.map((tag, tIdx) => (
                        <li key={tIdx}>{tag}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
