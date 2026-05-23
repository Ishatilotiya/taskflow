import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  signup: (data) => API.post('/auth/signup', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/me', data),
};

// Workspaces
export const workspaceAPI = {
  getAll: () => API.get('/workspaces'),
  getOne: (id) => API.get(`/workspaces/${id}`),
  create: (data) => API.post('/workspaces', data),
  addMember: (id, data) => API.post(`/workspaces/${id}/members`, data),
  removeMember: (id, userId) => API.delete(`/workspaces/${id}/members/${userId}`),
  updateMemberRole: (id, userId, data) => API.put(`/workspaces/${id}/members/${userId}`, data),
};

// Projects
export const projectAPI = {
  create: (data) => API.post('/projects', data),
  getByWorkspace: (workspaceId) => API.get(`/projects/workspace/${workspaceId}`),
  getOne: (id) => API.get(`/projects/${id}`),
  update: (id, data) => API.put(`/projects/${id}`, data),
  delete: (id) => API.delete(`/projects/${id}`),
};

// Tasks
export const taskAPI = {
  create: (data) => API.post('/tasks', data),
  getByProject: (projectId) => API.get(`/tasks/project/${projectId}`),
  getOne: (id) => API.get(`/tasks/${id}`),
  update: (id, data) => API.put(`/tasks/${id}`, data),
  delete: (id) => API.delete(`/tasks/${id}`),
};

// Dashboard
export const dashboardAPI = {
  get: (workspaceId) => API.get(`/dashboard/${workspaceId}`),
};

// Activity
export const activityAPI = {
  get: (workspaceId) => API.get(`/activity/${workspaceId}`),
};