import api from './api';

export const createComplaint = async (complaintData) => {
  const res = await api.post('/complaints', complaintData);
  return res.data;
};

export const getAdminComplaints = async () => {
  const res = await api.get('/admin/complaints');
  return res.data;
};

export const updateComplaintSummary = async (id, aiSummary) => {
  const res = await api.put(`/admin/complaints/${id}/summary`, { ai_summary: aiSummary });
  return res.data;
};
