import React, { useState } from 'react';
import { IconPlus } from '../../../assets/icons';
import { EditModal } from '../EditModal';

export const VolunteeringTab = ({
  volunteering,
  newVolunteering,
  setNewVolunteering,
  handleAddVolunteering,
  handleUpdateVolunteering,
  handleDeleteVolunteering,
  isSubmitting
}) => {
  const [editingVol, setEditingVol] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const openEdit = (vol) => {
    const vId = vol._id || vol.id;
    setEditingVol({
      id: vId,
      role: vol.role || vol.title || '',
      organization: vol.organization || vol.subtitle || '',
      startDate: vol.startDate || '2025',
      endDate: vol.endDate || 'Present',
      description: vol.description || ''
    });
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingVol(null);
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingVol) return;
    setEditSubmitting(true);
    try {
      if (handleUpdateVolunteering) {
        await handleUpdateVolunteering(editingVol.id, {
          role: editingVol.role,
          organization: editingVol.organization,
          startDate: editingVol.startDate,
          endDate: editingVol.endDate,
          description: editingVol.description
        });
      }
      closeEdit();
    } catch (err) {
      // parent handles
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">إدارة الأنشطة والخبرات التطوعية 🤝</h2>
          <p className="admin-page-sub">
            أضف وعدّل أنشطتك المجتمعية، القيادة الطلابية، والمبادرات التقنية
          </p>
        </div>
        <div className="admin-stat-pill">
          <span>إجمالي الأنشطة:</span>
          <b>{volunteering.length}</b>
        </div>
      </div>

      {/* Add Volunteering Form Card */}
      <div className="admin-card" style={{ marginBottom: '2.5rem' }}>
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">إضافة نشاط تطوعي جديد</h3>
            <p className="admin-card-sub">حدد الدور والجهة المصدرة وفترة التطوع والمسؤوليات</p>
          </div>
        </div>

        <form onSubmit={handleAddVolunteering}>
          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-label">المسمى / الدور التطوعي *</label>
              <input
                type="text"
                required
                className="admin-input"
                value={newVolunteering.role}
                onChange={(e) => setNewVolunteering({ ...newVolunteering, role: e.target.value })}
                placeholder="مثال: مسؤول العلاقات العامة (Head of PR) أو مرشد تقني"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">المنظمة / المجتمع أو الفريق *</label>
              <input
                type="text"
                required
                className="admin-input"
                value={newVolunteering.organization}
                onChange={(e) => setNewVolunteering({ ...newVolunteering, organization: e.target.value })}
                placeholder="مثال: Students for Egypt, GDG, منصة كلاس ميت"
              />
            </div>
          </div>

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-label">تاريخ البداية</label>
              <input
                type="text"
                className="admin-input"
                value={newVolunteering.startDate}
                onChange={(e) => setNewVolunteering({ ...newVolunteering, startDate: e.target.value })}
                placeholder="2025 أو يونيو 2025"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">تاريخ الانتهاء</label>
              <input
                type="text"
                className="admin-input"
                value={newVolunteering.endDate}
                onChange={(e) => setNewVolunteering({ ...newVolunteering, endDate: e.target.value })}
                placeholder="مستمر حتى الآن أو 2026"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">وصف النشاط والمهام المنجزة</label>
            <textarea
              rows={3}
              className="admin-textarea"
              value={newVolunteering.description}
              onChange={(e) => setNewVolunteering({ ...newVolunteering, description: e.target.value })}
              placeholder="اكتب نبذة عن دورك في التنظيم أو التدريب والأثر المجتمعي..."
            />
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-start' }}>
            <button type="submit" className="admin-btn admin-btn--primary" disabled={isSubmitting}>
              <i className="fa-solid fa-plus"></i>
              <span>{isSubmitting ? 'جاري الإضافة...' : 'إضافة النشاط التطوعي'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Volunteering List */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--ink)' }}>
          الأنشطة التطوعية المسجلة ({volunteering.length})
        </h3>

        {volunteering.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">🤝</div>
            <p className="admin-empty-title">لا توجد أنشطة تطوعية مسجلة</p>
            <p className="admin-empty-sub">استخدم النموذج بالأعلى لإضافة مساهماتك وتأثيرك المجتمعي</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {volunteering.map((v) => {
              const vId = v._id || v.id;
              const roleTitle = v.role || v.title;
              const orgName = v.organization || v.subtitle;
              const period = v.period || v.time || `${v.startDate || '2025'} - ${v.endDate || 'مستمر'}`;

              return (
                <div key={vId} className="admin-item-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="admin-badge admin-badge--primary">
                          {period}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)' }}>
                          {roleTitle}
                        </h4>
                      </div>

                      <div style={{ color: 'hsl(var(--brand))', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        🏛️ {orgName}
                      </div>

                      {v.description && (
                        <p style={{ color: 'var(--ink)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                          {v.description}
                        </p>
                      )}
                    </div>

                    <div className="admin-actions-group">
                      <button
                        type="button"
                        onClick={() => openEdit(v)}
                        className="admin-btn admin-btn--secondary"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                        <span>تعديل</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVolunteering(vId, roleTitle)}
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

      {/* Edit Volunteering Modal */}
      {editingVol && (
        <EditModal
          isOpen={isEditOpen}
          onClose={closeEdit}
          title={`تعديل النشاط: ${editingVol.role}`}
        >
          <form onSubmit={onEditSubmit}>
            <div className="admin-grid-2">
              <div className="admin-form-group">
                <label className="admin-label">الدور التطوعي *</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  value={editingVol.role}
                  onChange={(e) => setEditingVol({ ...editingVol, role: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">المنظمة / الفريق *</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  value={editingVol.organization}
                  onChange={(e) => setEditingVol({ ...editingVol, organization: e.target.value })}
                />
              </div>
            </div>

            <div className="admin-grid-2">
              <div className="admin-form-group">
                <label className="admin-label">تاريخ البداية</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingVol.startDate}
                  onChange={(e) => setEditingVol({ ...editingVol, startDate: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">تاريخ الانتهاء</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingVol.endDate}
                  onChange={(e) => setEditingVol({ ...editingVol, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">الوصف والمهام</label>
              <textarea
                rows={3}
                className="admin-textarea"
                value={editingVol.description}
                onChange={(e) => setEditingVol({ ...editingVol, description: e.target.value })}
              />
            </div>

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
                {editSubmitting ? 'جاري حفظ التعديل...' : 'حفظ التعديل ✓'}
              </button>
            </div>
          </form>
        </EditModal>
      )}
    </div>
  );
};
