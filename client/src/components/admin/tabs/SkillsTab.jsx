import React, { useState } from 'react';
import { IconPlus } from '../../../assets/icons';
import { EditModal } from '../EditModal';

export const SkillsTab = ({
  skills,
  newSkill,
  setNewSkill,
  handleAddSkill,
  handleUpdateSkill,
  handleDeleteSkill,
  isSubmitting
}) => {
  const [editingSkill, setEditingSkill] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const openEdit = (skill) => {
    const sId = skill._id || skill.id;
    setEditingSkill({
      id: sId,
      name: skill.name || '',
      category: skill.category || 'frontend',
      level: skill.level || 'Advanced',
      proficiency: skill.proficiency || 90,
      icon: skill.icon || 'ri-code-line'
    });
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingSkill(null);
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingSkill) return;
    setEditSubmitting(true);
    try {
      await handleUpdateSkill(editingSkill.id, {
        name: editingSkill.name,
        category: editingSkill.category,
        level: editingSkill.level,
        proficiency: Number(editingSkill.proficiency) || 90,
        icon: editingSkill.icon
      });
      closeEdit();
    } catch (err) {
      // handled in parent
    } finally {
      setEditSubmitting(false);
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'frontend': return 'واجهات أمامية (Frontend)';
      case 'backend': return 'خوادم وقواعد بيانات (Backend)';
      case 'tools': return 'أدوات ونظم (Tools & CS)';
      default: return cat;
    }
  };

  const getLevelLabel = (lvl) => {
    switch (lvl) {
      case 'Advanced': return 'خبير / متقدم';
      case 'Intermediate': return 'متوسط';
      case 'Basic': return 'مبتدئ / أساسي';
      default: return lvl;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">إدارة المهارات والتقنيات (Skills) ⚡</h2>
          <p className="admin-page-sub">
            أضف وعدّل واحذف مهاراتك البرمجية والتقنية ونسبة الإتقان وتصنيفها
          </p>
        </div>
        <div className="admin-stat-pill">
          <span>إجمالي المهارات:</span>
          <b>{skills.length}</b>
        </div>
      </div>

      {/* Add Skill Form Card */}
      <div className="admin-card" style={{ marginBottom: '2.5rem' }}>
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">إضافة مهارة جديدة</h3>
            <p className="admin-card-sub">حدد اسم التقنية، التصنيف، ومستوى الخبرة</p>
          </div>
        </div>

        <form onSubmit={handleAddSkill}>
          <div className="admin-grid-4">
            <div className="admin-form-group">
              <label className="admin-label">اسم التقنية / المهارة *</label>
              <input
                type="text"
                required
                className="admin-input"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                placeholder="مثال: Angular, Node.js, Docker"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">التصنيف الرئيسي</label>
              <select
                className="admin-select"
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              >
                <option value="frontend">واجهات أمامية (Frontend)</option>
                <option value="backend">خوادم وباك إند (Backend)</option>
                <option value="tools">أدوات وهندسة حاسوب (Tools &amp; CS)</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">المستوى (Level)</label>
              <select
                className="admin-select"
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
              >
                <option value="Advanced">متقدم (Advanced)</option>
                <option value="Intermediate">متوسط (Intermediate)</option>
                <option value="Basic">أساسي (Basic)</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">نسبة الإتقان % (1 - 100)</label>
              <input
                type="number"
                min="1"
                max="100"
                className="admin-input"
                value={newSkill.proficiency}
                onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                placeholder="90"
              />
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-start' }}>
            <button type="submit" className="admin-btn admin-btn--primary" disabled={isSubmitting}>
              <i className="fa-solid fa-plus"></i>
              <span>{isSubmitting ? 'جاري الإضافة...' : 'إضافة المهارة'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Skills Grid */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--ink)' }}>
          المهارات الحالية ({skills.length})
        </h3>

        {skills.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">⚡</div>
            <p className="admin-empty-title">لا توجد مهارات مضافة حالياً</p>
            <p className="admin-empty-sub">استخدم النموذج بالأعلى لإضافة المهارات وتحديد نسب إتقانها</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {skills.map((s) => {
              const sId = s._id || s.id;
              const prof = s.proficiency || 85;

              return (
                <div key={sId} className="admin-item-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)' }}>
                        {s.name}
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--mut)' }}>
                        {getCategoryLabel(s.category)}
                      </span>
                    </div>

                    <span className="admin-badge admin-badge--primary">
                      {getLevelLabel(s.level)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem', color: 'var(--mut)' }}>
                      <span>مستوى التمكن:</span>
                      <b style={{ color: 'var(--ink)' }}>{prof}%</b>
                    </div>
                    <div style={{ height: '7px', background: 'var(--surface-3)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${prof}%`,
                          background: 'linear-gradient(90deg, hsl(var(--brand)), #38bdf8)',
                          borderRadius: '999px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--line)' }}>
                    <button
                      type="button"
                      onClick={() => openEdit(s)}
                      className="admin-btn admin-btn--secondary"
                      style={{ flex: 1, padding: '0.45rem 0.6rem', fontSize: '0.82rem' }}
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                      <span>تعديل</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(sId, s.name)}
                      className="admin-btn admin-btn--danger"
                      style={{ flex: 1, padding: '0.45rem 0.6rem', fontSize: '0.82rem' }}
                    >
                      <i className="fa-solid fa-trash-can"></i>
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Skill Modal */}
      {editingSkill && (
        <EditModal
          isOpen={isEditOpen}
          onClose={closeEdit}
          title={`تعديل مهارة: ${editingSkill.name}`}
        >
          <form onSubmit={onEditSubmit}>
            <div className="admin-grid-2">
              <div className="admin-form-group">
                <label className="admin-label">اسم التقنية / المهارة *</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  value={editingSkill.name}
                  onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">التصنيف الرئيسي</label>
                <select
                  className="admin-select"
                  value={editingSkill.category}
                  onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value })}
                >
                  <option value="frontend">واجهات أمامية (Frontend)</option>
                  <option value="backend">خوادم وباك إند (Backend)</option>
                  <option value="tools">أدوات وهندسة حاسوب (Tools &amp; CS)</option>
                </select>
              </div>
            </div>

            <div className="admin-grid-2">
              <div className="admin-form-group">
                <label className="admin-label">المستوى (Level)</label>
                <select
                  className="admin-select"
                  value={editingSkill.level}
                  onChange={(e) => setEditingSkill({ ...editingSkill, level: e.target.value })}
                >
                  <option value="Advanced">متقدم (Advanced)</option>
                  <option value="Intermediate">متوسط (Intermediate)</option>
                  <option value="Basic">أساسي (Basic)</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">نسبة الإتقان % (1 - 100)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="admin-input"
                  value={editingSkill.proficiency}
                  onChange={(e) => setEditingSkill({ ...editingSkill, proficiency: e.target.value })}
                />
              </div>
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
