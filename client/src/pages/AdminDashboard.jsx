import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/Toast';
import {
  projectApi,
  certificateApi,
  skillApi,
  journeyApi,
  inquiryApi,
  cvApi
} from '../api/client';
import api from '../api/client';

import '../styles/admin.css';

import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { ConfirmModal } from '../components/admin/ConfirmModal';
import { ProjectsTab } from '../components/admin/tabs/ProjectsTab';
import { SkillsTab } from '../components/admin/tabs/SkillsTab';
import { CertificatesTab } from '../components/admin/tabs/CertificatesTab';
import { VolunteeringTab } from '../components/admin/tabs/VolunteeringTab';
import { InquiriesTab } from '../components/admin/tabs/InquiriesTab';
import { CvTab } from '../components/admin/tabs/CvTab';
import { SecurityTab } from '../components/admin/tabs/SecurityTab';

export const AdminDashboard = () => {
  const { token, user, logout, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('projects');
  const [loading, setLoading] = useState(false);

  // Data states
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [skills, setSkills] = useState([]);
  const [volunteering, setVolunteering] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  // Form states
  const [newProject, setNewProject] = useState({
    title: '',
    category: 'MEAN Stack',
    subtitle: '',
    description: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    coverImage: '',
    gallery: []
  });

  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'frontend',
    level: 'Advanced',
    proficiency: 90,
    icon: 'fa-solid fa-code'
  });

  const [newCert, setNewCert] = useState({
    title: '',
    issuer: '',
    issueDate: '2026',
    credentialId: '',
    credentialUrl: '',
    skills: '',
    image: ''
  });

  const [newVolunteering, setNewVolunteering] = useState({
    role: '',
    organization: '',
    startDate: '2025',
    endDate: 'Present',
    description: ''
  });

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [cvFile, setCvFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Confirmation Dialog State (replaces browser confirm)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    id: null,
    title: '',
    message: '',
    isLoading: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Initial load of counts & data
  const loadInitialData = useCallback(async () => {
    if (!token) return;
    try {
      const [pRes, cRes, sRes, vRes, iRes] = await Promise.allSettled([
        projectApi.getAll(),
        certificateApi.getAll(),
        skillApi.getAll(),
        journeyApi.getVolunteering(),
        inquiryApi.getAll()
      ]);

      if (pRes.status === 'fulfilled') setProjects(pRes.value.data?.data || pRes.value.data || []);
      if (cRes.status === 'fulfilled') setCertificates(cRes.value.data?.data || cRes.value.data || []);
      if (sRes.status === 'fulfilled') setSkills(sRes.value.data?.data || sRes.value.data || []);
      if (vRes.status === 'fulfilled') setVolunteering(vRes.value.data?.data || vRes.value.data || []);
      if (iRes.status === 'fulfilled') setInquiries(iRes.value.data?.data || iRes.value.data || []);
    } catch (e) {
      console.warn('Initial data load error:', e);
    }
  }, [token]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load data according to active tab
  useEffect(() => {
    if (!token) return;

    if (activeTab === 'projects') {
      setLoading(true);
      projectApi.getAll()
        .then(res => setProjects(res.data.data || res.data || []))
        .catch(err => showToast(err.response?.data?.message || 'فشل في جلب المشاريع', 'error'))
        .finally(() => setLoading(false));
    } else if (activeTab === 'certificates') {
      setLoading(true);
      certificateApi.getAll()
        .then(res => setCertificates(res.data.data || res.data || []))
        .catch(err => showToast(err.response?.data?.message || 'فشل في جلب الشهادات', 'error'))
        .finally(() => setLoading(false));
    } else if (activeTab === 'skills') {
      setLoading(true);
      skillApi.getAll()
        .then(res => setSkills(res.data.data || res.data || []))
        .catch(err => showToast(err.response?.data?.message || 'فشل في جلب المهارات', 'error'))
        .finally(() => setLoading(false));
    } else if (activeTab === 'volunteering') {
      setLoading(true);
      journeyApi.getVolunteering()
        .then(res => setVolunteering(res.data.data || res.data || []))
        .catch(err => showToast(err.response?.data?.message || 'فشل في جلب الأنشطة التطوعية', 'error'))
        .finally(() => setLoading(false));
    } else if (activeTab === 'inquiries') {
      setLoading(true);
      inquiryApi.getAll()
        .then(res => setInquiries(res.data.data || res.data || []))
        .catch(err => showToast(err.response?.data?.message || 'فشل في جلب الرسائل', 'error'))
        .finally(() => setLoading(false));
    }
  }, [activeTab, token, showToast]);

  // ==================== CONFIRM MODAL CONTROLLER ====================
  const triggerDelete = (type, id, itemName = '') => {
    let title = 'تأكيد الحذف';
    let message = 'هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذه الخطوة.';

    if (type === 'project') {
      title = itemName ? `حذف المشروع: ${itemName}` : 'تأكيد حذف المشروع';
      message = 'هل أنت متأكد من رغبتك في حذف هذا المشروع نهائياً من الموقع ومعرض الأعمال؟';
    } else if (type === 'skill') {
      title = itemName ? `حذف مهارة: ${itemName}` : 'تأكيد حذف المهارة';
      message = 'هل أنت متأكد من رغبتك في حذف هذه المهارة من قائمة مهاراتك؟';
    } else if (type === 'cert') {
      title = itemName ? `حذف شهادة: ${itemName}` : 'تأكيد حذف الشهادة';
      message = 'هل أنت متأكد من رغبتك في حذف هذه الشهادة والاعتماد من الموقع؟';
    } else if (type === 'volunteering') {
      title = itemName ? `حذف نشاط: ${itemName}` : 'تأكيد حذف النشاط التطوعي';
      message = 'هل أنت متأكد من رغبتك في حذف هذا النشاط التطوعي؟';
    } else if (type === 'inquiry') {
      title = 'حذف رسالة الزائر';
      message = itemName ? `هل أنت متأكد من حذف رسالة الزائر (${itemName}) نهائياً؟` : 'هل أنت متأكد من حذف هذه الرسالة نهائياً؟';
    }

    setConfirmModal({
      isOpen: true,
      type,
      id,
      title,
      message,
      isLoading: false
    });
  };

  const handleConfirmDelete = async () => {
    const { type, id } = confirmModal;
    if (!type || !id) return;

    setConfirmModal(prev => ({ ...prev, isLoading: true }));
    try {
      if (type === 'project') {
        await projectApi.delete(id);
        showToast('تم حذف المشروع بنجاح', 'success');
        setProjects(prev => prev.filter(p => (p._id || p.id) !== id));
      } else if (type === 'skill') {
        await skillApi.delete(id);
        showToast('تم حذف المهارة بنجاح', 'success');
        setSkills(prev => prev.filter(s => (s._id || s.id) !== id));
      } else if (type === 'cert') {
        await certificateApi.delete(id);
        showToast('تم حذف الشهادة بنجاح', 'success');
        setCertificates(prev => prev.filter(c => (c._id || c.id) !== id));
      } else if (type === 'volunteering') {
        await journeyApi.deleteVolunteering(id);
        showToast('تم حذف النشاط التطوعي بنجاح', 'success');
        setVolunteering(prev => prev.filter(v => (v._id || v.id) !== id));
      } else if (type === 'inquiry') {
        await inquiryApi.delete(id);
        showToast('تم حذف الرسالة بنجاح', 'success');
        setInquiries(prev => prev.filter(m => (m._id || m.id) !== id));
      }
      setConfirmModal({ isOpen: false, type: null, id: null, title: '', message: '', isLoading: false });
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل في إتمام عملية الحذف', 'error');
      setConfirmModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  // ==================== PROJECTS HANDLERS ====================
  const handleAddProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: newProject.title,
        category: newProject.category,
        subtitle: newProject.subtitle,
        description: newProject.description,
        technologies: newProject.technologies.split(',').map(t => t.trim()).filter(Boolean),
        githubUrl: newProject.githubUrl,
        liveUrl: newProject.liveUrl,
        coverImage: newProject.coverImage || 'assets/img/backend_api.webp',
        image: newProject.coverImage || 'assets/img/backend_api.webp',
        gallery: newProject.gallery || [],
        images: newProject.gallery || []
      };
      await projectApi.create(payload);
      showToast('تمت إضافة المشروع بنجاح ورفعه للموقع!', 'success');
      setNewProject({
        title: '',
        category: 'MEAN Stack',
        subtitle: '',
        description: '',
        technologies: '',
        githubUrl: '',
        liveUrl: '',
        coverImage: '',
        gallery: []
      });
      const res = await projectApi.getAll();
      setProjects(res.data.data || res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'حدث خطأ أثناء إضافة المشروع', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject = async (id, payload) => {
    try {
      await projectApi.update(id, payload);
      showToast('تم تحديث بيانات المشروع بنجاح!', 'success');
      const res = await projectApi.getAll();
      setProjects(res.data.data || res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل في تحديث المشروع', 'error');
      throw err;
    }
  };

  // ==================== SKILLS HANDLERS ====================
  const handleAddSkill = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: newSkill.name,
        category: newSkill.category,
        level: newSkill.level,
        proficiency: Number(newSkill.proficiency) || 90,
        icon: newSkill.icon
      };
      await skillApi.create(payload);
      showToast('تمت إضافة المهارة بنجاح!', 'success');
      setNewSkill({
        name: '',
        category: 'frontend',
        level: 'Advanced',
        proficiency: 90,
        icon: 'fa-solid fa-code'
      });
      const res = await skillApi.getAll();
      setSkills(res.data.data || res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل في إضافة المهارة', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSkill = async (id, payload) => {
    try {
      await skillApi.update(id, payload);
      showToast('تم تحديث المهارة بنجاح!', 'success');
      const res = await skillApi.getAll();
      setSkills(res.data.data || res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل في تحديث المهارة', 'error');
      throw err;
    }
  };

  // ==================== CERTIFICATES HANDLERS ====================
  const handleAddCert = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: newCert.title,
        issuer: newCert.issuer,
        issueDate: newCert.issueDate,
        credentialId: newCert.credentialId,
        credentialUrl: newCert.credentialUrl,
        skills: newCert.skills.split(',').map(s => s.trim()).filter(Boolean),
        image: newCert.image
      };
      await certificateApi.create(payload);
      showToast('تمت إضافة الشهادة بنجاح!', 'success');
      setNewCert({
        title: '',
        issuer: '',
        issueDate: '2026',
        credentialId: '',
        credentialUrl: '',
        skills: '',
        image: ''
      });
      const res = await certificateApi.getAll();
      setCertificates(res.data.data || res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل في إضافة الشهادة', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCert = async (id, payload) => {
    try {
      await certificateApi.update(id, payload);
      showToast('تم تحديث الشهادة بنجاح!', 'success');
      const res = await certificateApi.getAll();
      setCertificates(res.data.data || res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل في تحديث الشهادة', 'error');
      throw err;
    }
  };

  // ==================== VOLUNTEERING HANDLERS ====================
  const handleAddVolunteering = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await journeyApi.createVolunteering(newVolunteering);
      showToast('تمت إضافة النشاط التطوعي بنجاح!', 'success');
      setNewVolunteering({
        role: '',
        organization: '',
        startDate: '2025',
        endDate: 'Present',
        description: ''
      });
      const res = await journeyApi.getVolunteering();
      setVolunteering(res.data.data || res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل في إضافة النشاط', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateVolunteering = async (id, payload) => {
    try {
      await journeyApi.updateVolunteering(id, payload);
      showToast('تم تحديث النشاط التطوعي بنجاح!', 'success');
      const res = await journeyApi.getVolunteering();
      setVolunteering(res.data.data || res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل في تحديث النشاط التطوعي', 'error');
      throw err;
    }
  };

  // ==================== CV & SECURITY HANDLERS ====================
  const handleUploadCV = async (e) => {
    e.preventDefault();
    if (!cvFile) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('cv', cvFile);
      await cvApi.upload(formData);
      showToast('تم رفع وتفعيل السيرة الذاتية الجديدة بنجاح على الموقع!', 'success');
      setCvFile(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل في رفع ملف السيرة الذاتية', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      showToast('كلمتا المرور غير متطابقتين', 'error');
      return;
    }
    if (passData.newPassword.length < 6) {
      showToast('يجب أن تكون كلمة المرور 6 أحرف على الأقل', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      showToast('تم تحديث كلمة المرور بنجاح! يرجى إعادة تسجيل الدخول.', 'success');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => logout(), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'فشل في تغيير كلمة المرور', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pure Arabic Navigation Items with Font Awesome Icons
  const navItems = [
    { id: 'projects', label: 'المشاريع والأعمال', faIcon: 'fa-solid fa-laptop-code', count: projects.length },
    { id: 'skills', label: 'المهارات والتقنيات', faIcon: 'fa-solid fa-code', count: skills.length },
    { id: 'certificates', label: 'الشهادات والاعتمادات', faIcon: 'fa-solid fa-graduation-cap', count: certificates.length },
    { id: 'volunteering', label: 'الخبرات والتطوع', faIcon: 'fa-solid fa-handshake-angle', count: volunteering.length },
    { id: 'inquiries', label: 'صندوق الرسائل', faIcon: 'fa-solid fa-inbox', count: inquiries.length },
    { id: 'cv', label: 'السيرة الذاتية (CV)', faIcon: 'fa-solid fa-file-pdf' },
    { id: 'security', label: 'الأمان والحساب', faIcon: 'fa-solid fa-shield-halved' }
  ];

  return (
    <div className="admin-root">
      <AdminHeader user={user} logout={logout} />

      <div className="admin-layout">
        <AdminSidebar navItems={navItems} activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="admin-main">
          {/* Top Classic Stats Grid with Font Awesome */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card" onClick={() => setActiveTab('projects')}>
              <div className="admin-stat-card__icon">
                <i className="fa-solid fa-briefcase"></i>
              </div>
              <div className="admin-stat-card__info">
                <span className="admin-stat-card__label">إجمالي المشاريع</span>
                <span className="admin-stat-card__value">{projects.length}</span>
              </div>
            </div>

            <div className="admin-stat-card" onClick={() => setActiveTab('skills')}>
              <div className="admin-stat-card__icon">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <div className="admin-stat-card__info">
                <span className="admin-stat-card__label">المهارات التقنية</span>
                <span className="admin-stat-card__value">{skills.length}</span>
              </div>
            </div>

            <div className="admin-stat-card" onClick={() => setActiveTab('certificates')}>
              <div className="admin-stat-card__icon">
                <i className="fa-solid fa-award"></i>
              </div>
              <div className="admin-stat-card__info">
                <span className="admin-stat-card__label">الشهادات المعتمدة</span>
                <span className="admin-stat-card__value">{certificates.length}</span>
              </div>
            </div>

            <div className="admin-stat-card" onClick={() => setActiveTab('inquiries')}>
              <div className="admin-stat-card__icon">
                <i className="fa-solid fa-envelope-open-text"></i>
              </div>
              <div className="admin-stat-card__info">
                <span className="admin-stat-card__label">رسائل الزوار</span>
                <span className="admin-stat-card__value">{inquiries.length}</span>
              </div>
            </div>
          </div>

          {loading && (
            <div style={{ padding: '0.8rem 1.25rem', marginBottom: '1.5rem', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontWeight: 600, border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-spinner fa-spin"></i>
              <span>جاري تحميل وتحديث البيانات...</span>
            </div>
          )}

          {activeTab === 'projects' && (
            <ProjectsTab
              projects={projects}
              newProject={newProject}
              setNewProject={setNewProject}
              handleAddProject={handleAddProject}
              handleUpdateProject={handleUpdateProject}
              handleDeleteProject={(id, title) => triggerDelete('project', id, title)}
              isSubmitting={isSubmitting}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsTab
              skills={skills}
              newSkill={newSkill}
              setNewSkill={setNewSkill}
              handleAddSkill={handleAddSkill}
              handleUpdateSkill={handleUpdateSkill}
              handleDeleteSkill={(id, name) => triggerDelete('skill', id, name)}
              isSubmitting={isSubmitting}
            />
          )}

          {activeTab === 'certificates' && (
            <CertificatesTab
              certificates={certificates}
              newCert={newCert}
              setNewCert={setNewCert}
              handleAddCert={handleAddCert}
              handleUpdateCert={handleUpdateCert}
              handleDeleteCert={(id, title) => triggerDelete('cert', id, title)}
              isSubmitting={isSubmitting}
            />
          )}

          {activeTab === 'volunteering' && (
            <VolunteeringTab
              volunteering={volunteering}
              newVolunteering={newVolunteering}
              setNewVolunteering={setNewVolunteering}
              handleAddVolunteering={handleAddVolunteering}
              handleUpdateVolunteering={handleUpdateVolunteering}
              handleDeleteVolunteering={(id, role) => triggerDelete('volunteering', id, role)}
              isSubmitting={isSubmitting}
            />
          )}

          {activeTab === 'inquiries' && (
            <InquiriesTab
              inquiries={inquiries}
              handleDeleteInquiry={(id, name) => triggerDelete('inquiry', id, name)}
            />
          )}

          {activeTab === 'cv' && (
            <CvTab
              cvFile={cvFile}
              setCvFile={setCvFile}
              handleUploadCV={handleUploadCV}
              isSubmitting={isSubmitting}
            />
          )}

          {activeTab === 'security' && (
            <SecurityTab
              passData={passData}
              setPassData={setPassData}
              handleChangePassword={handleChangePassword}
              isSubmitting={isSubmitting}
            />
          )}
        </main>
      </div>

      {/* Modern Custom Arabic Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
};

export default AdminDashboard;
