// src/api/authAPI.js
import api from './axios';
export const authAPI = {
  login:  (data) => api.post('/auth/login', data),
  logout: ()     => api.post('/auth/logout'),
  me:     ()     => api.get('/auth/me'),
};

// src/api/carsAPI.js — separate export below
