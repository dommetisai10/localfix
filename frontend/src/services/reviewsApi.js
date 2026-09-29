import api from './api';

export const createReview = async (reviewData) => {
  const res = await api.post('/reviews', reviewData);
  return res.data;
};

export const getReviewsForProvider = async (providerId) => {
  const res = await api.get(`/providers/${providerId}/reviews`);
  return res.data;
};
