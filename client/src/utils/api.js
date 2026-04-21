import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
};

export const internshipAPI = {
  getAll: () => api.get('/internships'),
  getById: (id) => api.get(`/internships/${id}`),
  create: (data) => api.post('/internships', data),
  getMyPostings: () => api.get('/internships/my/postings'),
  update: (id, data) => api.put(`/internships/${id}`, data),
  delete: (id) => api.delete(`/internships/${id}`),
  getAnalytics: () => api.get('/internships/analytics/deep'),
  getSimilar: (id) => api.get(`/internships/similar/${id}`),
};

export const applicationAPI = {
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/applications/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  predictMatch: (internshipId) => api.get(`/applications/predict-match/${internshipId}`),
  generateCoverLetter: (internshipId) => api.post(`/applications/generate-cover-letter/${internshipId}`),
  apply: (internshipId, data) => api.post(`/applications/apply/${internshipId}`, data),
  getMyApplications: () => api.get('/applications/my-applications'),
  getInternshipApplications: (internshipId) => api.get(`/applications/internship/${internshipId}`),
  updateStatus: (applicationId, status, feedback = '') => api.put(`/applications/${applicationId}/status`, { status, feedback }),
  livePreview: (data) => api.post('/applications/live-preview', data),
};

export const profileAPI = {
  update: (data) => api.put('/auth/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/auth/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteResume: () => api.delete('/auth/resume'),
  getMe: () => api.get('/auth/me'),
  analyseGithub: (githubUrl) => api.post('/auth/github-analyse', { githubUrl }),
};

export const featureAPI = {
  getInterviewPrep: (applicationId) => api.post(`/applications/interview-prep/${applicationId}`),
  resumeChat: (message, history) => api.post('/applications/resume-chat', { message, history }),
  getResponseRate: (internshipId) => api.get(`/applications/response-rate/${internshipId}`),
  improveDescription: (data) => api.post('/applications/improve-description', data),
};

export default api;