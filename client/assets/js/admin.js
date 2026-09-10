const getApiBase = () => {
  if (window.location.protocol === 'file:') return 'http://localhost:5000/api';
  if (window.location.port && window.location.port !== '5000') {
    return `http://${window.location.hostname || 'localhost'}:5000/api`;
  }
  return '/api';
};
const API_BASE = getApiBase();

// Data Caches
let projectsCache = [];
let experienceCache = [];
let educationCache = [];
let volunteeringCache = [];
let certificatesCache = [];
let videosCache = [];
let cvCache = [];
let activeCvData = null;
let skillsCache = [];
let filesCache = [];
let inquiriesCache = [];

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    showLoginScreen();
  } else {
    verifySession(token);
  }
  setupEventListeners();
}

/* ==================== AUTHENTICATION & SESSION ==================== */

function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('dashboard-layout').style.display = 'none';
}

function showDashboard() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('dashboard-layout').style.display = 'flex';

  // Load initial active view data
  loadAnalytics();
  loadProjects();
  loadInquiries();
}

async function verifySession(token) {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      localStorage.removeItem('admin_token');
      showLoginScreen();
      return;
    }
    const data = await res.json();

    if (data.success) {
      const userEl = document.getElementById('current-user-name');
      if (userEl) userEl.textContent = data.user.username;
      showDashboard();
    } else {
      localStorage.removeItem('admin_token');
      showLoginScreen();
    }
  } catch (err) {
    console.error('Session verification error:', err);
    localStorage.removeItem('admin_token');
    showLoginScreen();
  }
}

// Login Form Submit
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const alertBox = document.getElementById('login-alert');
    const loginBtn = document.getElementById('login-btn');

    alertBox.style.display = 'none';
    loginBtn.disabled = true;
    loginBtn.innerHTML = `<span>جاري الدخول...</span> <i class="ri-loader-4-line animate-spin"></i>`;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        showToast('تم تسجيل الدخول بنجاح!', 'success');
        showDashboard();
      } else {
        alertBox.textContent = data.message || 'بيانات الدخول غير صحيحة';
        alertBox.style.display = 'block';
      }
    } catch (err) {
      console.error('Login request error:', err);
      alertBox.textContent = 'تعذر الاتصال بالسيرفر. يرجى التأكد من تشغيل الباك إند.';
      alertBox.style.display = 'block';
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = `<span>تسجيل الدخول</span> <i class="ri-arrow-left-line"></i>`;
    }
  });
}

// Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('admin_token');
    showToast('تم تسجيل الخروج بنجاح', 'success');
    showLoginScreen();
  });
}

/* ==================== NAVIGATION TABS ==================== */

function setupEventListeners() {
  const navItems = document.querySelectorAll('.sidebar-menu .nav-item[data-tab]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabName = item.getAttribute('data-tab');
      switchToTab(tabName);
    });
  });

  const searchInput = document.getElementById('project-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterProjectsTable(e.target.value.toLowerCase());
    });
  }

  const refreshBtn = document.getElementById('refresh-stats-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadAnalytics();
      showToast('تم تحديث الإحصائيات', 'success');
    });
  }

  // Password Change Form
  const pwdForm = document.getElementById('change-password-form');
  if (pwdForm) {
    pwdForm.addEventListener('submit', handlePasswordChange);
  }
}

function toggleSidebarMobile(forceState) {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!sidebar) return;

  if (typeof forceState === 'boolean') {
    if (forceState) {
      sidebar.classList.add('show-mobile');
      if (overlay) overlay.classList.add('show');
    } else {
      sidebar.classList.remove('show-mobile');
      if (overlay) overlay.classList.remove('show');
    }
  } else {
    const isShowing = sidebar.classList.toggle('show-mobile');
    if (overlay) overlay.classList.toggle('show', isShowing);
  }
}

function switchToTab(tabName) {
  toggleSidebarMobile(false);
  document.querySelectorAll('.sidebar-menu .nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));

  const activeNav = document.querySelector(`.sidebar-menu .nav-item[data-tab="${tabName}"]`);
  const activeTab = document.getElementById(`tab-${tabName}`);

  if (activeNav) activeNav.classList.add('active');
  if (activeTab) activeTab.classList.add('active');

  const titleEl = document.getElementById('page-title');
  const subtitleEl = document.getElementById('page-subtitle');

  const titles = {
    overview: ['التحليلات والرئيسية', 'نظرة عامة على أداء الموقع وإحصائيات الزوار'],
    projects: ['إدارة المشاريع', 'إضافة وتعديل وحذف المشاريع وتحكم بحالتها وحقول يوتيوب'],
    experience: ['خبرات العمل', 'إدارة وتحديث خبراتك المهنية والوظائف المكتسبة'],
    education: ['التعليم الأكاديمي', 'إدارة المؤهلات العلمية والدراسة الأكاديمية'],
    volunteering: ['التطوع والتدريس', 'إدارة الأنشطة التطوعية والتدريبية (Support Community)'],
    certificates: ['الشهادات والاعتمادات', 'إدارة شهادات الدورات والدبلومات مع معاينات PDF'],
    videos: ['الفيديوهات والشروحات', 'إدارة ومقاطع الفيديو التعليمية والتوضيحية'],
    cv: ['إدارة الـ CV والملفات', 'رفع السيرة الذاتية بصيغة PDF وتحديد النسخة المفعّلة للموقع'],
    skills: ['المهارات والتخصصات', 'إدارة وتقييم مهارات الـ Full-Stack والـ MEAN Stack'],
    files: ['مدير الملفات بالسيرفر', 'عرض وتحميل وإدارة جميع الملفات المرفوعة في السيرفر'],
    inquiries: ['رسائل الزوار', 'متابعة وقراءة استفسارات التواصل الواردة من البورتفوليو'],
    settings: ['إعدادات الحساب', 'تغيير كلمة المرور والبيانات الأمنية لآدمن البورتفوليو']
  };

  if (titles[tabName]) {
    titleEl.textContent = titles[tabName][0];
    subtitleEl.textContent = titles[tabName][1];
  }

  // Dynamic fetch per active tab
  if (tabName === 'experience') loadExperience();
  if (tabName === 'education') loadEducation();
  if (tabName === 'volunteering') loadVolunteering();
  if (tabName === 'certificates') loadCertificates();
  if (tabName === 'videos') loadVideos();
  if (tabName === 'cv') loadCVs();
  if (tabName === 'skills') loadSkills();
  if (tabName === 'files') loadFiles();
  if (tabName === 'inquiries') loadInquiries();
}

/* ==================== TAB 1: ANALYTICS & OVERVIEW ==================== */

async function loadAnalytics() {
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.success && data.stats) {
      const { totalViews, totalUniqueVisitors, totalProjects, publishedProjects, draftProjects, totalInquiries, unreadInquiries, dailyBreakdown } = data.stats;

      document.getElementById('stat-total-views').textContent = totalViews.toLocaleString();
      document.getElementById('stat-unique-visitors').textContent = totalUniqueVisitors.toLocaleString();
      document.getElementById('stat-total-projects').textContent = totalProjects;
      document.getElementById('stat-projects-status').textContent = `${publishedProjects} منشور | ${draftProjects} مسودة`;
      document.getElementById('stat-total-inquiries').textContent = totalInquiries;
      document.getElementById('stat-unread-inquiries').innerHTML = `<i class="ri-mail-open-line"></i> ${unreadInquiries} غير مقروءة`;

      document.getElementById('projects-count-badge').textContent = totalProjects;
      const unreadBadge = document.getElementById('unread-inquiries-badge');
      if (unreadInquiries > 0) {
        unreadBadge.textContent = unreadInquiries;
        unreadBadge.style.display = 'inline-block';
      } else {
        unreadBadge.style.display = 'none';
      }

      renderAnalyticsTable(dailyBreakdown);
    }
  } catch (err) {
    console.error('Error loading analytics:', err);
  }
}

