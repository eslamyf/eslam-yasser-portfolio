import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      try {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      } catch (e) {}
    }
    return Promise.reject(error);
  }
);

export default api;

export const projectApi = {
  getAll: () => api.get('/projects'),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`)
};

export const certificateApi = {
  getAll: () => api.get('/certificates'),
  create: (data) => api.post('/certificates', data),
  update: (id, data) => api.put(`/certificates/${id}`, data),
  delete: (id) => api.delete(`/certificates/${id}`)
};

export const skillApi = {
  getAll: () => api.get('/skills'),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`)
};

export const journeyApi = {
  getExperiences: () => api.get('/experiences'),
  createExperience: (data) => api.post('/experiences', data),
  deleteExperience: (id) => api.delete(`/experiences/${id}`),

  getEducation: () => api.get('/education'),
  createEducation: (data) => api.post('/education', data),
  deleteEducation: (id) => api.delete(`/education/${id}`),

  getVolunteering: () => api.get('/volunteering'),
  createVolunteering: (data) => api.post('/volunteering', data),
  deleteVolunteering: (id) => api.delete(`/volunteering/${id}`)
};

export const testimonialApi = {
  getAll: () => api.get('/testimonials'),
  create: (data) => api.post('/testimonials', data),
  delete: (id) => api.delete(`/testimonials/${id}`)
};

export const inquiryApi = {
  send: (data) => api.post('/inquiries', data),
  getAll: () => api.get('/inquiries'),
  delete: (id) => api.delete(`/inquiries/${id}`)
};

export const cvApi = {
  getInfo: () => api.get('/cv'),
  upload: (formData) => api.post('/cv/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const fileApi = {
  uploadImage: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const analyticsApi = {
  track: (eventData) => api.post('/analytics/track', eventData),
  getStats: () => api.get('/analytics/stats')
};
