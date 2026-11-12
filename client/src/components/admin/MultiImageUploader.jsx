import React, { useState, useRef } from 'react';
import { fileApi } from '../../api/client';
import { useToast } from '../layout/Toast';

export const MultiImageUploader = ({
  images = [],
  onChange,
  label = 'معرض صور المشروع (صور إضافية / لقطات شاشة)'
}) => {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleMultipleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    let successCount = 0;
    const newUrls = [...images];

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('relatedSection', 'ProjectGallery');

      try {
        const res = await fileApi.uploadImage(formData);
        const url = res.data?.cloudinaryUrl || res.data?.filePath;
        if (url) {
          newUrls.push(url);
          successCount++;
        }
      } catch (err) {
        console.error('Error uploading file to gallery:', err);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (successCount > 0) {
      onChange(newUrls);
      showToast(`تم رفع ${successCount} صورة إلى المعرض سحابياً على Cloudinary!`, 'success');
    } else {
      showToast('لم نتمكن من رفع الصور المحددة', 'error');
    }
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    onChange([...images, customUrl.trim()]);
    setCustomUrl('');
    showToast('تمت إضافة رابط الصورة للمعرض', 'success');
  };

  const handleRemoveImage = (indexToRemove) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="admin-form-group">
      <label className="admin-label">{label}</label>

      <div className="admin-upload-box">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleMultipleFiles}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {uploading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>جاري رفع الصور إلى Cloudinary...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-images"></i>
                <span>رفع عدة صور من الجهاز</span>
              </>
            )}
          </button>

          <span style={{ color: 'var(--mut)', fontSize: '0.85rem' }}>أو أضف رابط:</span>

          <div style={{ display: 'flex', gap: '0.4rem', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              className="admin-input"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://... رابط صورة خارجي"
              dir="ltr"
              style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
            />
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={handleAddUrl}
              style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <i className="fa-solid fa-plus"></i>
              <span>إضافة</span>
            </button>
          </div>
        </div>

        {/* Gallery Thumbnails List */}
        {images && images.length > 0 && (
          <div style={{ marginTop: '0.75rem' }}>
            <small style={{ color: 'var(--mut)', display: 'block', marginBottom: '0.4rem' }}>
              الصور المضافة ({images.length} صور):
            </small>
            <div className="admin-gallery-grid">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="admin-gallery-thumb">
                  <img src={imgUrl} alt={`Gallery ${idx + 1}`} onError={(e) => { e.target.style.opacity = '0.3'; }} />
                  <button
                    type="button"
                    className="admin-upload-preview__remove"
                    onClick={() => handleRemoveImage(idx)}
                    title="حذف هذه الصورة"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

