import api from './api';

export const getServices = async () => {
  const res = await api.get('/services');
  return res.data;
};

export const getServiceCategory = async (id) => {
  const res = await api.get(`/services/${id}`);
  return res.data;
};

export const createCategory = async (categoryData) => {
  const res = await api.post('/services', categoryData);
  return res.data;
};

export const updateCategory = async (id, categoryData) => {
  const res = await api.put(`/services/${id}`, categoryData);
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await api.delete(`/services/${id}`);
  return res.data;
};