function renderAnalyticsTable(dailyBreakdown) {
  const tbody = document.getElementById('analytics-table-body');
  if (!dailyBreakdown || dailyBreakdown.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">لا تتوفر سجلات زيارات حالياً. قم بزيارة الموقع لتسجيل أول حركة زوار.</td></tr>`;
    return;
  }

  tbody.innerHTML = dailyBreakdown.map(item => `
    <tr>
      <td><strong>${item.date}</strong></td>
      <td><span class="badge badge-info">${item.views} زيارات</span></td>
      <td><span class="badge badge-success">${item.uniqueVisitors} زائر فريد</span></td>
    </tr>
  `).join('');
}

/* ==================== TAB 2: PROJECTS CRUD ==================== */

async function loadProjects() {
  try {
    const res = await fetch(`${API_BASE}/projects?includeDrafts=true`);
    const data = await res.json();

    if (data.success && data.data) {
      projectsCache = data.data;
      renderProjectsTable(projectsCache);
      document.getElementById('projects-count-badge').textContent = projectsCache.length;
    }
  } catch (err) {
    console.error('Error loading projects:', err);
  }
}

function renderProjectsTable(projects) {
  const tbody = document.getElementById('projects-table-body');
  if (!projects || projects.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">لا توجد مشاريع مضافة حالياً. اضغط "إضافة مشروع جديد" للبدء.</td></tr>`;
    return;
  }

  tbody.innerHTML = projects.map(p => {
    const isPublished = p.status === 'published';
    const statusBadge = isPublished
      ? `<span class="badge badge-success">منشور</span>`
      : `<span class="badge badge-warning">مسودة</span>`;

    const youtubeBadge = p.youtubeUrl || p.youtubeId
      ? `<span class="badge badge-danger"><i class="ri-youtube-fill"></i> متاح</span>`
      : `<span class="text-muted">-</span>`;

    return `
      <tr>
        <td>
          <img src="${p.image || 'assets/img/backend_api.jpg'}" alt="${p.title}" class="table-img" onerror="this.src='assets/img/backend_api.jpg'">
        </td>
        <td>
          <strong>${p.title}</strong>
          ${p.subtitle ? `<br><small class="text-muted">${p.subtitle}</small>` : ''}
        </td>
        <td><span class="badge badge-info">${p.category}</span></td>
        <td><small>${p.date || '-'}</small></td>
        <td>${youtubeBadge}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="action-tools">
            <button class="btn btn-icon btn-edit" title="تعديل المشروع" onclick="openEditProjectModal('${p._id || p.id}')">
              <i class="ri-edit-line"></i>
            </button>
            <button class="btn btn-icon btn-delete" title="حذف المشروع" onclick="deleteProject('${p._id || p.id}')">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterProjectsTable(query) {
  if (!query) {
    renderProjectsTable(projectsCache);
    return;
  }
  const filtered = projectsCache.filter(p => 
    p.title.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query) ||
    (p.description && p.description.toLowerCase().includes(query))
  );
  renderProjectsTable(filtered);
}

function openAddProjectModal() {
  document.getElementById('project-id').value = '';
  document.getElementById('modal-title').innerHTML = `<i class="ri-folder-add-line"></i> إضافة مشروع جديد`;
  document.getElementById('project-form').reset();
  document.getElementById('image-preview').src = 'assets/img/backend_api.jpg';
  document.getElementById('youtube-preview-container').style.display = 'none';
  document.getElementById('project-modal').style.display = 'flex';
}

function openEditProjectModal(id) {
  const project = projectsCache.find(p => p._id === id || p.id === id);
  if (!project) return;

  document.getElementById('project-id').value = project._id || project.id;
  document.getElementById('modal-title').innerHTML = `<i class="ri-edit-line"></i> تعديل بيانات المشروع`;

  document.getElementById('p-title').value = project.title || '';
  document.getElementById('p-category').value = project.category || '';
  document.getElementById('p-date').value = project.date || '';
  document.getElementById('p-description').value = project.description || '';
  document.getElementById('p-image-url').value = project.image || '';
  document.getElementById('p-subtitle').value = project.subtitle || '';
  document.getElementById('p-demo').value = project.demo || '';
  document.getElementById('p-github').value = project.github || '';
  document.getElementById('p-youtube').value = project.youtubeUrl || '';
  document.getElementById('p-technologies').value = Array.isArray(project.technologies) ? project.technologies.join(', ') : (project.technologies || '');
  document.getElementById('p-status').value = project.status || 'published';
  document.getElementById('p-order').value = project.orderIndex || 0;

  document.getElementById('image-preview').src = project.image || 'assets/img/backend_api.jpg';

  if (project.youtubeUrl) {
    previewYouTubeVideo(project.youtubeUrl);
  } else {
    document.getElementById('youtube-preview-container').style.display = 'none';
  }

  document.getElementById('project-modal').style.display = 'flex';
}

function closeProjectModal() {
  document.getElementById('project-modal').style.display = 'none';
}

function previewYouTubeVideo(url) {
  const container = document.getElementById('youtube-preview-container');
  const iframe = document.getElementById('youtube-preview-iframe');

  if (!url || !url.trim()) {
    container.style.display = 'none';
    iframe.src = '';
    return;
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  let videoId = (match && match[2].length === 11) ? match[2] : (url.length === 11 ? url : null);

  if (videoId) {
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
}

async function handleImageUpload(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const formData = new FormData();
  formData.append('image', file);

  const token = localStorage.getItem('admin_token');
  const statusText = document.getElementById('upload-status-text');
  statusText.textContent = 'جاري رفع الصورة...';

  try {
    const res = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();

    if (data.success) {
      document.getElementById('p-image-url').value = data.filePath;
      document.getElementById('image-preview').src = data.filePath;
      statusText.textContent = 'تم رفع الصورة بنجاح!';
      showToast('تم رفع صورة المشروع بنجاح', 'success');
    } else {
      statusText.textContent = 'فشل رفع الصورة';
      showToast(data.message || 'فشل رفع الصورة', 'error');
    }
  } catch (err) {
    console.error('Image upload error:', err);
    statusText.textContent = 'خطأ أثناء رفع الصورة';
  }
}

const projectForm = document.getElementById('project-form');
if (projectForm) {
  projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('project-id').value;
    const token = localStorage.getItem('admin_token');
    const saveBtn = document.getElementById('save-project-btn');

    const projectPayload = {
      title: document.getElementById('p-title').value.trim(),
      category: document.getElementById('p-category').value.trim(),
      date: document.getElementById('p-date').value.trim(),
      description: document.getElementById('p-description').value.trim(),
      image: document.getElementById('p-image-url').value.trim() || 'assets/img/backend_api.jpg',
      subtitle: document.getElementById('p-subtitle').value.trim(),
      demo: document.getElementById('p-demo').value.trim(),
      github: document.getElementById('p-github').value.trim(),
      youtubeUrl: document.getElementById('p-youtube').value.trim(),
      technologies: document.getElementById('p-technologies').value.trim(),
      status: document.getElementById('p-status').value,
      orderIndex: document.getElementById('p-order').value
    };

    saveBtn.disabled = true;
    saveBtn.innerHTML = `جاري الحفظ... <i class="ri-loader-4-line animate-spin"></i>`;

    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `${API_BASE}/projects/${id}` : `${API_BASE}/projects`;

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectPayload)
      });

      const data = await res.json();

      if (data.success) {
        showToast(data.message || 'تم حفظ بيانات المشروع بنجاح', 'success');
        closeProjectModal();
        loadProjects();
        loadAnalytics();
      } else {
        showToast(data.message || 'فشل حفظ البيانات', 'error');
      }
    } catch (err) {
      console.error('Save project error:', err);
      showToast('تعذر الاتصال بالسيرفر لحفظ المشروع', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<i class="ri-save-line"></i> <span>حفظ البيانات</span>`;
    }
  });
}

