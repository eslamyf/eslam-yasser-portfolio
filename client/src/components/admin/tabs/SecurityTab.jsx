import React from 'react';
import { IconKey, IconShield, IconCheck } from '../../../assets/icons';

export const SecurityTab = ({
  passData,
  setPassData,
  handleChangePassword,
  isSubmitting
}) => {
  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">مركز الأمان وكلمة المرور 🔒</h2>
          <p className="admin-page-sub">
            تحديث كلمة مرور لوحة التحكم ومراجعة طبقات الحماية والتشفير النشطة
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: '1000px' }}>
        {/* Change Password Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <i className="fa-solid fa-key" style={{ color: 'hsl(var(--brand))' }}></i>
                تغيير كلمة المرور
              </h3>
              <p className="admin-card-sub">أدخل كلمة المرور الحالية والجديدة لتحديث بيانات دخولك</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword}>
            <div className="admin-form-group">
              <label className="admin-label">كلمة المرور الحالية *</label>
              <input
                type="password"
                required
                className="admin-input"
                value={passData.currentPassword}
                onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">كلمة المرور الجديدة (6 خانات على الأقل) *</label>
              <input
                type="password"
                required
                minLength={6}
                className="admin-input"
                value={passData.newPassword}
                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">تأكيد كلمة المرور الجديدة *</label>
              <input
                type="password"
                required
                minLength={6}
                className="admin-input"
                value={passData.confirmPassword}
                onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <button type="submit" className="admin-btn admin-btn--primary" disabled={isSubmitting}>
                <i className="fa-solid fa-shield-halved"></i>
                <span>{isSubmitting ? 'جاري التحديث...' : 'تحديث كلمة المرور الآن'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security Status Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <i className="fa-solid fa-shield-halved" style={{ color: '#34d399' }}></i>
                طبقات الحماية النشطة
              </h3>
              <p className="admin-card-sub">معلومات التشفير وإجراءات حماية النظام</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '10px', background: 'var(--surface-3)', border: '1px solid var(--line)' }}>
              <i className="fa-solid fa-circle-check" style={{ color: '#34d399' }}></i>
              <div>
                <b style={{ fontSize: '0.92rem', color: 'var(--ink)' }}>تشفير كلمات المرور عبر Bcrypt</b>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--mut)' }}>12 جولة تشفير غير قابلة للعكس (Salt Rounds: 12)</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '10px', background: 'var(--surface-3)', border: '1px solid var(--line)' }}>
              <i className="fa-solid fa-circle-check" style={{ color: '#34d399' }}></i>
              <div>
                <b style={{ fontSize: '0.92rem', color: 'var(--ink)' }}>توثيق الجلسات بـ JWT Token</b>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--mut)' }}>جلسة مؤمنة تنتهي تلقائياً ومحمية في Headers</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '10px', background: 'var(--surface-3)', border: '1px solid var(--line)' }}>
              <i className="fa-solid fa-circle-check" style={{ color: '#34d399' }}></i>
              <div>
                <b style={{ fontSize: '0.92rem', color: 'var(--ink)' }}>رفع سحابي مؤمن عبر Cloudinary</b>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--mut)' }}>مجلد مخصص ومحمي بمفاتيح API معزولة بيئياً</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '10px', background: 'var(--surface-3)', border: '1px solid var(--line)' }}>
              <i className="fa-solid fa-circle-check" style={{ color: '#34d399' }}></i>
              <div>
                <b style={{ fontSize: '0.92rem', color: 'var(--ink)' }}>حماية ضد هجمات التخمين (Rate Limiter)</b>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--mut)' }}>حظر محاولات الدخول المتكررة تلقائياً</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
