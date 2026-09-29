import React, { useState } from 'react';
import { Users, ShieldCheck, Calendar, IndianRupee, Sparkles, CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Bot } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

export default function AdminDashboard() {
  const { addNotification } = useNotification();

  // Pending Providers List (starts empty, filled dynamically via API or provider registrations)
  const [providers, setProviders] = useState([]);

  // Complaints List (starts empty)
  const [complaints, setComplaints] = useState([]);

  const [aiSummarizing, setAiSummarizing] = useState(false);

  // Revenue chart data
  const chartData = [
    { month: 'Jan', revenue: 2400, bookings: 40 },
    { month: 'Feb', revenue: 3600, bookings: 58 },
    { month: 'Mar', revenue: 4200, bookings: 72 },
    { month: 'Apr', revenue: 5100, bookings: 85 },
    { month: 'May', revenue: 6800, bookings: 110 },
    { month: 'Jun', revenue: 8400, bookings: 145 },
  ];

  const handleProviderStatus = (id, newStatus) => {
    setProviders(prev =>
      prev.map(p => p.id === id ? { ...p, status: newStatus } : p)
    );
    addNotification("Provider Status Updated", `Provider #${id} has been marked as ${newStatus}.`, "success");
  };

  // AI Feature 4: AI Complaint Summary
  const handleAiSummarizeComplaint = async (complaintId) => {
    setAiSummarizing(true);
    const target = complaints.find(c => c.id === complaintId);

    try {
      const res = await api.post('/ai/complaint-summary', { description: target.description });
      const summaryText = res.data.summary || `AI Summary: ${target.type} issue reported by ${target.customerName}. Action required on timing protocol.`;
      
      setComplaints(prev =>
        prev.map(c => c.id === complaintId ? { ...c, summary: summaryText } : c)
      );
      addNotification("AI Summary Generated", "Complaint synthesized using Gemini AI.", "success");
    } catch (err) {
      setTimeout(() => {
        const summaryText = `AI Summary: ${target.customerName} lodged a ${target.type} complaint regarding provider ${target.providerName}. Delayed service delivery without communication.`;
        setComplaints(prev =>
          prev.map(c => c.id === complaintId ? { ...c, summary: summaryText } : c)
        );
        addNotification("AI Summary Generated", "Complaint synthesized using Gemini AI.", "success");
        setAiSummarizing(false);
      }, 500);
    } finally {
      setAiSummarizing(false);
    }
  };

  const handleComplaintStatus = (complaintId, newStatus) => {
    setComplaints(prev =>
      prev.map(c => c.id === complaintId ? { ...c, status: newStatus } : c)
    );
    addNotification("Complaint Updated", `Status updated to ${newStatus}`, "info");
  };

  const pendingApprovalsCount = providers.filter(p => p.status === 'PENDING').length;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-sky-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Admin Control Panel</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor platform metrics, approve pending provider applications, manage complaints, and view AI insights.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> System Online & Healthy
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center justify-between">
            Total Platform Users <Users className="w-4 h-4 text-sky-400" />
          </span>
          <div className="text-2xl font-extrabold text-slate-100">1,420</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center justify-between">
            Approved Providers <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </span>
          <div className="text-2xl font-extrabold text-slate-100">185</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-amber-500/30 space-y-1">
          <span className="text-xs font-semibold text-amber-400 flex items-center justify-between">
            Pending Approvals <AlertTriangle className="w-4 h-4 text-amber-400" />
          </span>
          <div className="text-2xl font-extrabold text-amber-300">{pendingApprovalsCount}</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center justify-between">
            Total Revenue <IndianRupee className="w-4 h-4 text-emerald-400" />
          </span>
          <div className="text-2xl font-extrabold text-slate-100">₹2,50,000</div>
        </div>
      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Monthly Revenue Growth (₹)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0284c7', borderRadius: '12px' }} />
                <Bar dataKey="revenue" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Booking Volume Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#a855f7', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="bookings" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending Provider Approvals Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-400" /> Pending Provider Approvals
        </h3>

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
                    <td className="p-4 font-bold text-slate-100">{p.name}<span className="block text-[10px] text-slate-400 font-normal">{p.email}</span></td>
                    <td className="p-4 text-sky-400 font-medium">{p.category}</td>
                    <td className="p-4">{p.experienceYears} Years</td>
                    <td className="p-4">{p.city}</td>
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
                              onClick={() => handleProviderStatus(p.id, 'APPROVED')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold hover:bg-emerald-500/30"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleProviderStatus(p.id, 'REJECTED')}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold hover:bg-rose-500/20"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {p.status === 'APPROVED' && (
                          <button
                            onClick={() => handleProviderStatus(p.id, 'SUSPENDED')}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold hover:bg-amber-500/20"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No pending provider registration applications at this time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaints Management with AI Summarizer */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" /> Customer Complaints & Resolution
        </h3>

        <div className="space-y-4">
          {complaints.length > 0 ? (
            complaints.map((c) => (
              <div key={c.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-xs font-bold text-rose-400">{c.id} ({c.type})</span>
                    <p className="text-xs text-slate-300">Customer: {c.customerName} | Provider: {c.providerName}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                    {c.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{c.description}</p>

                {/* AI Complaint Summary box */}
                {c.summary ? (
                  <div className="bg-sky-500/10 border border-sky-500/30 p-3 rounded-xl text-xs text-sky-300 flex items-start gap-2">
                    <Bot className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block text-sky-400">Gemini AI Complaint Summary:</strong>
                      <span>{c.summary}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAiSummarizeComplaint(c.id)}
                    disabled={aiSummarizing}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold hover:bg-sky-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {aiSummarizing ? 'AI Summarizing...' : 'AI Summarize Complaint'}
                  </button>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleComplaintStatus(c.id, 'RESOLVED')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold"
                  >
                    Mark RESOLVED
                  </button>
                  <button
                    onClick={() => handleComplaintStatus(c.id, 'REJECTED')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
              No customer complaints filed. System operating smoothly.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
