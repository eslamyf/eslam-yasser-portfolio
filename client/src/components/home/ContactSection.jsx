import React, { useState } from 'react';
import { inquiryApi } from '../../api/client';
import { useToast } from '../layout/Toast';
import {
  IconArrowUR,
  IconMail,
  IconCopy,
  IconWhatsapp,
  IconLinkedin,
  IconGithub
} from '../../assets/icons';

export const ContactSection = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({ state: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setStatus({ state: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setStatus({ state: 'loading', message: 'Sending message...' });

    try {
      const res = await inquiryApi.send(formData);
      if (res.data?.success) {
        setStatus({ state: 'success', message: 'Thank you! Your message has been sent successfully.' });
        setFormData({ name: '', email: '', message: '' });
        showToast('Message sent! I will reply shortly.');
      } else {
        setStatus({ state: 'error', message: res.data?.message || 'Failed to send message. Please try again.' });
      }
    } catch (err) {
      setStatus({
        state: 'error',
        message: 'Could not connect to server. Please email directly at eslam9076460@gmail.com'
      });
      window.location.href = `mailto:eslam9076460@gmail.com?subject=Contact from ${encodeURIComponent(formData.name)}&body=${encodeURIComponent(formData.message)}`;
    }
  };

  const copyEmail = () => {
    const email = 'eslam9076460@gmail.com';
    navigator.clipboard
      .writeText(email)
      .then(() => {
        showToast('Email copied to clipboard!');
      })
      .catch(() => {
        window.location.href = `mailto:${email}`;
      });
  };

  return (
    <section className="section contact" id="contact">
      <div className="wrap">
        <p className="kicker reveal is-in">
          <span>08</span> Contact
        </p>
        <h2 className="contact__title reveal is-in">
          Let's build<br />
          <span>something great.</span>
        </h2>

        <div className="contact__grid">
          <form className="form reveal is-in" id="contactForm" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <input
                id="fName"
                name="name"
                type="text"
                placeholder=" "
                required
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
              />
              <label htmlFor="fName">Your name</label>
              <span className="field__line"></span>
            </div>

            <div className="field">
              <input
                id="fEmail"
                name="email"
                type="email"
                placeholder=" "
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
              />
              <label htmlFor="fEmail">Your email</label>
              <span className="field__line"></span>
            </div>

            <div className="field">
              <textarea
                id="fMsg"
                name="message"
                rows="4"
                placeholder=" "
                required
                value={formData.message}
                onChange={handleChange}
              ></textarea>
              <label htmlFor="fMsg">Tell me about your project</label>
              <span className="field__line"></span>
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--lg"
              data-magnetic
              disabled={status.state === 'loading'}
            >
              <span>{status.state === 'loading' ? 'Sending...' : 'Send message'}</span>
              <IconArrowUR className="i" />
            </button>

            {status.message && (
              <p
                className="form__status"
                style={{
                  display: 'block',
                  color: status.state === 'error' ? '#ff5252' : status.state === 'success' ? 'var(--ok)' : 'var(--mut)',
                  marginTop: '1rem',
                  fontSize: '0.95rem'
                }}
                role="status"
              >
                {status.message}
              </p>
            )}
          </form>

          <div className="channels">
            <button
              className="channel reveal is-in"
              id="copyEmail"
              style={{ '--d': '.05s' }}
              type="button"
              onClick={copyEmail}
            >
              <IconMail className="i" />
              <div>
                <small>Email</small>
                <b>eslam9076460@gmail.com</b>
              </div>
              <span className="channel__act">
                <IconCopy className="i" />
              </span>
            </button>

            <a
              className="channel reveal is-in"
              style={{ '--d': '.12s' }}
              href="https://wa.me/201028103634"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsapp className="i" />
              <div>
                <small>WhatsApp</small>
                <b>+20 102 810 3634</b>
              </div>
              <span className="channel__act">
                <IconArrowUR className="i" />
              </span>
            </a>

            <a
              className="channel reveal is-in"
              style={{ '--d': '.19s' }}
              href="https://www.linkedin.com/in/eslam-yasser"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconLinkedin className="i i--fill" />
              <div>
                <small>LinkedIn</small>
                <b>/in/eslam-yasser</b>
              </div>
              <span className="channel__act">
                <IconArrowUR className="i" />
              </span>
            </a>

            <a
              className="channel reveal is-in"
              style={{ '--d': '.26s' }}
              href="https://github.com/eslamyasser"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconGithub className="i i--fill" />
              <div>
                <small>GitHub</small>
                <b>/eslamyasser</b>
              </div>
              <span className="channel__act">
                <IconArrowUR className="i" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
