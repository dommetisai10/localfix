import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

import Home from './pages/Home';
import ServicesPage from './pages/ServicesPage';
import ProvidersPage from './pages/ProvidersPage';
import ProviderProfilePage from './pages/ProviderProfilePage';
import LoginPage from './pages/LoginPage';
import CustomerRegisterPage from './pages/CustomerRegisterPage';
import ProviderRegisterPage from './pages/ProviderRegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBookingsPage from './pages/customer/CustomerBookingsPage';

import ProviderDashboard from './pages/provider/ProviderDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <ScrollToTop />
          <ErrorBoundary>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="services/:id" element={<ServicesPage />} />
                <Route path="providers" element={<ProvidersPage />} />
                <Route path="providers/:id" element={<ProviderProfilePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<CustomerRegisterPage />} />
                <Route path="provider-register" element={<ProviderRegisterPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
              </Route>

              {/* Admin Login Portal */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Customer Dashboard Routes */}
              <Route path="/customer" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/customer/dashboard" replace />} />
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route path="bookings" element={<CustomerBookingsPage />} />
                <Route path="ai-assistant" element={<CustomerDashboard />} />
              </Route>

              {/* Provider Dashboard Routes */}
              <Route path="/provider" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/provider/dashboard" replace />} />
                <Route path="dashboard" element={<ProviderDashboard />} />
                <Route path="bookings" element={<ProviderDashboard />} />
                <Route path="earnings" element={<ProviderDashboard />} />
              </Route>

              {/* Admin Dashboard Routes */}
              <Route path="/admin" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminDashboard />} />
                <Route path="providers" element={<AdminDashboard />} />
                <Route path="services" element={<AdminDashboard />} />
                <Route path="bookings" element={<AdminDashboard />} />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
