import React, { createContext, useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/notificationsApi';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const fetchRealNotifications = async () => {
    const token = localStorage.getItem('localfix_token');
    if (!token) return;
    try {
      const data = await getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch {
      // Ignore notification fetch errors if unauthenticated or offline
    }
  };

  useEffect(() => {
    fetchRealNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const showToast = (icon, title, text = '') => {
    Swal.fire({
      icon,
      title,
      text,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
      background: '#0f172a',
      color: '#f8fafc',
      customClass: {
        popup: 'border border-sky-500/30 rounded-xl shadow-2xl backdrop-blur-md'
      }
    });
  };

  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      created_at: new Date().toISOString(),
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
    showToast(type === 'error' ? 'error' : type === 'success' ? 'success' : 'info', title, message);
  };

  const markAsRead = async (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await markNotificationRead(id);
    } catch {
      // Ignored if local-only notification
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      // Ignored if local-only notifications
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        showToast,
        addNotification,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchRealNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
