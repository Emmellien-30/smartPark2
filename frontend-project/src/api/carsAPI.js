import api from './axios';
export const carsAPI = {
  getAll: ()            => api.get('/cars'),
  getOne: (plate)       => api.get(`/cars/${plate}`),
  create: (data)        => api.post('/cars', data),
};
