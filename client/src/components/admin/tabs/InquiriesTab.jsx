import React from 'react';
import { IconMail } from '../../../assets/icons';

export const InquiriesTab = ({ inquiries, handleDeleteInquiry }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Inquiries Inbox</h2>
          <p style={{ color: 'var(--mut)', fontSize: '0.9rem', margin: '0.3rem 0 0 0' }}>Client inquiries, project proposals, and messages</p>
        </div>
        <span style={{ background: 'var(--surface)', padding: '0.4rem 0.9rem', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '0.85rem', color: 'var(--mut)' }}>
          Total: {inquiries.length}
        </span>
      </div>

      {inquiries.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--line)' }}>
          <IconMail className="i" style={{ width: '40px', height: '40px', color: 'var(--mut)', marginBottom: '0.75rem' }} />
          <p style={{ color: 'var(--mut)', margin: 0 }}>No inquiries in the inbox yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {inquiries.map((inq) => {
            const inqId = inq._id || inq.id;
            return (
              <div
                key={inqId}
                style={{
                  padding: '1.5rem',
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div>
                    <b style={{ fontSize: '1.05rem', color: 'var(--ink)' }}>{inq.name}</b>
                    <span style={{ color: 'var(--mut)', fontSize: '0.88rem', marginLeft: '0.75rem' }}>&lt;{inq.email}&gt;</span>
                  </div>
                  <button
                    onClick={() => handleDeleteInquiry(inqId)}
                    style={{
                      color: '#ff6b6b',
                      background: 'transparent',
                      border: '1px solid rgba(255, 75, 75, 0.3)',
                      borderRadius: '6px',
                      padding: '0.3rem 0.7rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
                {inq.subject && (
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--brand))', marginBottom: '0.4rem' }}>
                    Subject: {inq.subject}
                  </div>
                )}
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--ink)', lineHeight: '1.6', background: 'var(--surface-2)', padding: '1rem', borderRadius: '10px' }}>
                  {inq.message}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

