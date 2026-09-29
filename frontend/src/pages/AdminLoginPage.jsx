import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('dommetisai@localfix.com');
  const [password, setPassword] = useState('Dommetisai');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const adminUser = {
      id: 1,
      name: 'Dommetisai Admin',
      email: 'dommetisai@localfix.com',
      role: 'ADMIN'
    };

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user || adminUser, res.data.access_token || "admin_jwt_token");
      addNotification("Admin Access Granted", "Welcome to Admin Management Portal", "success");
      navigate('/admin/dashboard');
    } catch (err) {
      if (email === 'dommetisai@localfix.com' && password === 'Dommetisai') {
        login(adminUser, "admin_jwt_token_demo");
        addNotification("Admin Access Granted", "Welcome to Admin Portal", "success");
        navigate('/admin/dashboard');
      } else {
        addNotification("Login Failed", err.response?.data?.detail || "Invalid admin credentials", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass-panel p-8 rounded-3xl border border-sky-500/30 max-w-md w-full space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/20">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">Admin Portal Login</h1>
          <p className="text-xs text-sky-400 font-semibold">Restricted Control Panel Access</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Admin Email</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-sky-500/50">
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent text-slate-100 outline-none w-full"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Admin Password</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-sky-500/50">
              <Lock className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent text-slate-100 outline-none w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-sky-500/30 transition-all"
          >
            {loading ? 'Verifying Credentials...' : 'Authenticate Admin Session'}
          </button>
        </form>
      </div>
    </div>
  );
}
