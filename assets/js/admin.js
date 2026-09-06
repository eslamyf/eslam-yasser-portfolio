/*=============== ADMIN DASHBOARD LOGIC (JWT AUTH, CRUD, ANALYTICS, INQUIRIES) ===============*/

const API_BASE = '/api';
let projectsCache = [];
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

  // Load initial data
  loadAnalytics();
  loadProjects();
  loadInquiries();
}

async function verifySession(token) {
  try {
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.success) {
      document.getElementById('current-user-name').textContent = data.user.username;
      showDashboard();
    } else {
      localStorage.removeItem('admin_token');
      showLoginScreen();
    }
  } catch (err) {
    console.error('Session verification error:', err);
    // If backend server is starting up or disconnected, show dashboard with cache fallback if needed
    showDashboard();
  }
}

// Login Form Submit
document.getElementById('login-form').addEventListener('submit', async (e) => {
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

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('admin_token');
  showToast('تم تسجيل الخروج بنجاح', 'success');
  showLoginScreen();
});

/* ==================== NAVIGATION TABS ==================== */

function setupEventListeners() {
  // Navigation sidebar buttons
  const navItems = document.querySelectorAll('.sidebar-menu .nav-item[data-tab]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabName = item.getAttribute('data-tab');
      switchToTab(tabName);
    });
  });

  // Project search input
  const searchInput = document.getElementById('project-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      filterProjectsTable(query);
    });
  }

  // Refresh Stats button
  const refreshBtn = document.getElementById('refresh-stats-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadAnalytics();
      showToast('تم تحديث البيانات والإحصائيات', 'success');
    });
  }
}

function switchToTab(tabName) {
  document.querySelectorAll('.sidebar-menu .nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));

  const activeNav = document.querySelector(`.sidebar-menu .nav-item[data-tab="${tabName}"]`);
  const activeTab = document.getElementById(`tab-${tabName}`);

  if (activeNav) activeNav.classList.add('active');
  if (activeTab) activeTab.classList.add('active');

  // Update Page Title
  const titleEl = document.getElementById('page-title');
  const subtitleEl = document.getElementById('page-subtitle');

  if (tabName === 'overview') {
    titleEl.textContent = 'التحليلات والرئيسية';
    subtitleEl.textContent = 'نظرة عامة على أداء الموقع وإحصائيات الزوار';
  } else if (tabName === 'projects') {
    titleEl.textContent = 'إدارة المشاريع';
    subtitleEl.textContent = 'إضافة وتعديل وحذف المشاريع وتحكم بحالتها وحقول يوتيوب';
  } else if (tabName === 'inquiries') {
    titleEl.textContent = 'رسائل الزوار والاستفسارات';
    subtitleEl.textContent = 'متابعة وقراءة الاستفسارات الواردة من صفحة التواصل';
  }
}

/* ==================== TAB 1: ANALYTICS & OVERVIEW ==================== */

async function loadAnalytics() {
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
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

      // Update badge counts
      document.getElementById('projects-count-badge').textContent = totalProjects;
      const unreadBadge = document.getElementById('unread-inquiries-badge');
      if (unreadInquiries > 0) {
        unreadBadge.textContent = unreadInquiries;
        unreadBadge.style.display = 'inline-block';
      } else {
        unreadBadge.style.display = 'none';
      }

      // Render daily analytics table
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
    document.getElementById('projects-table-body').innerHTML = `<tr><td colspan="7" class="text-center text-danger">فشل تحميل المشاريع من السيرفر.</td></tr>`;
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

// Open Modal for Adding New Project
function openAddProjectModal() {
  document.getElementById('project-id').value = '';
  document.getElementById('modal-title').innerHTML = `<i class="ri-folder-add-line"></i> إضافة مشروع جديد`;
  document.getElementById('project-form').reset();
  document.getElementById('image-preview').src = 'assets/img/backend_api.jpg';
  document.getElementById('youtube-preview-container').style.display = 'none';
  document.getElementById('project-modal').style.display = 'flex';
}

// Open Modal for Editing Project
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

  // Set image preview
  document.getElementById('image-preview').src = project.image || 'assets/img/backend_api.jpg';

  // Set YouTube preview if exists
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

// YouTube URL Previewer Function
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
    // Privacy-Enhanced YouTube Embed URL with no cookie & minimal controls
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
}

// Handle Image Upload via File Input
async function handleImageUpload(input) {
  if (!input.files || !input.files[0]) return;

  const file = input.files[0];
  const formData = new FormData();
  formData.append('image', file);

  const token = localStorage.getItem('admin_token');
  const statusText = document.getElementById('upload-status-text');
  statusText.textContent = 'جاري رفع الصورة...';

  try {
    const res = await fetch(`${API_BASE}/admin/upload`, {
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

// Save Project (Submit Form)
document.getElementById('project-form').addEventListener('submit', async (e) => {
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
    const url = id ? `${API_BASE}/admin/projects/${id}` : `${API_BASE}/admin/projects`;

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

// Delete Project
async function deleteProject(id) {
  if (!confirm('هل أنت تأكد من رغبتك في حذف هذا المشروع نهائياً؟')) return;

  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();

    if (data.success) {
      showToast('تم حذف المشروع بنجاح', 'success');
      loadProjects();
      loadAnalytics();
    } else {
      showToast(data.message || 'فشل حذف المشروع', 'error');
    }
  } catch (err) {
    console.error('Delete error:', err);
    showToast('تعذر الاتصال بالسيرفر للحذف', 'error');
  }
}

/* ==================== TAB 3: INQUIRIES & MESSAGES ==================== */

async function loadInquiries() {
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch(`${API_BASE}/admin/inquiries`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.success && data.data) {
      inquiriesCache = data.data;
      renderInquiriesTable(inquiriesCache);
    }
  } catch (err) {
    console.error('Error loading inquiries:', err);
    document.getElementById('inquiries-table-body').innerHTML = `<tr><td colspan="6" class="text-center text-danger">فشل تحميل الرسائل.</td></tr>`;
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

  // Mark as read automatically
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
    await fetch(`${API_BASE}/admin/inquiries/${id}/status`, {
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
    const res = await fetch(`${API_BASE}/admin/inquiries/${id}`, {
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

/* ==================== UTILS: TOAST NOTIFICATIONS ==================== */

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
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
