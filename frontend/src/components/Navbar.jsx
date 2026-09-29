import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Bot, Bell, User, LogOut, Menu, X, Shield, LayoutDashboard, Calendar, Star, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function Navbar({ onOpenAiAssistant }) {
  const { user, isAuthenticated, isCustomer, isProvider, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Providers', path: '/providers' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isProvider) return '/provider/dashboard';
    return '/customer/dashboard';
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform duration-300">
            <Wrench className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-sky-400 bg-clip-text text-transparent">
              Local<span className="text-sky-400">Fix</span>
            </span>
            <span className="block text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
              Service Platform
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-950/40 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800/60">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions Header */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* AI Assistant Trigger Button */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-500/30 text-sky-400 hover:border-sky-400 hover:bg-sky-500/20 text-xs font-semibold shadow-md transition-all group"
          >
            <Bot className="w-4 h-4 text-sky-400 group-hover:animate-bounce" />
            <span>AI Assistant</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <h4 className="text-xs font-bold text-slate-200">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-semibold text-sky-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl text-xs border ${
                          n.read ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-800/80 border-sky-500/30 text-slate-200'
                        }`}
                      >
                        <div className="font-semibold text-sky-400 mb-0.5">{n.title}</div>
                        <div>{n.message}</div>
                        <span className="text-[10px] text-slate-500 mt-1 block">{n.timestamp}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Auth Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-sky-500/40 px-3 py-1.5 rounded-xl transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                  <span className="block text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <span className="block text-[10px] text-sky-400 font-medium">
                    {user?.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-400" />
                    Dashboard
                  </Link>

                  {isCustomer && (
                    <Link
                      to="/customer/bookings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-sky-400" />
                      My Bookings
                    </Link>
                  )}

                  {isProvider && (
                    <Link
                      to="/provider/bookings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-sky-400" />
                      Incoming Bookings
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors mt-1 border-t border-slate-800"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 transition-all hover:scale-105"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={onOpenAiAssistant}
            className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30"
          >
            <Bot className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-200 hover:text-sky-400"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center text-xs font-bold rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30"
                >
                  Dashboard ({user?.name})
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 text-center text-xs font-bold rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-xs font-bold rounded-xl bg-slate-800 text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-xs font-bold rounded-xl bg-sky-500 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
