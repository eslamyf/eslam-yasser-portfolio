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
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">إدارة ملف السيرة الذاتية (CV) 📄</h2>
          <p className="admin-page-sub">
            ارفع أحدث نسخة من سيرتك الذاتية بصيغة PDF ليتمكن أصحاب العمل ومسؤولو التوظيف من تحميلها مباشرة
          </p>
        </div>
      </div>

      <div className="admin-card" style={{ maxWidth: '600px' }}>
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">تحديث وتفعيل السيرة الذاتية</h3>
            <p className="admin-card-sub">اختر ملف PDF جديد من جهازك واضغط زر الرفع والتفعيل</p>
          </div>
        </div>

        <form onSubmit={handleUploadCV}>
          <div className="admin-form-group">
            <label className="admin-label">اختر ملف الـ PDF الجديد:</label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setCvFile(e.target.files[0])}
              className="admin-input"
              style={{ cursor: 'pointer' }}
            />
            {cvFile && (
              <small style={{ color: '#34d399', fontSize: '0.82rem', marginTop: '0.4rem', display: 'block' }}>
                ✓ تم اختيار: {cvFile.name} ({(cvFile.size / 1024 / 1024).toFixed(2)} MB)
              </small>
            )}
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={!cvFile || isSubmitting}
            >
              <i className="fa-solid fa-cloud-arrow-up"></i>
              <span>{isSubmitting ? 'جاري رفع وتفعيل السيرة الذاتية...' : 'رفع وتفعيل السيرة الذاتية الآن'}</span>
            </button>
          </div>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#34d399', fontSize: '0.92rem' }}>
            <i className="fa-solid fa-circle-check"></i>
            <span>السيرة الذاتية المفعلة حالياً على الموقع: <b>Eslam_Yasser_CV.pdf</b></span>
          </div>
        </div>
      </div>
    </div>
  );
};
