import React, { useEffect } from 'react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'تأكيد الحذف',
  message = 'هل أنت متأكد من رغبتك في تنفيذ هذا الإجراء؟ لا يمكن التراجع عن هذه الخطوة.',
  confirmText = 'نعم، حذف نهائي',
  cancelText = 'إلغاء الأمر',
  isLoading = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="admin-confirm-overlay" onClick={onClose}>
      <div className="admin-confirm-card" onClick={(e) => e.stopPropagation()}>
        {/* Warning Icon Badge */}
        <div className="admin-confirm-icon-box">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>

        {/* Text Content */}
        <h3 className="admin-confirm-title">{title}</h3>
        <p className="admin-confirm-msg">{message}</p>

        {/* Action Buttons */}
        <div className="admin-confirm-actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            <span>{cancelText}</span>
          </button>

          <button
            type="button"
            className="admin-btn admin-btn--danger"
            onClick={onConfirm}
            disabled={isLoading}
            style={{ minWidth: '140px' }}
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>جاري الحذف...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-trash-can"></i>
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