async function deleteProject(id) {
  if (!confirm('هل أنت تأكد من رغبتك في حذف هذا المشروع نهائياً؟')) return;
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('تم حذف المشروع بنجاح', 'success');
      loadProjects();
      loadAnalytics();
    }
  } catch (err) {
    console.error('Delete error:', err);
  }
}

/* ==================== TAB 3: EXPERIENCE CRUD ==================== */

async function loadExperience() {
  try {
    const res = await fetch(`${API_BASE}/experience`);
    const data = await res.json();
    if (data.success) {
      experienceCache = data.data;
      renderExperienceTable(experienceCache);
    }
  } catch (err) {
    console.error('Load experience error:', err);
  }
}

function renderExperienceTable(list) {
  const tbody = document.getElementById('experience-table-body');
  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">لا توجد خبرات عمل مضافة.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(item => `
    <tr>
      <td><strong>${item.title}</strong></td>
      <td><span class="badge badge-info">${item.company}</span></td>
      <td><small>${item.startDate || ''} - ${item.endDate || 'Present'}</small></td>
      <td><small class="text-muted">${item.description || '-'}</small></td>
      <td>${item.orderIndex || 1}</td>
      <td>
        <div class="action-tools">
          <button class="btn btn-icon btn-edit" onclick="openEditExperienceModal('${item._id}')"><i class="ri-edit-line"></i></button>
          <button class="btn btn-icon btn-delete" onclick="deleteExperience('${item._id}')"><i class="ri-delete-bin-line"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val !== undefined && val !== null ? val : '';
}

function openAddExperienceModal() {
  setVal('exp-id', '');
  const titleEl = document.getElementById('exp-modal-title');
  if (titleEl) titleEl.innerHTML = `<i class="ri-briefcase-line"></i> إضافة خبرة عمل جديدة`;
  const form = document.getElementById('experience-form');
  if (form) form.reset();
  const modal = document.getElementById('experience-modal');
  if (modal) modal.style.display = 'flex';
}

function openEditExperienceModal(id) {
  const item = experienceCache.find(x => x._id === id || x.id === id);
  if (!item) return;
  setVal('exp-id', item._id || item.id);
  const titleEl = document.getElementById('exp-modal-title');
  if (titleEl) titleEl.innerHTML = `<i class="ri-edit-line"></i> تعديل خبرة العمل`;
  setVal('exp-title', item.title);
  setVal('exp-company', item.company);
  setVal('exp-start', item.startDate);
  setVal('exp-end', item.endDate);
  setVal('exp-description', item.description);
  setVal('exp-order', item.orderIndex || 1);
  const modal = document.getElementById('experience-modal');
  if (modal) modal.style.display = 'flex';
}

function closeExperienceModal() {
  document.getElementById('experience-modal').style.display = 'none';
}

const expForm = document.getElementById('experience-form');
if (expForm) {
  expForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('exp-id').value;
    const token = localStorage.getItem('admin_token');

    const payload = {
      title: document.getElementById('exp-title').value.trim(),
      company: document.getElementById('exp-company').value.trim(),
      startDate: document.getElementById('exp-start').value.trim(),
      endDate: document.getElementById('exp-end').value.trim(),
      description: document.getElementById('exp-description').value.trim(),
      orderIndex: document.getElementById('exp-order').value
    };

    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `${API_BASE}/experience/${id}` : `${API_BASE}/experience`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم حفظ خبرة العمل بنجاح', 'success');
        closeExperienceModal();
        loadExperience();
      }
    } catch (err) {
      console.error('Save experience error:', err);
    }
  });
}

async function deleteExperience(id) {
  if (!confirm('هل تأكد من حذف خبرة العمل هذه؟')) return;
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`${API_BASE}/experience/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('تم حذف خبرة العمل بنجاح', 'success');
      loadExperience();
    }
  } catch (err) {
    console.error('Delete experience error:', err);
  }
}

/* ==================== TAB 4: EDUCATION CRUD ==================== */

async function loadEducation() {
  try {
    const res = await fetch(`${API_BASE}/education`);
    const data = await res.json();
    if (data.success) {
      educationCache = data.data;
      renderEducationTable(educationCache);
    }
  } catch (err) {
    console.error('Load education error:', err);
  }
}

function renderEducationTable(list) {
  const tbody = document.getElementById('education-table-body');
  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">لا توجد سجلات تعليم مضافة.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(item => `
    <tr>
      <td><strong>${item.degree}</strong></td>
      <td><span class="badge badge-info">${item.institution}</span></td>
      <td><small>${item.startDate || ''} - ${item.endDate || ''}</small></td>
      <td><small class="text-muted">${item.description || '-'}</small></td>
      <td>${item.orderIndex || 1}</td>
      <td>
        <div class="action-tools">
          <button class="btn btn-icon btn-edit" onclick="openEditEducationModal('${item._id}')"><i class="ri-edit-line"></i></button>
          <button class="btn btn-icon btn-delete" onclick="deleteEducation('${item._id}')"><i class="ri-delete-bin-line"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddEducationModal() {
  setVal('edu-id', '');
  const titleEl = document.getElementById('edu-modal-title');
  if (titleEl) titleEl.innerHTML = `<i class="ri-graduation-cap-line"></i> إضافة مؤهل تعليمي`;
  const form = document.getElementById('education-form');
  if (form) form.reset();
  const modal = document.getElementById('education-modal');
  if (modal) modal.style.display = 'flex';
}

function openEditEducationModal(id) {
  const item = educationCache.find(x => x._id === id || x.id === id);
  if (!item) return;
  setVal('edu-id', item._id || item.id);
  const titleEl = document.getElementById('edu-modal-title');
  if (titleEl) titleEl.innerHTML = `<i class="ri-edit-line"></i> تعديل المؤهل التعليمي`;
  setVal('edu-degree', item.degree);
  setVal('edu-institution', item.institution);
  setVal('edu-start', item.startDate);
  setVal('edu-end', item.endDate);
  setVal('edu-description', item.description);
  const modal = document.getElementById('education-modal');
  if (modal) modal.style.display = 'flex';
}

function closeEducationModal() {
  document.getElementById('education-modal').style.display = 'none';
}

const eduForm = document.getElementById('education-form');
if (eduForm) {
  eduForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edu-id').value;
    const token = localStorage.getItem('admin_token');

    const payload = {
      degree: document.getElementById('edu-degree').value.trim(),
      institution: document.getElementById('edu-institution').value.trim(),
      startDate: document.getElementById('edu-start').value.trim(),
      endDate: document.getElementById('edu-end').value.trim(),
      description: document.getElementById('edu-description').value.trim()
    };

    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `${API_BASE}/education/${id}` : `${API_BASE}/education`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم حفظ سجل التعليم بنجاح', 'success');
        closeEducationModal();
        loadEducation();
      }
    } catch (err) {
      console.error('Save education error:', err);
    }
  });
}

