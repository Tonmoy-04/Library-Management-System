import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const readerAuthAPI = {
  register: (payload) => api.post('/reader/register', payload),
  login: (payload) => api.post('/reader/login', payload),
  logout: () => api.post('/reader/logout'),
  me: () => api.get('/reader/me'),
};

export const publisherAuthAPI = {
  register: (payload) => api.post('/publisher/register', payload),
  login: (payload) => api.post('/publisher/login', payload),
  logout: () => api.post('/publisher/logout'),
  me: () => api.get('/publisher/me'),
};

export const bookAPI = {
  getAll: () => api.get('/books'),
  getByPublisher: (publisherId) => api.get(`/publishers/${publisherId}/books`),
  create: (payload) => api.post('/books', payload),
  update: (id, payload) => api.put(`/books/${id}`, payload),
  remove: (id) => api.delete(`/books/${id}`),
  issueBook: (payload) => api.post('/transactions/issue', payload),
};

export const transactionAPI = {
  getAll: () => api.get('/transactions'),
};

export const readerAPI = {
  getAll: () => api.get('/readers'),
  create: (payload) => api.post('/readers', payload),
  update: (id, payload) => api.put(`/readers/${id}`, payload),
  remove: (id) => api.delete(`/readers/${id}`),
};

export const publisherAPI = {
  getAll: () => api.get('/publishers'),
  create: (payload) => api.post('/publishers', payload),
  update: (id, payload) => api.put(`/publishers/${id}`, payload),
  remove: (id) => api.delete(`/publishers/${id}`),
  // Publisher Portal APIs
  getBooks: (publisherId) => api.get(`/publisher-portal/${publisherId}/books`),
  getDashboard: (publisherId) => api.get(`/publisher-portal/${publisherId}/dashboard`),
  getReports: (publisherId, params) => api.get(`/publisher-portal/${publisherId}/reports`, { params }),
  getFeedback: (publisherId, params) => api.get(`/publisher-portal/${publisherId}/feedback`, { params }),
  replyToFeedback: (feedbackId, payload) => api.post(`/publisher-portal/feedback/${feedbackId}/reply`, payload),
  updateFeedbackStatus: (feedbackId, payload) => api.put(`/publisher-portal/feedback/${feedbackId}/status`, payload),
};

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
};

export default api;
