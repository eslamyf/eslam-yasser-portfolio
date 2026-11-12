import React, { useState } from 'react';
import { IconPlus, IconArrowUR } from '../../../assets/icons';
import { ImageUploader } from '../ImageUploader';
import { MultiImageUploader } from '../MultiImageUploader';
import { EditModal } from '../EditModal';

const parseTechs = (raw, fallbackTags = []) => {
  if (Array.isArray(raw) && raw.length > 0) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    return raw.includes(',') ? raw.split(',').map(s => s.trim()).filter(Boolean) : raw.split(/\s+/).filter(Boolean);
  }
  if (Array.isArray(fallbackTags)) return fallbackTags;
  return [];
};

const parseGallery = (proj) => {
  const g = proj.gallery || proj.images;
  if (Array.isArray(g)) return g;
  if (typeof g === 'string' && g.trim()) {
    return g.includes(',') ? g.split(',').map(s => s.trim()).filter(Boolean) : g.split(/\s+/).filter(Boolean);
  }
  return [];
};

export const ProjectsTab = ({
  projects,
  newProject,
  setNewProject,
  handleAddProject,
  handleUpdateProject,
  handleDeleteProject,
  isSubmitting
}) => {
  const [editingProject, setEditingProject] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const openEdit = (proj) => {
    const pId = proj._id || proj.id;
    const techs = parseTechs(proj.technologies, proj.tags).join(', ');
    const gallery = parseGallery(proj);

    setEditingProject({
      id: pId,
      title: proj.title || '',
      category: proj.category || 'MEAN Stack',
      subtitle: proj.subtitle || '',
      description: proj.description || '',
      technologies: techs,
      coverImage: proj.coverImage || proj.image || '',
      gallery: gallery,
      githubUrl: proj.githubUrl || proj.github || '',
      liveUrl: proj.liveUrl || proj.demo || ''
    });
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingProject(null);
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingProject) return;
    setEditSubmitting(true);
    try {
      await handleUpdateProject(editingProject.id, {
        title: editingProject.title,
        category: editingProject.category,
        subtitle: editingProject.subtitle,
        description: editingProject.description,
        technologies: editingProject.technologies.split(',').map(t => t.trim()).filter(Boolean),
        coverImage: editingProject.coverImage,
        image: editingProject.coverImage,
        gallery: editingProject.gallery || [],
        images: editingProject.gallery || [],
        githubUrl: editingProject.githubUrl,
        liveUrl: editingProject.liveUrl
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
          <h2 className="admin-page-title">إدارة المشاريع والأعمال 💼</h2>
          <p className="admin-page-sub">
            أضف وعدّل واحذف مشاريعك، وارفع صوراً فردية أو متعددة سحابياً إلى Cloudinary مباشرة
          </p>
        </div>
        <div className="admin-stat-pill">
          <span>إجمالي المشاريع:</span>
          <b>{projects.length}</b>
        </div>
      </div>

      {/* Add Project Form Card */}
      <div className="admin-card" style={{ marginBottom: '2.5rem' }}>
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">إضافة مشروع جديد</h3>
            <p className="admin-card-sub">أدخل تفاصيل المشروع ورابط المعاينة والصور</p>
          </div>
        </div>

        <form onSubmit={handleAddProject}>
          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-label">عنوان المشروع *</label>
              <input
                type="text"
                required
                className="admin-input"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                placeholder="مثال: Aqario Luxe - منصة إدارة عقارات"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">تصنيف المشروع</label>
              <input
                type="text"
                className="admin-input"
                value={newProject.category}
                onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                placeholder="مثال: MEAN Stack, Full-Stack, Web App"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">العنوان الفرعي / الوصف المختصر</label>
            <input
              type="text"
              className="admin-input"
              value={newProject.subtitle}
              onChange={(e) => setNewProject({ ...newProject, subtitle: e.target.value })}
              placeholder="وصف سريع من سطر واحد يوضح فكرة المنصة"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">الوصف الكامل والتفاصيل *</label>
            <textarea
              required
              rows={4}
              className="admin-textarea"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="اكتب شرحاً وافياً للمشروع والميزات والحلول الهندسية التي قدمتها..."
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">التقنيات المستخدمة (مفصولة بفواصل)</label>
            <input
              type="text"
              className="admin-input"
              value={newProject.technologies}
              onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
              placeholder="Angular, Node.js, Express, MongoDB, TypeScript, JWT"
              dir="ltr"
            />
          </div>

          {/* Single Cover Image Upload with Cloudinary */}
          <ImageUploader
            label="صورة غلاف المشروع الرئيسية (Cover Image)"
            section="projects"
            value={newProject.coverImage}
            onChange={(url) => setNewProject({ ...newProject, coverImage: url })}
          />

          {/* Multiple Gallery Images Upload with Cloudinary */}
          <MultiImageUploader
            label="معرض صور ولقطات شاشة إضافية للمشروع (Gallery Screenshots)"
            images={newProject.gallery || []}
            onChange={(imgs) => setNewProject({ ...newProject, gallery: imgs })}
          />

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-label">رابط كود المشروع على GitHub</label>
              <input
                type="url"
                className="admin-input"
                value={newProject.githubUrl}
                onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                placeholder="https://github.com/eslamyasser/..."
                dir="ltr"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">رابط المعاينة المباشرة (Live Demo)</label>
              <input
                type="url"
                className="admin-input"
                value={newProject.liveUrl}
                onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                placeholder="https://my-live-project.com"
                dir="ltr"
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
            <button type="submit" className="admin-btn admin-btn--primary" disabled={isSubmitting}>
              <i className="fa-solid fa-plus"></i>
              <span>{isSubmitting ? 'جاري حفظ ونشر المشروع...' : 'حفظ وإضافة المشروع'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Projects List */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--ink)' }}>
          قائمة المشاريع المنشورة ({projects.length})
        </h3>

        {projects.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">📂</div>
            <p className="admin-empty-title">لا توجد مشاريع مضافة حتى الآن</p>
            <p className="admin-empty-sub">استخدم النموذج بالأعلى لإضافة مشروعك الأول ورفعه سحابياً</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {projects.map((proj) => {
              const pId = proj._id || proj.id;
              const techs = parseTechs(proj.technologies, proj.tags);
              const cover = proj.coverImage || proj.image;
              const gallery = parseGallery(proj);

              return (
                <div key={pId} className="admin-item-card">
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Thumbnail if present */}
                    {cover && (
                      <div
                        style={{
                          width: '120px',
                          height: '80px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          background: 'var(--surface-3)',
                          border: '1px solid var(--line)',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={cover}
                          alt={proj.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="admin-badge admin-badge--primary">
                          {proj.category || 'عام'}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)' }}>
                          {proj.title}
                        </h4>
                      </div>

                      {proj.subtitle && (
                        <p style={{ color: 'var(--mut)', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
                          {proj.subtitle}
                        </p>
                      )}

                      <p style={{ color: 'var(--ink)', fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>
                        {proj.description}
                      </p>

                      {techs.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                          {techs.map((t, idx) => (
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
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Gallery count if available */}
                      {gallery.length > 0 && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'hsl(var(--brand))' }}>
                          🖼️ معرض صور المشروع: {gallery.length} صورة مرفوعة
                        </div>
                      )}

                      {/* Links */}
                      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.85rem', fontSize: '0.88rem' }}>
                        {(proj.githubUrl || proj.github) && (
                          <a
                            href={proj.githubUrl || proj.github}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'hsl(var(--brand))', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                          >
                            <span>مستودع GitHub</span>
                            <IconArrowUR className="i" style={{ width: '13px', height: '13px' }} />
                          </a>
                        )}
                        {(proj.liveUrl || proj.demo) && (
                          <a
                            href={proj.liveUrl || proj.demo}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                          >
                            <span>المعاينة الحية (Live Demo)</span>
                            <IconArrowUR className="i" style={{ width: '13px', height: '13px' }} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Actions: Edit & Delete */}
                    <div className="admin-actions-group">
                      <button
                        type="button"
                        onClick={() => openEdit(proj)}
                        className="admin-btn admin-btn--secondary"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                        <span>تعديل</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(pId, proj.title)}
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

      {/* Edit Project Modal */}
      {editingProject && (
        <EditModal
          isOpen={isEditOpen}
          onClose={closeEdit}
          title={`تعديل المشروع: ${editingProject.title}`}
        >
          <form onSubmit={onEditSubmit}>
            <div className="admin-grid-2">
              <div className="admin-form-group">
                <label className="admin-label">عنوان المشروع *</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">التصنيف</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editingProject.category}
                  onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">العنوان الفرعي</label>
              <input
                type="text"
                className="admin-input"
                value={editingProject.subtitle}
                onChange={(e) => setEditingProject({ ...editingProject, subtitle: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">الوصف الكامل *</label>
              <textarea
                required
                rows={4}
                className="admin-textarea"
                value={editingProject.description}
                onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">التقنيات (مفصولة بفواصل)</label>
              <input
                type="text"
                className="admin-input"
                value={editingProject.technologies}
                onChange={(e) => setEditingProject({ ...editingProject, technologies: e.target.value })}
                dir="ltr"
              />
            </div>

            {/* Edit Cover Image */}
            <ImageUploader
              label="تعديل صورة الغلاف الرئيسية"
              section="projects"
              value={editingProject.coverImage}
              onChange={(url) => setEditingProject({ ...editingProject, coverImage: url })}
            />

            {/* Edit Gallery Images */}
            <MultiImageUploader
              label="تعديل معرض صور المشروع (إضافة / حذف لقطات شاشة)"
              images={editingProject.gallery || []}
              onChange={(imgs) => setEditingProject({ ...editingProject, gallery: imgs })}
            />

            <div className="admin-grid-2">
              <div className="admin-form-group">
                <label className="admin-label">رابط GitHub</label>
                <input
                  type="url"
                  className="admin-input"
                  value={editingProject.githubUrl}
                  onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                  dir="ltr"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">رابط المعاينة المباشرة</label>
                <input
                  type="url"
                  className="admin-input"
                  value={editingProject.liveUrl}
                  onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                  dir="ltr"
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
                {editSubmitting ? 'جاري حفظ التعديلات...' : 'حفظ التعديلات ✓'}
              </button>
            </div>
          </form>
        </EditModal>
      )}
    </div>
  );
};