async function deleteEducation(id) {
  if (!confirm('هل تأكد من حذف المؤهل التعليمي؟')) return;
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`${API_BASE}/education/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('تم حذف المؤهل التعليمي بنجax', 'success');
      loadEducation();
    }
  } catch (err) {
    console.error('Delete education error:', err);
  }
}

/* ==================== TAB 5: VOLUNTEERING CRUD ==================== */

async function loadVolunteering() {
  try {
    const res = await fetch(`${API_BASE}/volunteering`);
    const data = await res.json();
    if (data.success) {
      volunteeringCache = data.data;
      renderVolunteeringTable(volunteeringCache);
    }
  } catch (err) {
    console.error('Load volunteering error:', err);
  }
}

function renderVolunteeringTable(list) {
  const tbody = document.getElementById('volunteering-table-body');
  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">لا توجد أنشطة تطوعية مضافة.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(item => `
    <tr>
      <td><strong>${item.role}</strong></td>
      <td><span class="badge badge-info">${item.organization}</span></td>
      <td><small>${item.startDate || ''} - ${item.endDate || 'Present'}</small></td>
      <td><small class="text-muted">${item.description || '-'}</small></td>
      <td>
        <div class="action-tools">
          <button class="btn btn-icon btn-edit" onclick="openEditVolunteeringModal('${item._id}')"><i class="ri-edit-line"></i></button>
          <button class="btn btn-icon btn-delete" onclick="deleteVolunteering('${item._id}')"><i class="ri-delete-bin-line"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddVolunteeringModal() {
  setVal('vol-id', '');
  const titleEl = document.getElementById('vol-modal-title');
  if (titleEl) titleEl.innerHTML = `<i class="ri-heart-line"></i> إضافة نشاط تطوعي جديد`;
  const form = document.getElementById('volunteering-form');
  if (form) form.reset();
  const modal = document.getElementById('volunteering-modal');
  if (modal) modal.style.display = 'flex';
}

function openEditVolunteeringModal(id) {
  const item = volunteeringCache.find(x => x._id === id || x.id === id);
  if (!item) return;
  setVal('vol-id', item._id || item.id);
  const titleEl = document.getElementById('vol-modal-title');
  if (titleEl) titleEl.innerHTML = `<i class="ri-edit-line"></i> تعديل النشاط التطوعي`;
  setVal('vol-role', item.role);
  setVal('vol-org', item.organization);
  setVal('vol-start', item.startDate);
  setVal('vol-end', item.endDate);
  setVal('vol-description', item.description);
  const modal = document.getElementById('volunteering-modal');
  if (modal) modal.style.display = 'flex';
}

function closeVolunteeringModal() {
  document.getElementById('volunteering-modal').style.display = 'none';
}

const volForm = document.getElementById('volunteering-form');
if (volForm) {
  volForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('vol-id').value;
    const token = localStorage.getItem('admin_token');

    const payload = {
      role: document.getElementById('vol-role').value.trim(),
      organization: document.getElementById('vol-org').value.trim(),
      startDate: document.getElementById('vol-start').value.trim(),
      endDate: document.getElementById('vol-end').value.trim(),
      description: document.getElementById('vol-description').value.trim()
    };

    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `${API_BASE}/volunteering/${id}` : `${API_BASE}/volunteering`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم حفظ النشاط التطوعي بنجاح', 'success');
        closeVolunteeringModal();
        loadVolunteering();
      }
    } catch (err) {
      console.error('Save volunteering error:', err);
    }
  });
}

async function deleteVolunteering(id) {
  if (!confirm('هل تأكد من حذف هذا النشاط التطوعي؟')) return;
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`${API_BASE}/volunteering/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('تم حذف النشاط التطوعي بنجاح', 'success');
      loadVolunteering();
    }
  } catch (err) {
    console.error('Delete volunteering error:', err);
  }
}

/* ==================== TAB 6: CERTIFICATES CRUD ==================== */

async function loadCertificates() {
  try {
    const res = await fetch(`${API_BASE}/certificates`);
    const data = await res.json();
    if (data.success) {
      certificatesCache = data.data;
      renderCertificatesTable(certificatesCache);
    }
  } catch (err) {
    console.error('Load certificates error:', err);
  }
}

function renderCertificatesTable(list) {
  const tbody = document.getElementById('certificates-table-body');
  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">لا توجد شهادات مضافة حالياً.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(item => {
    const hasPdf = item.pdfFile || item.fileUrl;
    const previewBtn = hasPdf
      ? `<button onclick="openPdfModal('${hasPdf}', '${item.name.replace(/'/g, "\\'")}')" class="btn btn-sm btn-secondary"><i class="ri-eye-line"></i> معاينة</button>
         <a href="${API_BASE}/files/download?filePath=${encodeURIComponent(hasPdf)}&name=${encodeURIComponent(item.name)}" class="btn btn-sm btn-primary" download><i class="ri-download-line"></i> تحميل</a>`
      : `<span class="text-muted">-</span>`;

    return `
      <tr>
        <td><strong>${item.name}</strong></td>
        <td><span class="badge badge-info">${item.issuer}</span></td>
        <td><small>${item.issueDate || '-'}</small></td>
        <td>${previewBtn}</td>
        <td>
          <div class="action-tools">
            <button class="btn btn-icon btn-edit" onclick="openEditCertificateModal('${item._id}')"><i class="ri-edit-line"></i></button>
            <button class="btn btn-icon btn-delete" onclick="deleteCertificate('${item._id}')"><i class="ri-delete-bin-line"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddCertificateModal() {
  setVal('cert-id', '');
  const titleEl = document.getElementById('cert-modal-title');
  if (titleEl) titleEl.innerHTML = `<i class="ri-award-line"></i> إضافة شهادة جديدة`;
  const form = document.getElementById('certificate-form');
  if (form) form.reset();
  const statusEl = document.getElementById('cert-upload-status');
  if (statusEl) statusEl.textContent = '';
  const modal = document.getElementById('certificate-modal');
  if (modal) modal.style.display = 'flex';
}

