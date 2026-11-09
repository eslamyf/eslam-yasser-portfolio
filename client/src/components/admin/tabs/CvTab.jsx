import React from 'react';
import { IconDownload, IconCheck } from '../../../assets/icons';

export const CvTab = ({
  cvFile,
  setCvFile,
  handleUploadCV,
  isSubmitting
}) => {
  return (
    <div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>CV Document Management</h2>
      <p style={{ color: 'var(--mut)', fontSize: '0.9rem', marginBottom: '2rem' }}>Upload your latest PDF CV for recruiters and clients to download directly</p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '18px', padding: '2rem', maxWidth: '520px' }}>
        <form onSubmit={handleUploadCV}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Select new PDF Curriculum Vitae:
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setCvFile(e.target.files[0])}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.75rem',
              borderRadius: '10px',
              border: '1px solid var(--line)',
              background: 'var(--surface-2)',
              color: 'var(--ink)',
              marginBottom: '1.25rem'
            }}
          />
          <button
            type="submit"
            className="btn btn--primary btn--sm"
            disabled={!cvFile || isSubmitting}
          >
            <IconDownload className="i" />
            <span>{isSubmitting ? 'Uploading...' : 'Upload & Activate CV'}</span>
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.9rem' }}>
            <IconCheck className="i" />
            <span>Current Active CV: EslamCV.pdf</span>
          </div>
        </div>
      </div>
    </div>
  );
};

