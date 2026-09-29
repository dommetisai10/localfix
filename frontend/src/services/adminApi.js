import api from './api';

export const getAdminDashboardStats = async () => {
  const res = await api.get('/admin/dashboard');
  return res.data;
};

export const getAdminUsers = async () => {
  const res = await api.get('/admin/users');
  return res.data;
};

export const getAdminProviders = async () => {
  const res = await api.get('/admin/providers');
  return res.data;
};

export const updateProviderStatus = async (id, action) => {
  // action: 'approve', 'reject', or 'suspend'
  const res = await api.put(`/admin/providers/${id}/${action}`);
  return res.data;
};

export const getAdminBookings = async () => {
  const res = await api.get('/admin/bookings');
  return res.data;
};

export const getAdminAnalytics = async () => {
  const res = await api.get('/admin/analytics');
  return res.data;
};
