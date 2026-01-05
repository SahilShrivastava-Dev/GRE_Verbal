import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Word APIs
export const wordAPI = {
  getAll: () => api.get('/word/all'),
  search: (query) => api.get(`/word/search?query=${encodeURIComponent(query)}`),
  add: (word) => api.post('/word/add', { word }),
  update: (id, updates) => api.patch(`/word/${id}`, updates),
  delete: (id) => api.delete(`/word/${id}`),
  getStats: () => api.get('/word/stats'),
};

// Quiz APIs
export const quizAPI = {
  getDailyQuiz: (type = 'mixed') => api.get(`/quiz/daily?type=${type}`),
  submitQuiz: (data) => api.post('/quiz/submit', data),
  getHistory: (limit = 10) => api.get(`/quiz/history?limit=${limit}`),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;

