import api from './axios';
export const serviceRecordsAPI = {
  getAll:   ()         => api.get('/servicerecords'),
  getOne:   (id)       => api.get(`/servicerecords/${id}`),
  create:   (data)     => api.post('/servicerecords', data),
  update:   (id, data) => api.put(`/servicerecords/${id}`, data),
  remove:   (id)       => api.delete(`/servicerecords/${id}`),
};
