import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  getDailyQuiz: () => api.get('/quiz/daily'),
  submitQuiz: (questions, userAnswers) => api.post('/quiz/submit', { questions, userAnswers }),
  getHistory: (limit = 10) => api.get(`/quiz/history?limit=${limit}`),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;

