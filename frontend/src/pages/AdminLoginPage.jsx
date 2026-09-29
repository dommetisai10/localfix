import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Wrench, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email: email.trim(), password: password.trim() });
      if (res.data.user?.role !== 'ADMIN') {
        addNotification("Access Denied", "This portal is restricted to Administrators only.", "error");
        return;
      }
      login(res.data.user, res.data.access_token);
      addNotification("Admin Access Granted", "Welcome to Admin Management Portal", "success");
      navigate('/admin/dashboard');
    } catch (err) {
      if (!err.response) {
        addNotification(
          "Server Unreachable",
          "Cannot reach server. It may be waking up (Render free tier can take 30-60s). Please retry.",
          "error"
        );
      } else if (err.response.status === 401) {
        addNotification("Login Failed", "Invalid email or password", "error");
      } else {
        addNotification("Login Failed", err.response?.data?.detail || "An unexpected error occurred", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation */}
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-sky-400 transition-colors bg-slate-900/60 border border-slate-800 px-3.5 py-2 rounded-xl backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to LocalFix</span>
        </Link>
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10 my-auto">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-sky-500/20 border border-sky-400/30">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-white via-slate-100 to-sky-400 bg-clip-text text-transparent">
              Admin Control Portal
            </h1>
            <p className="text-xs text-sky-400 font-semibold tracking-wide uppercase mt-1">
              LocalFix Management Console
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-sky-500/30 shadow-2xl space-y-6">
          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Admin Email</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 focus-within:border-sky-500/60 transition-colors">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@localfix.com"
                  className="bg-transparent text-slate-100 placeholder-slate-500 outline-none w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Admin Password</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 focus-within:border-sky-500/60 transition-colors">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent text-slate-100 placeholder-slate-500 outline-none w-full"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all active:scale-[0.99]"
            >
              {loading ? 'Verifying Admin Privileges...' : 'Authenticate Admin Session'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
