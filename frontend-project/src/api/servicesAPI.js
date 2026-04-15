import api from './axios';
export const servicesAPI = {
  getAll: ()     => api.get('/services'),
  getOne: (id)   => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
};
