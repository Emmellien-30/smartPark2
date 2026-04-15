import api from './axios';
export const reportsAPI = {
  daily:   (date) => api.get(`/reports/daily?date=${date}`),
  dates:   ()     => api.get('/reports/dates'),
  summary: ()     => api.get('/reports/summary'),
};
