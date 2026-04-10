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
    // Don't set Content-Type for FormData - let browser set it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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

export const readerPortalAPI = {
  getDashboard: () => api.get('/reader/dashboard'),
  getBooks: (params) => api.get('/reader/books', { params }),
  getBookDetails: (bookId) => api.get(`/reader/books/${bookId}`),
  getLibrary: (params) => api.get('/reader/library', { params }),
  saveBook: (bookId) => api.post(`/reader/library/${bookId}/save`),
  removeLibraryStatus: (bookId, status) => api.delete(`/reader/library/${bookId}/status/${status}`),
  getMyLibrary: () => api.get('/reader/my-library'),
  getHistory: (params) => api.get('/reader/history', { params }),
  purchaseBook: (bookId) => api.post(`/reader/books/${bookId}/purchase`),
  downloadBook: (bookId) => api.post(`/reader/books/${bookId}/download`),
  saveProgress: (bookId, payload) => api.post(`/reader/books/${bookId}/progress`, payload),
  continueReading: (bookId) => api.post(`/reader/books/${bookId}/continue`),
  getBookmarks: () => api.get('/reader/bookmarks'),
  addBookmark: (payload) => api.post('/reader/bookmarks', payload),
  removeBookmark: (bookmarkId) => api.delete(`/reader/bookmarks/${bookmarkId}`),
  getActivity: () => api.get('/reader/activity'),
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
  createBook: (publisherId, payload) => api.post(`/publisher-portal/${publisherId}/books`, payload),
  updateBook: (publisherId, bookId, payload) => api.put(`/publisher-portal/${publisherId}/books/${bookId}`, payload),
  deleteBook: (publisherId, bookId) => api.delete(`/publisher-portal/${publisherId}/books/${bookId}`),
  getBookshelfSubmissions: (publisherId) => api.get(`/publisher-portal/${publisherId}/books`),
  submitBookToBookshelf: (publisherId, payload) => api.post(`/publisher-portal/${publisherId}/books`, payload),
  getDashboard: (publisherId) => api.get(`/publisher-portal/${publisherId}/dashboard`),
  getReports: (publisherId, params) => api.get(`/publisher-portal/${publisherId}/reports`, { params }),
  getFeedback: (publisherId, params) => api.get(`/publisher-portal/${publisherId}/feedback`, { params }),
  replyToFeedback: (feedbackId, payload) => api.post(`/publisher-portal/feedback/${feedbackId}/reply`, payload),
  updateFeedbackStatus: (feedbackId, payload) => api.put(`/publisher-portal/feedback/${feedbackId}/status`, payload),
  getPublisherReviewQueue: (status = 'pending') => api.get('/publisher-bookshelf', { params: { status } }),
  reviewBookSubmission: (bookId, action) => api.post(`/publisher-bookshelf/${bookId}/review`, { action }),
};

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
};

export default api;
