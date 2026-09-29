import api from './api';

export const getProviders = async (params = {}) => {
  const res = await api.get('/providers', { params });
  return res.data;
};

export const getProvider = async (id) => {
  const res = await api.get(`/providers/${id}`);
  return res.data;
};

export const getProviderMe = async () => {
  const res = await api.get('/providers/me');
  return res.data;
};

export const getProviderReviews = async (id) => {
  const res = await api.get(`/providers/${id}/reviews`);
  return res.data;
};