function openEditCertificateModal(id) {
  const item = certificatesCache.find(x => x._id === id || x.id === id);
  if (!item) return;
  setVal('cert-id', item._id || item.id);
  const titleEl = document.getElementById('cert-modal-title');
  if (titleEl) titleEl.innerHTML = `<i class="ri-edit-line"></i> تعديل بيانات الشهادة`;
  setVal('cert-name', item.name);
  setVal('cert-issuer', item.issuer);
  setVal('cert-date', item.issueDate);
  setVal('cert-file', item.pdfFile || item.fileUrl || '');
  const modal = document.getElementById('certificate-modal');
  if (modal) modal.style.display = 'flex';
}

function closeCertificateModal() {
  document.getElementById('certificate-modal').style.display = 'none';
}

async function handleCertUpload(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const formData = new FormData();
  formData.append('document', file);

  const token = localStorage.getItem('admin_token');
  const statusEl = document.getElementById('cert-upload-status');
  statusEl.textContent = 'جاري رفع ملف الشهادة...';

  try {
    const res = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('cert-file').value = data.filePath;
      statusEl.textContent = 'تم رفع ملف الشهادة بنجاح!';
      showToast('تم رفع الملف للسيرفر', 'success');
    }
  } catch (err) {
    statusEl.textContent = 'فشل الرفع';
  }
}

const certForm = document.getElementById('certificate-form');
if (certForm) {
  certForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('cert-id').value;
    const token = localStorage.getItem('admin_token');

    const payload = {
      name: document.getElementById('cert-name').value.trim(),
      issuer: document.getElementById('cert-issuer').value.trim(),
      issueDate: document.getElementById('cert-date').value.trim(),
      pdfFile: document.getElementById('cert-file').value.trim()
    };

    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `${API_BASE}/certificates/${id}` : `${API_BASE}/certificates`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم حفظ الشهادة بنجاح', 'success');
        closeCertificateModal();
        loadCertificates();
      }
    } catch (err) {
      console.error('Save certificate error:', err);
    }
  });
}

async function deleteCertificate(id) {
  if (!confirm('هل تأكد من حذف هذه الشهادة؟')) return;
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`${API_BASE}/certificates/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('تم حذف الشهادة بنجاح', 'success');
      loadCertificates();
    }
  } catch (err) {
    console.error('Delete certificate error:', err);
  }
}

/* ==================== TAB 7: VIDEOS CRUD ==================== */

async function loadVideos() {
  try {
    const res = await fetch(`${API_BASE}/videos`);
    const data = await res.json();
    if (data.success) {
      videosCache = data.data;
      renderVideosTable(videosCache);
    }
  } catch (err) {
    console.error('Load videos error:', err);
  }
}

function renderVideosTable(list) {
  const tbody = document.getElementById('videos-table-body');
  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">لا توجد فيديوهات مضافة.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(item => {
    const isYoutube = item.videoType === 'youtube' || item.youtubeUrl;
    const sourceBadge = isYoutube
      ? `<span class="badge badge-danger"><i class="ri-youtube-fill"></i> YouTube</span>`
      : `<span class="badge badge-info"><i class="ri-hard-drive-line"></i> Local Server Stream</span>`;

    return `
      <tr>
        <td><strong>${item.title}</strong></td>
        <td>${sourceBadge}</td>
        <td><small>${item.duration || '-'}</small></td>
        <td><span class="badge badge-secondary">${item.category || 'General'}</span></td>
        <td>
          <div class="action-tools">
            <button class="btn btn-icon btn-edit" onclick="openEditVideoModal('${item._id}')"><i class="ri-edit-line"></i></button>
            <button class="btn btn-icon btn-delete" onclick="deleteVideo('${item._id}')"><i class="ri-delete-bin-line"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddVideoModal() {
  document.getElementById('video-id').value = '';
  document.getElementById('video-modal-title').innerHTML = `<i class="ri-video-line"></i> إضافة فيديو جديد`;
  document.getElementById('video-form').reset();
  toggleVideoSourceType('youtube');
  document.getElementById('video-modal').style.display = 'flex';
}

function openEditVideoModal(id) {
  const item = videosCache.find(x => x._id === id);
  if (!item) return;
  document.getElementById('video-id').value = item._id;
  document.getElementById('video-modal-title').innerHTML = `<i class="ri-edit-line"></i> تعديل بيانات الفيديو`;
  document.getElementById('vid-title').value = item.title || '';
  document.getElementById('vid-source').value = item.videoType || (item.youtubeUrl ? 'youtube' : 'local');
  document.getElementById('vid-youtube-url').value = item.youtubeUrl || '';
  document.getElementById('vid-local-path').value = item.videoPath || '';
  document.getElementById('vid-duration').value = item.duration || '';
  document.getElementById('vid-category').value = item.category || '';
  toggleVideoSourceType(item.videoType || 'youtube');
  document.getElementById('video-modal').style.display = 'flex';
}

function closeVideoModal() {
  document.getElementById('video-modal').style.display = 'none';
}

function toggleVideoSourceType(type) {
  if (type === 'youtube') {
    document.getElementById('vid-youtube-box').style.display = 'block';
    document.getElementById('vid-local-box').style.display = 'none';
  } else {
    document.getElementById('vid-youtube-box').style.display = 'none';
    document.getElementById('vid-local-box').style.display = 'block';
  }
}

async function handleVideoUpload(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const formData = new FormData();
  formData.append('video', file);

  const token = localStorage.getItem('admin_token');
  const statusEl = document.getElementById('vid-upload-status');
  statusEl.textContent = 'جاري رفع الفيديو للسيرفر...';

  try {
    const res = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('vid-local-path').value = data.filePath;
      statusEl.textContent = 'تم رفع الفيديو بنجاح!';
      showToast('تم رفع ملف الفيديو للسيرفر', 'success');
    }
  } catch (err) {
    statusEl.textContent = 'فشل الرفع';
  }
}

const vidForm = document.getElementById('video-form');
if (vidForm) {
  vidForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('video-id').value;
    const token = localStorage.getItem('admin_token');
    const sourceType = document.getElementById('vid-source').value;

    const payload = {
      title: document.getElementById('vid-title').value.trim(),
      videoType: sourceType,
      youtubeUrl: sourceType === 'youtube' ? document.getElementById('vid-youtube-url').value.trim() : '',
      videoPath: sourceType === 'local' ? document.getElementById('vid-local-path').value.trim() : '',
      duration: document.getElementById('vid-duration').value.trim(),
      category: document.getElementById('vid-category').value.trim()
    };

    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `${API_BASE}/videos/${id}` : `${API_BASE}/videos`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم حفظ الفيديو بنجاح', 'success');
        closeVideoModal();
        loadVideos();
      }
    } catch (err) {
      console.error('Save video error:', err);
    }
  });
}

