import React, { createContext, useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Welcome to LocalFix!",
      message: "Find top local service professionals near you or register as a provider.",
      timestamp: "Just now",
      read: false,
      type: "system"
    }
  ]);

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
      timestamp: 'Just now',
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
    showToast(type === 'error' ? 'error' : type === 'success' ? 'success' : 'info', title, message);
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        showToast,
        addNotification,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
