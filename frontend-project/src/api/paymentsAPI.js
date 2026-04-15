import api from './axios';
export const paymentsAPI = {
  getAll:  ()    => api.get('/payments'),
  getOne:  (id)  => api.get(`/payments/${id}`),
  create:  (data)=> api.post('/payments', data),
  getBill: (id)  => api.get(`/payments/bill/${id}`),
};