async function deleteVideo(id) {
  if (!confirm('هل تأكد من حذف هذا الفيديو؟')) return;
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`${API_BASE}/videos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('تم حذف الفيديو بنجاح', 'success');
      loadVideos();
    }
  } catch (err) {
    console.error('Delete video error:', err);
  }
}

/* ==================== TAB 8: CV MANAGEMENT ==================== */

async function loadCVs() {
  try {
    const res = await fetch(`${API_BASE}/cv`);
    const data = await res.json();
    if (data.success) {
      cvCache = data.data || [];
      activeCvData = cvCache.find(x => x.active) || cvCache[0];
      renderActiveCvBanner(activeCvData);
      renderCvTable(cvCache);
    }
  } catch (err) {
    console.error('Load CV error:', err);
  }
}

function renderActiveCvBanner(cv) {
  if (!cv) {
    document.getElementById('active-cv-name').textContent = 'لا يوجد CV مفعّل حالياً';
    document.getElementById('active-cv-meta').textContent = 'قم برفع ملف PDF وتفعيله كـ CV للموقع';
    return;
  }
  document.getElementById('active-cv-name').textContent = cv.name || cv.originalName || 'Eslam_Yasser_Resume.pdf';
  document.getElementById('active-cv-meta').textContent = `نسخة ${cv.version || 'v1.0'} | مرفوعة في ${new Date(cv.createdAt || Date.now()).toLocaleDateString('ar-EG')}`;
}

function renderCvTable(list) {
  const tbody = document.getElementById('cv-table-body');
  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">لا توجد نسخ CV سابقة.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(cv => {
    const isActive = cv.active;
    const statusBadge = isActive
      ? `<span class="badge badge-success"><i class="ri-checkbox-circle-fill"></i> مفعّل حالياً</span>`
      : `<button class="btn btn-sm btn-secondary" onclick="setActiveCv('${cv._id}')">تفعيل الآن</button>`;

    const formattedDate = new Date(cv.createdAt || Date.now()).toLocaleDateString('ar-EG');
    const dlUrl = `${API_BASE}/files/download?filePath=${encodeURIComponent(cv.pdfFile)}&name=${encodeURIComponent(cv.originalName || cv.name)}`;

    return `
      <tr>
        <td><strong>${cv.name}</strong></td>
        <td><span class="badge badge-info">${cv.version || 'v1.0'}</span></td>
        <td><small class="text-muted">${formattedDate}</small></td>
        <td>${statusBadge}</td>
        <td>
          <div class="action-tools">
            <button class="btn btn-icon btn-edit" title="تحميل" onclick="downloadFileBlob('${dlUrl}', '${(cv.originalName || cv.name).replace(/'/g, "\\'")}')"><i class="ri-download-line"></i></button>
            ${!isActive ? `<button class="btn btn-icon btn-delete" title="حذف" onclick="deleteCv('${cv._id}')"><i class="ri-delete-bin-line"></i></button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddCvModal() {
  document.getElementById('cv-form').reset();
  document.getElementById('cv-upload-status').textContent = '';
  document.getElementById('cv-modal').style.display = 'flex';
}

function closeCvModal() {
  document.getElementById('cv-modal').style.display = 'none';
}

async function handleCvUpload(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const formData = new FormData();
  formData.append('cv', file);

  const token = localStorage.getItem('admin_token');
  const statusEl = document.getElementById('cv-upload-status');
  statusEl.textContent = 'جاري رفع ملف السيرة الذاتية...';

  try {
    const res = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('cv-path').value = data.filePath;
      if (!document.getElementById('cv-name').value) {
        document.getElementById('cv-name').value = data.originalName || file.name;
      }
      statusEl.textContent = `تم الرفع: ${data.originalName || file.name}`;
      showToast('تم رفع ملف الـ CV بنجاح', 'success');
    }
  } catch (err) {
    statusEl.textContent = 'فشل الرفع';
  }
}

const cvForm = document.getElementById('cv-form');
if (cvForm) {
  cvForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');

    const payload = {
      name: document.getElementById('cv-name').value.trim(),
      version: document.getElementById('cv-version').value.trim() || 'v1.0',
      pdfFile: document.getElementById('cv-path').value.trim() || '/assets/pdf/Eslam_Yasser_Resume.pdf',
      active: document.getElementById('cv-set-active').checked
    };

    try {
      const res = await fetch(`${API_BASE}/cv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم حفظ وتفعيل الـ CV الجديد بنجاح', 'success');
        closeCvModal();
        loadCVs();
      }
    } catch (err) {
      console.error('Save CV error:', err);
    }
  });
}

async function setActiveCv(id) {
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`${API_BASE}/cv/${id}/active`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('تم تعيين الـ CV كـ مفعّل للموقع', 'success');
      loadCVs();
    }
  } catch (err) {
    console.error('Activate CV error:', err);
  }
}

