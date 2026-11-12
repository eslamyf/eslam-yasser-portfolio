import React, { useState, useRef } from 'react';
import { fileApi } from '../../api/client';
import { useToast } from '../layout/Toast';


export const ImageUploader = ({
  value,
  onChange,
  label = 'صورة الغلاف / المعاينة',
  section = 'projects',
  placeholder = 'assets/img/... أو https://...'
}) => {
  const { showToast } = useToast();
  const [tab, setTab] = useState('upload'); // 'upload' or 'url'
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP, SVG)', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('حجم الصورة كبير جداً (الحد الأقصى 10 ميجابايت)', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('relatedSection', section);

    try {
      const res = await fileApi.uploadImage(formData);
      const url = res.data?.cloudinaryUrl || res.data?.filePath;
      if (url) {
        onChange(url);
        showToast('تم رفع الصورة بنجاح إلى Cloudinary سحابياً!', 'success');
      } else {
        showToast('فشل في استلام رابط الصورة من السيرفر', 'error');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      showToast(err.response?.data?.message || 'حدث خطأ أثناء رفع الصورة', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="admin-form-group">
      <label className="admin-label">{label}</label>

      <div className="admin-upload-box">
        <div className="admin-upload-tabs">
          <button
            type="button"
            className={`admin-upload-tab ${tab === 'upload' ? 'is-active' : ''}`}
            onClick={() => setTab('upload')}
          >
            <i className="fa-solid fa-cloud-arrow-up" style={{ marginLeft: '0.35rem' }}></i>
            رفع من الجهاز (Cloudinary)
          </button>
          <button
            type="button"
            className={`admin-upload-tab ${tab === 'url' ? 'is-active' : ''}`}
            onClick={() => setTab('url')}
          >
            <i className="fa-solid fa-link" style={{ marginLeft: '0.35rem' }}></i>
            رابط مباشر (URL)
          </button>
        </div>

        {tab === 'upload' ? (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
              id={`upload-${section}-${Math.random()}`}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {uploading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>جاري الرفع إلى Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <span>اختر صورة من جهازك</span>
                  </>
                )}
              </button>
              <small style={{ color: 'var(--mut)', fontSize: '0.8rem' }}>
                يدعم JPG, PNG, WEBP, SVG حتى 10MB
              </small>
            </div>
          </div>
        ) : (
          <div>
            <input
              type="text"
              className="admin-input"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              dir="ltr"
              style={{ textAlign: 'left' }}
            />
          </div>
        )}

        {/* Live Preview & Status */}
        {value && (
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="admin-upload-preview">
              <img src={value} alt="Preview" onError={(e) => { e.target.style.opacity = '0.3'; }} />
              <button
                type="button"
                className="admin-upload-preview__remove"
                onClick={() => onChange('')}
                title="حذف الصورة"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.84rem', fontWeight: 600 }}>
                <i className="fa-solid fa-circle-check"></i>
                <span>تم تحديد الصورة بنجاح</span>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--mut)', fontSize: '0.75rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', textAlign: 'left' }}>
                {value}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
