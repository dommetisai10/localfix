import api from '../services/api';

export const fetchCustomerBookings = async (userId) => {
  try {
    const res = await api.get('/bookings/my');
    if (res.data && Array.isArray(res.data)) {
      const formatted = res.data.map(b => ({
        id: b.booking_reference || `BK-${b.id}`,
        dbId: b.id,
        providerName: b.provider_name || 'Service Provider',
        category: b.category_name || 'General Service',
        date: b.date,
        time: b.time,
        price: b.price || 50,
        status: (b.status || 'PENDING').toUpperCase(),
        address: b.address || '',
        description: b.description || ''
      }));
      // Sync local storage cache
      if (userId) {
        localStorage.setItem(`localfix_bookings_${userId}`, JSON.stringify(formatted));
      }
      return formatted;
    }
  } catch (err) {
    console.log("Using cached/local bookings for user");
  }

  // LocalStorage fallback
  if (userId) {
    const cached = localStorage.getItem(`localfix_bookings_${userId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
  }
  return [];
};

export const saveCustomerBooking = async (userId, bookingData) => {
  let newBooking = {
    id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
    ...bookingData,
    status: 'PENDING'
  };

  try {
    const res = await api.post('/bookings', {
      provider_id: bookingData.providerId || 1,
      date: bookingData.date,
      time: bookingData.time,
      address: bookingData.address,
      description: bookingData.description || ''
    });
    if (res.data) {
      newBooking = {
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
    }
  } catch (err) {
    console.log("Saving booking locally");
  }

  if (userId) {
    const key = `localfix_bookings_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = [newBooking, ...existing];
    localStorage.setItem(key, JSON.stringify(updated));
  }

  return newBooking;
};