async function deleteCv(id) {
  if (!confirm('هل أنت تأكد من رغبتك في حذف نسخة الـ CV هذه؟')) return;
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`${API_BASE}/cv/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('تم حذف الـ CV بنجاح', 'success');
      loadCVs();
    }
  } catch (err) {
    console.error('Delete CV error:', err);
  }
}

async function downloadFileBlob(url, filename) {
  const targetName = filename || 'document.pdf';
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (response.ok) {
      const blob = await response.blob();
      if (blob && blob.size > 0) {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = targetName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
          if (a.parentNode) document.body.removeChild(a);
        }, 1000);
        return;
      }
    }
  } catch (err) {
    console.warn('Blob download fallback:', err);
  }

  // Fallback direct link
  triggerDirectDownload(url, targetName);
}

function triggerDirectDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  if (filename) a.download = filename;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { if (a.parentNode) document.body.removeChild(a); }, 1000);
}

function openPdfModal(pdfUrl, title, originalFileName) {
  const modal = document.getElementById("pdf-viewer-modal");
  const container = document.getElementById("pdf-modal-container");
  const titleEl = document.getElementById("pdf-modal-title");
  const downloadBtn = document.getElementById("pdf-modal-download-btn");

  if (!modal || !container) return;

  const fileName = originalFileName || (title ? `${title}.pdf` : 'Eslam_Yasser_Resume.pdf');
  const viewUrl = `${API_BASE}/files/view-pdf?filePath=${encodeURIComponent(pdfUrl)}`;
  const downloadUrl = `${API_BASE}/files/download?filePath=${encodeURIComponent(pdfUrl)}&name=${encodeURIComponent(fileName)}`;

  if (titleEl) titleEl.innerHTML = `<i class="ri-file-pdf-2-line text-primary"></i> ${title || 'معاينة المستند'}`;
  if (downloadBtn) {
    downloadBtn.href = downloadUrl;
    downloadBtn.onclick = (e) => {
      e.preventDefault();
      downloadFileBlob(downloadUrl, fileName);
    };
  }

  container.innerHTML = `
    <div id="pdf-viewer-wrapper" style="width:100%; height:100%; display:flex; flex-direction:column; background:#0f172a; border-radius:0 0 12px 12px; overflow:hidden;">
      <div style="padding:10px 15px; background:#1e293b; display:flex; justify-between; align-items:center; border-bottom:1px solid #334155; flex-wrap:wrap; gap:10px;">
        <span style="color:#94a3b8; font-size:0.85rem;"><i class="ri-information-line"></i> استعراض المستند المباشر في النافذة</span>
        <div style="display:flex; gap:8px;">
          <button id="btn-mode-native" class="btn btn-sm btn-primary" onclick="switchPdfViewMode('native', '${viewUrl}')"><i class="ri-pages-line"></i> العرض الأصلي المباشر</button>
          <button id="btn-mode-canvas" class="btn btn-sm btn-secondary" onclick="switchPdfViewMode('canvas', '${viewUrl}')"><i class="ri-image-line"></i> عرض Canvas HD</button>
        </div>
      </div>
      <div id="pdf-view-body" style="flex:1; width:100%; height:100%; min-height:70vh; overflow:hidden;">
        <object data="${viewUrl}#toolbar=1" type="application/pdf" style="width:100%; height:100%; border:none;">
          <iframe src="${viewUrl}" style="width:100%; height:100%; border:none;"></iframe>
        </object>
      </div>
    </div>
  `;

  modal.style.display = "flex";
}

function switchPdfViewMode(mode, viewUrl) {
  const body = document.getElementById('pdf-view-body');
  const btnNative = document.getElementById('btn-mode-native');
  const btnCanvas = document.getElementById('btn-mode-canvas');
  if (!body) return;

  if (mode === 'native') {
    if (btnNative) { btnNative.className = 'btn btn-sm btn-primary'; }
    if (btnCanvas) { btnCanvas.className = 'btn btn-sm btn-secondary'; }
    body.innerHTML = `
      <object data="${viewUrl}#toolbar=1" type="application/pdf" style="width:100%; height:100%; border:none;">
        <iframe src="${viewUrl}" style="width:100%; height:100%; border:none;"></iframe>
      </object>
    `;
  } else if (mode === 'canvas') {
    if (btnNative) { btnNative.className = 'btn btn-sm btn-secondary'; }
    if (btnCanvas) { btnCanvas.className = 'btn btn-sm btn-primary'; }
    body.innerHTML = `
      <div id="pdf-scroll-box" style="width:100%; height:100%; overflow-y:auto; padding:20px; display:flex; flex-direction:column; align-items:center; gap:20px; background:#0f172a;">
        <div id="pdf-loading-msg" style="color:#93c5fd; padding:20px; font-size:0.9rem; text-align:center;">
          <i class="ri-loader-4-line animate-spin" style="font-size:1.5rem; display:block; margin-bottom:8px;"></i>
          جاري معالجة صفحات الـ PDF بدقة HD...
        </div>
        <div id="pdf-canvas-container" style="width:100%; display:flex; flex-direction:column; align-items:center; gap:20px;"></div>
      </div>
    `;

    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      fetch(viewUrl)
        .then(r => r.arrayBuffer())
        .then(buffer => {
          return pdfjsLib.getDocument({
            data: buffer,
            cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
            cMapPacked: true,
            standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/'
          }).promise;
        })
        .then(pdf => {
          const loadingEl = document.getElementById('pdf-loading-msg');
          if (loadingEl) loadingEl.style.display = 'none';
          const container = document.getElementById('pdf-canvas-container');
          if (!container) return;
          container.innerHTML = '';

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            pdf.getPage(pageNum).then(page => {
              const canvas = document.createElement('canvas');
              canvas.style.maxWidth = '100%';
              canvas.style.height = 'auto';
              canvas.style.borderRadius = '8px';
              canvas.style.boxShadow = '0 8px 25px rgba(0,0,0,0.5)';

              const scale = 1.5;
              const viewport = page.getViewport({ scale: scale });
              const outputScale = window.devicePixelRatio || 1;

              canvas.width = Math.floor(viewport.width * outputScale);
              canvas.height = Math.floor(viewport.height * outputScale);
              canvas.style.width = Math.floor(viewport.width) + "px";
              canvas.style.height = Math.floor(viewport.height) + "px";

              const ctx = canvas.getContext('2d');
              const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

              container.appendChild(canvas);
              page.render({ canvasContext: ctx, transform: transform, viewport: viewport });
            });
          }
        })
        .catch(err => {
          console.error('Canvas render error:', err);
          const loadingEl = document.getElementById('pdf-loading-msg');
          if (loadingEl) loadingEl.innerHTML = `<div style="color:#f87171; padding:15px;">تعذر المعالجة المحلية. يمكنك التبديل للعرض الأصلي المباشر.</div>`;
        });
    }
  }
}

function closePdfModal() {
  const modal = document.getElementById("pdf-viewer-modal");
  const container = document.getElementById("pdf-modal-container");
  if (modal) {
    if (container) container.innerHTML = "";
    modal.style.display = "none";
  }
}

function handleActiveCvView() {
  const path = activeCvData ? activeCvData.pdfFile : '/assets/pdf/Eslam_Yasser_Resume.pdf';
  const name = activeCvData ? (activeCvData.originalName || activeCvData.name) : 'Eslam_Yasser_Resume.pdf';
  openPdfModal(path, name, name);
}

function handleActiveCvDownload() {
  const path = activeCvData ? activeCvData.pdfFile : '/assets/pdf/Eslam_Yasser_Resume.pdf';
  const name = activeCvData ? (activeCvData.originalName || activeCvData.name) : 'Eslam_Yasser_Resume.pdf';
  const cleanName = name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`;
  const downloadUrl = `${API_BASE}/files/download?filePath=${encodeURIComponent(path)}&name=${encodeURIComponent(cleanName)}`;

  downloadFileBlob(downloadUrl, cleanName);
}

/* ==================== TAB 9: SKILLS CRUD ==================== */

async function loadSkills() {
  try {
    const res = await fetch(`${API_BASE}/skills`);
    const data = await res.json();
    if (data.success) {
      skillsCache = data.data;
      renderSkillsTable(skillsCache);
    }
  } catch (err) {
    console.error('Load skills error:', err);
  }
}

function renderSkillsTable(list) {
  const tbody = document.getElementById('skills-table-body');
  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">لا توجد مهارات مضافة.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(item => `
    <tr>
      <td><strong>${item.name}</strong></td>
      <td><span class="badge badge-info">${item.category}</span></td>
      <td><span class="badge badge-success">${item.proficiency}%</span></td>
      <td><i class="${item.iconClass || 'ri-code-line'} font-18"></i> <small>${item.iconClass || '-'}</small></td>
      <td>${item.active ? '<span class="badge badge-success">نشط</span>' : '<span class="badge badge-secondary">مخفي</span>'}</td>
      <td>
        <div class="action-tools">
          <button class="btn btn-icon btn-edit" onclick="openEditSkillModal('${item._id}')"><i class="ri-edit-line"></i></button>
          <button class="btn btn-icon btn-delete" onclick="deleteSkill('${item._id}')"><i class="ri-delete-bin-line"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddSkillModal() {
  document.getElementById('skill-id').value = '';
  document.getElementById('skill-modal-title').innerHTML = `<i class="ri-code-box-line"></i> إضافة مهارة جديدة`;
  document.getElementById('skill-form').reset();
  document.getElementById('skill-modal').style.display = 'flex';
}

function openEditSkillModal(id) {
  const item = skillsCache.find(x => x._id === id);
  if (!item) return;
  document.getElementById('skill-id').value = item._id;
  document.getElementById('skill-modal-title').innerHTML = `<i class="ri-edit-line"></i> تعديل المهارة`;
  document.getElementById('skill-name').value = item.name || '';
  document.getElementById('skill-category').value = item.category || 'Backend';
  document.getElementById('skill-proficiency').value = item.proficiency || 90;
  document.getElementById('skill-icon').value = item.iconClass || '';
  document.getElementById('skill-modal').style.display = 'flex';
}

function closeSkillModal() {
  document.getElementById('skill-modal').style.display = 'none';
}

const skillForm = document.getElementById('skill-form');
if (skillForm) {
  skillForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('skill-id').value;
    const token = localStorage.getItem('admin_token');

    const payload = {
      name: document.getElementById('skill-name').value.trim(),
      category: document.getElementById('skill-category').value,
      proficiency: document.getElementById('skill-proficiency').value,
      iconClass: document.getElementById('skill-icon').value.trim()
    };

    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `${API_BASE}/skills/${id}` : `${API_BASE}/skills`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم حفظ المهارة بنجاح', 'success');
        closeSkillModal();
        loadSkills();
      }
    } catch (err) {
      console.error('Save skill error:', err);
    }
  });
}

