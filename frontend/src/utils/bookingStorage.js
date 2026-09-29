import api from '../services/api';

export const fetchCustomerBookings = async () => {
  try {
    const res = await api.get('/bookings/my');
    if (res.data && Array.isArray(res.data)) {
      return res.data.map(b => ({
        id: b.booking_reference || `BK-${b.id}`,
        dbId: b.id,
        providerName: b.provider_name || 'Service Provider',
        category: b.category_name || 'General Service',
        date: b.date,
        time: b.time,
        price: b.price || 50,
        status: (b.status || 'PENDING').toUpperCase(),
        address: b.address || '',
        description: b.description || '',
        created_at: b.created_at
      }));
    }
  } catch (err) {
    console.error("Failed to fetch bookings from server:", err);
  }
  return [];
};

export const saveCustomerBooking = async (userId, bookingData) => {
  // Direct API call. Throws error if API call fails (e.g. double booking or invalid request).
  const res = await api.post('/bookings', {
    provider_id: bookingData.providerId,
    service_id: bookingData.serviceId || null,
    date: bookingData.date,
    time: bookingData.time,
    address: bookingData.address,
    description: bookingData.description || ''
  });

  return {
    id: res.data.booking_reference || `BK-${res.data.id}`,
    dbId: res.data.id,
    providerName: res.data.provider_name || bookingData.providerName,
    category: res.data.category_name || bookingData.category,
    date: res.data.date,
    time: res.data.time,
    price: res.data.price || bookingData.price,
    status: (res.data.status || 'PENDING').toUpperCase(),
    address: res.data.address,
    description: res.data.description || ''
  };
};

