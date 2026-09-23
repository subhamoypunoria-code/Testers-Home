import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.startsWith('/auth/');
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const projectAPI = {
  getAll: () => api.get('/projects'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getStats: (id) => api.get(`/projects/${id}/stats`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
};

export const defectAPI = {
  getAll: (projectId, params) => api.get(`/projects/${projectId}/defects`, { params }),
  getOne: (projectId, id) => api.get(`/projects/${projectId}/defects/${id}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/defects`, data),
  update: (projectId, id, data) => api.put(`/projects/${projectId}/defects/${id}`, data),
  delete: (projectId, id) => api.delete(`/projects/${projectId}/defects/${id}`),
  addComment: (projectId, id, data) => api.post(`/projects/${projectId}/defects/${id}/comments`, data),
  logTime: (projectId, id, data) => api.post(`/projects/${projectId}/defects/${id}/time`, data),
  uploadAttachment: (projectId, id, formData) => api.post(`/projects/${projectId}/defects/${id}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getTrash: (projectId) => api.get(`/projects/${projectId}/defects/trash`),
  restore: (projectId, id) => api.put(`/projects/${projectId}/defects/${id}/restore`),
  permanentDelete: (projectId, id) => api.delete(`/projects/${projectId}/defects/${id}/permanent`),
  bulkPermanentDelete: (projectId, ids) => api.post(`/projects/${projectId}/defects/bulk-permanent-delete`, { ids }),
  bulkRestore: (projectId, ids) => api.post(`/projects/${projectId}/defects/bulk-restore`, { ids }),
  bulkUpdate: (projectId, data) => api.put(`/projects/${projectId}/defects/bulk`, data),
  bulkDelete: (projectId, ids) => api.post(`/projects/${projectId}/defects/bulk-delete`, { ids }),
  bulkUpload: (projectId, formData, onProgress) => api.post(
    `/projects/${projectId}/defects/bulk-upload`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }
  ),
};

export const testCaseAPI = {
  getAll: (projectId, params) => api.get(`/projects/${projectId}/testcases`, { params }),
  generate: (projectId, defectIds) => api.post(`/projects/${projectId}/testcases/generate`, { defectIds }),
  saveGenerated: (projectId, testCases) => api.post(`/projects/${projectId}/testcases/generate/save`, { testCases }),
  getOne: (projectId, id) => api.get(`/projects/${projectId}/testcases/${id}`),
  update: (projectId, id, data) => api.put(`/projects/${projectId}/testcases/${id}`, data),
  delete: (projectId, id) => api.delete(`/projects/${projectId}/testcases/${id}`),
};
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getProject: (projectId) => api.get(`/analytics/${projectId}`),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const userAPI = {
  search: (search) => api.get('/users', { params: { search } }),
  getOne: (id) => api.get(`/users/${id}`),
};

export default api;