async function deleteSkill(id) {
  if (!confirm('هل تأكد من حذف هذه المهارة؟')) return;
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`${API_BASE}/skills/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('تم حذف المهارة', 'success');
      loadSkills();
    }
  } catch (err) {
    console.error('Delete skill error:', err);
  }
}

/* ==================== TAB 10: FILE MANAGER ==================== */

async function loadFiles() {
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`${API_BASE}/files`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      filesCache = data.data;
      renderFilesTable(filesCache);
    }
  } catch (err) {
    console.error('Load files error:', err);
  }
}

function renderFilesTable(list) {
  const tbody = document.getElementById('files-table-body');
  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">لا توجد ملفات مرفوعة بالسيرفر حالياً.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(item => {
    const sizeKb = (item.size / 1024).toFixed(1);
    const formattedDate = new Date(item.createdAt).toLocaleDateString('ar-EG');

    return `
      <tr>
        <td><strong>${item.originalName || item.filename}</strong></td>
        <td><small class="text-muted">${item.path}</small></td>
        <td><span class="badge badge-info">${item.category || 'general'}</span></td>
        <td><small>${sizeKb} KB</small></td>
        <td><small class="text-muted">${formattedDate}</small></td>
        <td>
          <div class="action-tools">
            <a href="${API_BASE}/files/download?filePath=${encodeURIComponent(item.path)}&name=${encodeURIComponent(item.originalName)}" class="btn btn-icon btn-edit" title="تحميل"><i class="ri-download-line"></i></a>
            <button class="btn btn-icon btn-delete" title="حذف" onclick="deleteFileRecord('${item._id}')"><i class="ri-delete-bin-line"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function handleFileManagerUpload(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const formData = new FormData();
  formData.append('document', file);

  const token = localStorage.getItem('admin_token');

  try {
    const res = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      showToast('تم رفع الملف إلى السيرفر بنجاح', 'success');
      loadFiles();
    } else {
      showToast(data.message || 'فشل رفع الملف', 'error');
    }
  } catch (err) {
    console.error('File upload error:', err);
  }
}

async function deleteFileRecord(id) {
  if (!confirm('هل تأكد من حذف هذا الملف من السيرفر نهائياً؟')) return;
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`${API_BASE}/files/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('تم حذف الملف من السيرفر', 'success');
      loadFiles();
    }
  } catch (err) {
    console.error('Delete file error:', err);
  }
}

/* ==================== TAB 11: INQUIRIES & MESSAGES ==================== */

async function loadInquiries() {
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`${API_BASE}/inquiries`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      inquiriesCache = data.data;
      renderInquiriesTable(inquiriesCache);
    }
  } catch (err) {
    console.error('Load inquiries error:', err);
  }
}

function renderInquiriesTable(inquiries) {
  const tbody = document.getElementById('inquiries-table-body');
  if (!inquiries || inquiries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">لا توجد رسائل واردة من الزوار حتى الآن.</td></tr>`;
    return;
  }

  tbody.innerHTML = inquiries.map(item => {
    const isUnread = item.status === 'unread';
    const statusBadge = isUnread
      ? `<span class="badge badge-warning">جديدة</span>`
      : `<span class="badge badge-secondary">مقروءة</span>`;

    const formattedDate = new Date(item.createdAt).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return `
      <tr style="${isUnread ? 'font-weight: 600; background: rgba(245, 158, 11, 0.05);' : ''}">
        <td>${item.name}</td>
        <td><a href="mailto:${item.email}" class="text-primary">${item.email}</a></td>
        <td>
          <div style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${item.message}
          </div>
        </td>
        <td><small class="text-muted">${formattedDate}</small></td>
        <td>${statusBadge}</td>
        <td>
          <div class="action-tools">
            <button class="btn btn-icon btn-edit" title="قراءة الرسالة" onclick="openInquiryModal('${item._id}')">
              <i class="ri-mail-open-line"></i>
            </button>
            <button class="btn btn-icon btn-delete" title="حذف الرسالة" onclick="deleteInquiry('${item._id}')">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openInquiryModal(id) {
  const item = inquiriesCache.find(i => i._id === id);
  if (!item) return;

  document.getElementById('inq-detail-name').textContent = item.name;
  document.getElementById('inq-detail-email').textContent = item.email;
  document.getElementById('inq-detail-email-link').href = `mailto:${item.email}`;
  document.getElementById('inq-detail-date').textContent = new Date(item.createdAt).toLocaleString('ar-EG');
  document.getElementById('inq-detail-message').textContent = item.message;
  document.getElementById('inq-reply-btn').href = `mailto:${item.email}?subject=RE: ${encodeURIComponent(item.subject || 'Portfolio Inquiry')}`;

  document.getElementById('inquiry-modal').style.display = 'flex';

  if (item.status === 'unread') {
    markInquiryStatus(id, 'read');
  }
}

function closeInquiryModal() {
  document.getElementById('inquiry-modal').style.display = 'none';
}

async function markInquiryStatus(id, status) {
  const token = localStorage.getItem('admin_token');
  try {
    await fetch(`${API_BASE}/inquiries/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    loadInquiries();
    loadAnalytics();
  } catch (err) {
    console.error('Error updating inquiry status:', err);
  }
}

async function deleteInquiry(id) {
  if (!confirm('هل أنت تأكد من حذف هذه الرسالة؟')) return;
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`${API_BASE}/inquiries/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('تم حذف الرسالة بنجاح', 'success');
      loadInquiries();
      loadAnalytics();
    }
  } catch (err) {
    console.error('Delete inquiry error:', err);
  }
}

/* ==================== TAB 12: SETTINGS & PASSWORD CHANGE ==================== */

async function handlePasswordChange(e) {
  e.preventDefault();
  const currentPassword = document.getElementById('current-password').value.trim();
  const newPassword = document.getElementById('new-password').value.trim();
  const token = localStorage.getItem('admin_token');
  const saveBtn = document.getElementById('save-password-btn');

  if (newPassword.length < 6) {
    showToast('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.innerHTML = `جاري الحفظ... <i class="ri-loader-4-line animate-spin"></i>`;

  try {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'تم تغيير كلمة المرور بنجاح', 'success');
      document.getElementById('change-password-form').reset();
    } else {
      showToast(data.message || 'فشل تغيير كلمة المرور', 'error');
    }
  } catch (err) {
    console.error('Change password error:', err);
    showToast('خطأ أثناء التواصل مع السيرفر', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `<i class="ri-save-line"></i> <span>حفظ التغييرات</span>`;
  }
}

/* ==================== UTILS: TOAST NOTIFICATIONS ==================== */

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="${type === 'success' ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill'}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}
