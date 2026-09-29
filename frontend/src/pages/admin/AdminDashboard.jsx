import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, ShieldCheck, Calendar, IndianRupee, Sparkles, CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Bot, RefreshCw, Plus, Edit2, Check, X, Wrench } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { getServices, createCategory, updateCategory, deleteCategory } from '../../services/servicesApi';
import { getAdminUsers, getAdminProviders, updateProviderStatus, getAdminBookings, getAdminAnalytics, getAdminDashboardStats } from '../../services/adminApi';
import { updateComplaintSummary } from '../../services/complaintsApi';

export default function AdminDashboard() {
  const { addNotification } = useNotification();
  const location = useLocation();

  const [metrics, setMetrics] = useState({
    total_users: 0,
    total_providers: 0,
    pending_providers: 0,
    approved_providers: 0,
    total_bookings: 0,
    completed_bookings: 0,
    cancelled_bookings: 0,
    total_revenue: 0,
    active_services: 0
  });

  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [services, setServices] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSummarizing, setAiSummarizing] = useState(null);

  // Category Form Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [submittingCat, setSubmittingCat] = useState(false);

  // Determine active view based on route path
  const isUsersRoute = location.pathname.includes('/admin/users');
  const isProvidersRoute = location.pathname.includes('/admin/providers');
  const isServicesRoute = location.pathname.includes('/admin/services');
  const isBookingsRoute = location.pathname.includes('/admin/bookings');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, userRes, provRes, bookRes, compRes, servRes, analRes] = await Promise.all([
        getAdminDashboardStats().catch(() => null),
        getAdminUsers().catch(() => []),
        getAdminProviders().catch(() => []),
        getAdminBookings().catch(() => []),
        api.get('/admin/complaints').then(r => r.data).catch(() => []),
        getServices().catch(() => []),
        getAdminAnalytics().catch(() => [])
      ]);

      if (dashRes) setMetrics(dashRes);
      if (userRes) setUsers(userRes);
      if (provRes) setProviders(provRes);
      if (bookRes) setBookings(bookRes);
      if (compRes) setComplaints(compRes);
      if (servRes) setServices(servRes);
      if (analRes) setAnalytics(analRes);
    } catch (err) {
      console.error("Failed to fetch admin dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [location.pathname]);

  const handleProviderStatusAction = async (id, action) => {
    try {
      const res = await updateProviderStatus(id, action);
      const newStatus = res.status || (action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : 'SUSPENDED');
      
      setProviders(prev =>
        prev.map(p => p.id === id ? { ...p, status: newStatus } : p)
      );

      addNotification("Provider Status Updated", `Provider #${id} set to ${newStatus}.`, "success");
    } catch (err) {
      addNotification("Update Failed", err.response?.data?.detail || "Could not update provider status", "error");
    }
  };

  const handleAiSummarizeComplaint = async (complaintId) => {
    setAiSummarizing(complaintId);
    const target = complaints.find(c => c.id === complaintId);
    if (!target) {
      setAiSummarizing(null);
      return;
    }

    try {
      const res = await api.post('/ai/complaint-summary', { description: target.description });
      const summaryText = res.data.summary || `AI Summary: ${target.complaint_type || 'Service'} issue reported. Priority resolution recommended.`;

      await updateComplaintSummary(complaintId, summaryText);

      setComplaints(prev =>
        prev.map(c => c.id === complaintId ? { ...c, summary: summaryText, ai_summary: summaryText } : c)
      );
      addNotification("AI Summary Generated", "Complaint synthesized using Gemini AI.", "success");
    } catch (err) {
      const msg = err.response?.data?.detail || "AI summary generation failed.";
      addNotification("AI Error", msg, "error");
    } finally {
      setAiSummarizing(null);
    }
  };

  const handleComplaintStatus = async (complaintId, newStatus) => {
    try {
      await api.put(`/complaints/${complaintId}`, { status: newStatus });
      setComplaints(prev =>
        prev.map(c => c.id === complaintId ? { ...c, status: newStatus } : c)
      );
      addNotification("Complaint Updated", `Status updated to ${newStatus}`, "info");
    } catch (err) {
      addNotification("Error", err.response?.data?.detail || "Failed to update complaint status", "error");
    }
  };

  // Category Management Handlers
  const handleOpenCatModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCatName(category.name);
      setCatDescription(category.description || '');
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatDescription('');
    }
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setSubmittingCat(true);
    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, {
          name: catName.trim(),
          description: catDescription.trim()
        });
        setServices(prev => prev.map(s => s.id === editingCategory.id ? updated : s));
        addNotification("Category Updated", `Service category "${catName}" updated successfully.`, "success");
      } else {
        const created = await createCategory({
          name: catName.trim(),
          description: catDescription.trim()
        });
        setServices(prev => [...prev, created]);
        addNotification("Category Created", `Service category "${catName}" created successfully.`, "success");
      }
      setCatModalOpen(false);
    } catch (err) {
      addNotification("Category Error", err.response?.data?.detail || "Failed to save category.", "error");
    } finally {
      setSubmittingCat(false);
    }
  };

  const handleToggleCategoryActive = async (cat) => {
    try {
      const updated = await updateCategory(cat.id, { active: !cat.active });
      setServices(prev => prev.map(s => s.id === cat.id ? updated : s));
      addNotification("Category Status", `Category "${cat.name}" marked as ${updated.active ? 'Active' : 'Inactive'}.`, "info");
    } catch (err) {
      addNotification("Error", err.response?.data?.detail || "Failed to update category status", "error");
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat.id);
      setServices(prev => prev.filter(s => s.id !== cat.id));
      addNotification("Category Deleted", `Category "${cat.name}" deleted.`, "info");
    } catch (err) {
      addNotification("Delete Failed", err.response?.data?.detail || "Cannot delete category associated with providers.", "error");
    }
  };

  const pendingProvidersList = providers.filter(p => p.status === 'PENDING');

  return (
    <div className="space-y-8">

      {/* Top Header */}
      <div className="glass-panel p-6 rounded-3xl border border-sky-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            {isUsersRoute ? "Manage Platform Users" :
             isProvidersRoute ? "Pending Provider Approvals & Management" :
             isServicesRoute ? "Service Category Management" :
             isBookingsRoute ? "Bookings & Complaints Management" :
             "Admin Control Panel"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time management portal for LocalFix services, providers, users, and AI complaint diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* DISTINCT ROUTE 1: MANAGE USERS */}
      {isUsersRoute && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" /> Registered Users ({users.length})
          </h2>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">User ID</th>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-mono font-bold text-sky-400">#{u.id}</td>
                      <td className="p-4 font-bold text-slate-100">{u.name}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">{u.mobile || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' :
                          u.role === 'PROVIDER' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">{u.location || u.city || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      {loading ? 'Loading users...' : 'No users found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISTINCT ROUTE 2: PROVIDERS / PENDING APPROVALS */}
      {isProvidersRoute && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" /> All Service Providers ({providers.length})
            </h2>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              Pending Approvals: {pendingProvidersList.length}
            </span>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Provider Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Experience</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {providers.length > 0 ? (
                  providers.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-slate-100">
                        {p.name}
                        <span className="block text-[10px] text-slate-400 font-normal">{p.email || p.mobile}</span>
                      </td>
                      <td className="p-4 text-sky-400 font-medium">{p.category}</td>
                      <td className="p-4">{p.experienceYears} Years</td>
                      <td className="p-4">{p.city || p.location}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          p.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {p.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleProviderStatusAction(p.id, 'approve')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold hover:bg-emerald-500/30 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleProviderStatusAction(p.id, 'reject')}
                                className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold hover:bg-rose-500/20 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {p.status === 'APPROVED' && (
                            <button
                              onClick={() => handleProviderStatusAction(p.id, 'suspend')}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold hover:bg-amber-500/20 transition-colors"
                            >
                              Suspend
                            </button>
                          )}
                          {(p.status === 'REJECTED' || p.status === 'SUSPENDED') && (
                            <button
                              onClick={() => handleProviderStatusAction(p.id, 'approve')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold hover:bg-emerald-500/30 transition-colors"
                            >
                              Re-Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      {loading ? 'Loading providers...' : 'No registered provider applications at this time.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISTINCT ROUTE 3: SERVICE CATEGORIES MANAGEMENT */}
      {isServicesRoute && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-sky-400" /> Service Categories ({services.length})
            </h2>
            <button
              onClick={() => handleOpenCatModal(null)}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" /> Add New Category
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((cat) => (
              <div key={cat.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-100 text-base">{cat.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cat.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                      {cat.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{cat.description || 'No description provided.'}</p>
                  <div className="text-[11px] text-sky-400 font-semibold">
                    Approved Providers: {cat.count || 0}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenCatModal(cat)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleCategoryActive(cat)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${cat.active ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}
                  >
                    {cat.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISTINCT ROUTE 4: BOOKINGS & COMPLAINTS */}
      {isBookingsRoute && (
        <div className="space-y-8">
          {/* All Bookings Table */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" /> Platform Bookings ({bookings.length})
            </h2>

            <div className="glass-card rounded-2xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Ref Code</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Provider</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {bookings.length > 0 ? (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/40">
                        <td className="p-4 font-mono font-bold text-sky-400">{b.booking_reference || b.id}</td>
                        <td className="p-4">{b.category_name || 'General'}</td>
                        <td className="p-4 font-bold text-slate-200">{b.provider_name || 'Provider'}</td>
                        <td className="p-4">{b.date} at {b.time}</td>
                        <td className="p-4 font-bold text-emerald-400">₹{b.price}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            b.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                            b.status === 'ACCEPTED' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' :
                            b.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        {loading ? 'Loading bookings...' : 'No bookings created yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Complaints Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Customer Complaints ({complaints.length})
            </h2>

            <div className="space-y-4">
              {complaints.length > 0 ? (
                complaints.map((c) => {
                  const summaryText = c.ai_summary || c.summary;
                  const isAiWorking = aiSummarizing === c.id;

                  return (
                    <div key={c.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div>
                          <span className="text-xs font-bold text-rose-400">Ref: {c.complaint_reference || `#${c.id}`} ({c.complaint_type || 'General'})</span>
                          <p className="text-xs text-slate-300">Customer ID: #{c.customer_id} | Booking ID: #{c.booking_id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          c.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          c.status === 'REJECTED' ? 'bg-slate-800 text-slate-400' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400">{c.description}</p>

                      {summaryText ? (
                        <div className="bg-sky-500/10 border border-sky-500/30 p-3 rounded-xl text-xs text-sky-300 flex items-start gap-2">
                          <Bot className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold block text-sky-400">Gemini AI Complaint Summary:</strong>
                            <span>{summaryText}</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAiSummarizeComplaint(c.id)}
                          disabled={isAiWorking}
                          className="px-3.5 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold hover:bg-sky-500/20 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          {isAiWorking ? 'AI Summarizing...' : 'AI Summarize Complaint'}
                        </button>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        {c.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleComplaintStatus(c.id, 'RESOLVED')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30"
                          >
                            Mark RESOLVED
                          </button>
                        )}
                        {c.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleComplaintStatus(c.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold hover:bg-slate-700 hover:text-slate-200"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
                  No customer complaints filed.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OVERVIEW ROUTE (/admin/dashboard or /admin) */}
      {!isUsersRoute && !isProvidersRoute && !isServicesRoute && !isBookingsRoute && (
        <div className="space-y-8">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                Total Platform Users <Users className="w-4 h-4 text-sky-400" />
              </span>
              <div className="text-2xl font-extrabold text-slate-100">
                {loading ? '...' : metrics.total_users}
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                Approved Providers <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </span>
              <div className="text-2xl font-extrabold text-slate-100">
                {loading ? '...' : metrics.approved_providers}
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-amber-500/30 space-y-1">
              <span className="text-xs font-semibold text-amber-400 flex items-center justify-between">
                Pending Approvals <AlertTriangle className="w-4 h-4 text-amber-400" />
              </span>
              <div className="text-2xl font-extrabold text-amber-300">
                {loading ? '...' : metrics.pending_providers}
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                Total Revenue <IndianRupee className="w-4 h-4 text-emerald-400" />
              </span>
              <div className="text-2xl font-extrabold text-slate-100">
                {loading ? '...' : `₹${(metrics.total_revenue || 0).toLocaleString('en-IN')}`}
              </div>
            </div>
          </div>

          {/* Recharts Analytics Charts using REAL ANALYTICS DATA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-100">Monthly Revenue Growth (₹)</h3>
              {analytics.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0284c7', borderRadius: '12px' }} />
                      <Bar dataKey="revenue" fill="#0284c7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
                  No completed booking revenue data recorded yet.
                </div>
              )}
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-100">Booking Volume Trend</h3>
              {analytics.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#a855f7', borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="bookings" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
                  No completed booking volume data recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY FORM MODAL */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-sky-500/30 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">
                {editingCategory ? 'Edit Service Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setCatModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Appliance Repair, Tutor..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-sky-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Category Description</label>
                <textarea
                  rows="3"
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Describe the services included..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-sky-500/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingCat}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs shadow-lg"
              >
                {submittingCat ? 'Saving Category...' : editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
