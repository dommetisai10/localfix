import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, LayoutDashboard, Calendar, Star, AlertTriangle, Users, Briefcase, Bell, LogOut, ChevronRight, Menu, X, Bot, Shield, IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import AiAssistantModal from '../components/AiAssistantModal';

export default function DashboardLayout() {
  const { user, isCustomer, isProvider, isAdmin, logout, loading } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotification();
  const [notifOpen, setNotifOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // Role guarding
  if (location.pathname.startsWith('/admin') && !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  if (location.pathname.startsWith('/provider') && !isProvider && !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  if (location.pathname.startsWith('/customer') && !user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Sidebar links based on Role
  let links = [];
  if (isCustomer) {
    links = [
      { label: 'Overview', path: '/customer/dashboard', icon: LayoutDashboard },
      { label: 'My Bookings', path: '/customer/bookings', icon: Calendar },
      { label: 'AI Service Assistant', path: '/customer/ai-assistant', icon: Bot },
    ];
  } else if (isProvider) {
    links = [
      { label: 'Dashboard', path: '/provider/dashboard', icon: LayoutDashboard },
      { label: 'Bookings', path: '/provider/bookings', icon: Calendar },
      { label: 'Earnings & Reviews', path: '/provider/earnings', icon: IndianRupee },
    ];
  } else if (isAdmin) {
    links = [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Manage Users', path: '/admin/users', icon: Users },
      { label: 'Pending Approvals', path: '/admin/providers', icon: Shield },
      { label: 'Service Categories', path: '/admin/services', icon: Wrench },
      { label: 'Bookings & Complaints', path: '/admin/bookings', icon: AlertTriangle },
    ];
  } else {
    links = [
      { label: 'Overview', path: '/customer/dashboard', icon: LayoutDashboard },
      { label: 'Bookings', path: '/customer/bookings', icon: Calendar }
    ];
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/90 border-r border-slate-800 p-5 justify-between shrink-0">
        <div className="space-y-8">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-white">Local<span className="text-sky-400">Fix</span></span>
              <span className="block text-[10px] text-sky-400 uppercase font-bold tracking-wider">{user?.role || 'Portal'}</span>
            </div>
          </Link>

          {/* User Badge */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-100 truncate">{user?.name || 'User'}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-md'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <button
            onClick={() => setAiOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 text-xs font-bold"
          >
            <Bot className="w-4 h-4 text-sky-400" />
            AI Assistant
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-slate-400 hidden sm:inline-block">
              Portal / <span className="text-slate-100">{user?.role} Dashboard</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAiOpen(true)}
              className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-sky-500 text-slate-950 text-[9px] font-extrabold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="text-xs font-bold text-slate-200">Dashboard Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[10px] text-sky-400 font-bold hover:underline">
                        Mark read
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="font-bold text-sky-400">{n.title}</div>
                        <div className="text-slate-300">{n.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              Main Site
            </Link>
          </div>
        </header>

        {/* Dashboard Content Outlet */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <AiAssistantModal isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
