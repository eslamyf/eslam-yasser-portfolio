import React from 'react';
import { IconMail } from '../../../assets/icons';

export const InquiriesTab = ({ inquiries, handleDeleteInquiry }) => {
  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">صندوق رسائل واستفسارات الزوار 📬</h2>
          <p className="admin-page-sub">
            استعرض رسائل العملاء، طلبات التوظيف، وعروض المشاريع الواردة من نموذج الاتصال
          </p>
        </div>
        <div className="admin-stat-pill">
          <span>إجمالي الرسائل:</span>
          <b>{inquiries.length}</b>
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">✉️</div>
          <p className="admin-empty-title">صندوق الرسائل فارغ حالياً</p>
          <p className="admin-empty-sub">ستظهر هنا أي رسالة يرسلها الزوار من نموذج تواصل معي في الموقع</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {inquiries.map((inq) => {
            const inqId = inq._id || inq.id;
            const createdDate = inq.createdAt ? new Date(inq.createdAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'حديثاً';

            return (
              <div key={inqId} className="admin-item-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <b style={{ fontSize: '1.15rem', color: 'var(--ink)' }}>{inq.name}</b>
                      <a
                        href={`mailto:${inq.email}`}
                        style={{ color: 'hsl(var(--brand))', fontSize: '0.88rem', textDecoration: 'none', direction: 'ltr', display: 'inline-block' }}
                      >
                        &lt;{inq.email}&gt;
                      </a>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--mut)', marginTop: '0.25rem', display: 'block' }}>
                      🕒 {createdDate}
                    </span>
                  </div>

                  <div className="admin-actions-group">
                    <a
                      href={`mailto:${inq.email}?subject=رد على: ${encodeURIComponent(inq.subject || 'رسالتك عبر معرض الأعمال')}`}
                      className="admin-btn admin-btn--secondary"
                      style={{ fontSize: '0.84rem', padding: '0.45rem 0.85rem' }}
                    >
                      <i className="fa-solid fa-reply"></i>
                      <span>رد على الإيميل</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteInquiry(inqId, inq.name)}
                      className="admin-btn admin-btn--danger"
                      style={{ fontSize: '0.84rem', padding: '0.45rem 0.85rem' }}
                    >
                      <i className="fa-solid fa-trash-can"></i>
                      <span>حذف</span>
                    </button>
                  </div>
                </div>

                {inq.subject && (
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.5rem' }}>
                    الموضوع: {inq.subject}
                  </div>
                )}

                <div
                  style={{
                    background: 'var(--surface-3)',
                    padding: '1rem 1.25rem',
                    borderRadius: '10px',
                    border: '1px solid var(--line)',
                    color: 'var(--ink)',
                    fontSize: '0.92rem',
                    lineHeight: '1.7',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {inq.message}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
