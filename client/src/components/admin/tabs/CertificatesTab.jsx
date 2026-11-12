import React, { useState } from 'react';
import { IconPlus, IconArrowUR } from '../../../assets/icons';
import { ImageUploader } from '../ImageUploader';
import { EditModal } from '../EditModal';

const parseCertSkills = (cert) => {
  const sk = cert.skills || cert.tags;
  if (Array.isArray(sk) && sk.length > 0) return sk;
  if (typeof sk === 'string' && sk.trim()) {
    return sk.includes(',') ? sk.split(',').map(s => s.trim()).filter(Boolean) : sk.split(/\s+/).filter(Boolean);
  }
  return [];
};

export const CertificatesTab = ({
  certificates,
  newCert,
  setNewCert,
  handleAddCert,
  handleUpdateCert,
  handleDeleteCert,
  isSubmitting
}) => {
  const [editingCert, setEditingCert] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const openEdit = (cert) => {
    const cId = cert._id || cert.id;
    const skillsStr = parseCertSkills(cert).join(', ');

    setEditingCert({
      id: cId,
      title: cert.title || '',
      issuer: cert.issuer || cert.organization || '',
      issueDate: cert.issueDate || cert.year || cert.date || '2026',
      credentialId: cert.credentialId || cert.idNumber || '',
      credentialUrl: cert.credentialUrl || cert.link || '',
      skills: skillsStr,
      image: cert.image || ''
    });
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingCert(null);
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCert) return;
    setEditSubmitting(true);
    try {
      await handleUpdateCert(editingCert.id, {
        title: editingCert.title,
        issuer: editingCert.issuer,
        issueDate: editingCert.issueDate,
        credentialId: editingCert.credentialId,
        credentialUrl: editingCert.credentialUrl,
        skills: editingCert.skills.split(',').map(s => s.trim()).filter(Boolean),
        image: editingCert.image
      });
      closeEdit();
    } catch (err) {
      // handled in parent
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">إدارة الشهادات والاعتمادات (Certificates) 🎓</h2>
          <p className="admin-page-sub">
            أضف وثائقك وشهاداتك المعتمدة وارفع صورها إلى Cloudinary سحابياً مع روابط التحقق
          </p>
        </div>
        <div className="admin-stat-pill">
          <span>إجمالي الشهادات:</span>
          <b>{certificates.length}</b>
        </div>
      </div>

      {/* Add Certificate Form Card */}
      <div className="admin-card" style={{ marginBottom: '2.5rem' }}>
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">إضافة شهادة أو اعتماد جديد</h3>
            <p className="admin-card-sub">أدخل بيانات الشهادة والجهة المصدرة وارفع صورة الاعتماد</p>
          </div>
        </div>

        <form onSubmit={handleAddCert}>
          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-label">عنوان الشهادة / الدورة *</label>
              <input
                type="text"
                required
                className="admin-input"
                value={newCert.title}
                onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                placeholder="مثال: Full Stack Web Development with MEAN Stack"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">الجهة المصدرة / المنظمة *</label>
              <input
                type="text"
                required
                className="admin-input"
                value={newCert.issuer}
                onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                placeholder="مثال: NTI, Coursera, Udemy, Creativa Hub"
              />
            </div>
          </div>

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-label">تاريخ الإصدار / السنة</label>
              <input
                type="text"
                className="admin-input"
                value={newCert.issueDate}
                onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                placeholder="مثال: يوليو 2026 أو 2026"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">معرّف الشهادة (Credential ID)</label>
              <input
                type="text"
                className="admin-input"
                value={newCert.credentialId}
                onChange={(e) => setNewCert({ ...newCert, credentialId: e.target.value })}
                placeholder="مثال: NTI-MEAN-2026-9921"
                dir="ltr"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">رابط التحقق الإلكتروني من الشهادة (Verification URL)</label>
            <input
              type="url"
              className="admin-input"
              value={newCert.credentialUrl}
              onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
              placeholder="https://verify.cert-issuer.com/..."
              dir="ltr"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">المهارات المكتسبة في الشهادة (مفصولة بفواصل)</label>
            <input
              type="text"
              className="admin-input"
              value={newCert.skills}
              onChange={(e) => setNewCert({ ...newCert, skills: e.target.value })}
              placeholder="Angular, Node.js, Express, MongoDB, RESTful APIs"
              dir="ltr"
            />
          </div>

          {/* Certificate Image Upload with Cloudinary */}
          <ImageUploader
            label="صورة الشهادة (رفع من الجهاز إلى Cloudinary أو وضع رابط مباشر)"
            section="certificates"
            value={newCert.image}
            onChange={(url) => setNewCert({ ...newCert, image: url })}
          />

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
            <button type="submit" className="admin-btn admin-btn--primary" disabled={isSubmitting}>
              <i className="fa-solid fa-plus"></i>
              <span>{isSubmitting ? 'جاري الحفظ والرفع...' : 'حفظ وإضافة الشهادة'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Certificates List */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--ink)' }}>
          الشهادات الحالية ({certificates.length})
        </h3>

        {certificates.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">🎓</div>
            <p className="admin-empty-title">لا توجد شهادات مضافة بعد</p>
            <p className="admin-empty-sub">استخدم النموذج بالأعلى لإضافة شهاداتك مع صورها وروابط التحقق</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {certificates.map((cert) => {
              const cId = cert._id || cert.id;
              const certSkills = parseCertSkills(cert);
              const issuerName = cert.issuer || cert.organization;
              const dateVal = cert.issueDate || cert.year || cert.date;

              return (
                <div key={cId} className="admin-item-card">
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Certificate Thumbnail */}
                    {cert.image && (
                      <div
                        style={{
                          width: '120px',
                          height: '85px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          background: 'var(--surface-3)',
                          border: '1px solid var(--line)',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={cert.image}
                          alt={cert.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="admin-badge admin-badge--primary">
                          {issuerName || 'جهة معتمدة'}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)' }}>
                          {cert.title}
                        </h4>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', color: 'var(--mut)', fontSize: '0.85rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        {dateVal && <span>📅 تاريخ الإصدار: {dateVal}</span>}
                        {cert.credentialId && <span>🆔 معرّف الاعتماد: {cert.credentialId}</span>}
                      </div>

                      {certSkills.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                          {certSkills.map((sk, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '0.78rem',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '6px',
                                background: 'var(--surface-3)',
                                color: 'var(--ink)',
                                border: '1px solid var(--line)'
                              }}
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}

                      {cert.credentialUrl && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'hsl(var(--brand))', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                          >
                            <span>رابط التحقق الرسمي من الشهادة</span>
                            <IconArrowUR className="i" style={{ width: '13px', height: '13px' }} />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="admin-actions-group">
                      <button
                        type="button"
                        onClick={() => openEdit(cert)}
                        className="admin-btn admin-btn--secondary"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                        <span>تعديل</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCert(cId, cert.title)}
                        className="admin-btn admin-btn--danger"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Certificate Modal */}
      {editingCert && (
        <EditModal
          isOpen={isEditOpen}
          onClose={closeEdit}
          title={`تعديل الشهادة: ${editingCert.title}`}
        >
          <form onSubmit={onEditSubmit}>
            <div className="admin-grid-2">
              <div className="admin-form-group">
                <label className="admin-label">عنوان الشهادة *</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  value={editingCert.title}
                  onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">الجهة المصدرة *</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  value={editingCert.issuer}
                  onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                />
              </div>
            </div>

            <div className="admin-grid-2">
              <div className="admin-form-group">
                <label className="admin-label">تاريخ الإصدار / السنة</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingCert.issueDate}
                  onChange={(e) => setEditingCert({ ...editingCert, issueDate: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">معرّف الشهادة (ID)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingCert.credentialId}
                  onChange={(e) => setEditingCert({ ...editingCert, credentialId: e.target.value })}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">رابط التحقق الإلكتروني</label>
              <input
                type="url"
                className="admin-input"
                value={editingCert.credentialUrl}
                onChange={(e) => setEditingCert({ ...editingCert, credentialUrl: e.target.value })}
                dir="ltr"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">المهارات المكتسبة (مفصولة بفواصل)</label>
              <input
                type="text"
                className="admin-input"
                value={editingCert.skills}
                onChange={(e) => setEditingCert({ ...editingCert, skills: e.target.value })}
                dir="ltr"
              />
            </div>

            {/* Certificate Image in Edit */}
            <ImageUploader
              label="تعديل صورة الشهادة (Cloudinary أو رابط)"
              section="certificates"
              value={editingCert.image}
              onChange={(url) => setEditingCert({ ...editingCert, image: url })}
            />

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={closeEdit}
                disabled={editSubmitting}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn--primary"
                disabled={editSubmitting}
              >
                {editSubmitting ? 'جاري حفظ التعديلات...' : 'حفظ التعديلات ✓'}
              </button>
            </div>
          </form>
        </EditModal>
      )}
    </div>
  );
};
