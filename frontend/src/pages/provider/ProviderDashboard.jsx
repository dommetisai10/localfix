import React, { useState } from 'react';
import { Calendar, IndianRupee, Star, CheckCircle2, Clock, XCircle, Play, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import StarRating from '../../components/StarRating';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const [providerBookings, setProviderBookings] = useState([
    {
      id: "BK-2001",
      customerName: "Sarah Jenkins",
      category: "Electrician",
      date: "2026-09-30",
      time: "10:00 AM",
      price: 450,
      status: "PENDING",
      address: "45 Park Avenue, Suite 12"
    },
    {
      id: "BK-2002",
      customerName: "Robert Miller",
      category: "Electrician",
      date: "2026-09-29",
      time: "02:00 PM",
      price: 450,
      status: "ACCEPTED",
      address: "88 Lakeview Drive"
    },
    {
      id: "BK-2003",
      customerName: "Alex Rivera",
      category: "Electrician",
      date: "2026-09-21",
      time: "11:00 AM",
      price: 900,
      status: "COMPLETED",
      address: "12 Innovation Way"
    }
  ]);

  const updateBookingStatus = (id, newStatus) => {
    setProviderBookings(prev =>
      prev.map(b => b.id === id ? { ...b, status: newStatus } : b)
    );
    addNotification("Status Updated", `Booking ${id} updated to ${newStatus}`, "success");
  };

  const totalEarnings = providerBookings
    .filter(b => b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.price, 0);

  const stats = [
    { label: "Total Bookings", value: providerBookings.length, icon: Calendar, color: "text-sky-400" },
    { label: "Pending Requests", value: providerBookings.filter(b => b.status === "PENDING").length, icon: Clock, color: "text-amber-400" },
    { label: "Accepted / Active", value: providerBookings.filter(b => b.status === "ACCEPTED" || b.status === "STARTED").length, icon: Play, color: "text-blue-400" },
    { label: "Completed Jobs", value: providerBookings.filter(b => b.status === "COMPLETED").length, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Total Earnings", value: `₹${totalEarnings}`, icon: IndianRupee, color: "text-emerald-400" },
    { label: "Average Rating", value: "4.9 ★", icon: Star, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-sky-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-100">{user?.name || 'Provider Dashboard'}</h1>
            {user?.status === 'PENDING' ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                PENDING APPROVAL
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> APPROVED PROVIDER
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Category: <strong className="text-sky-400">{user?.category || 'Electrician'}</strong> | Location: {user?.location || 'Downtown Metro'}
          </p>
        </div>
      </div>

      {user?.status === 'PENDING' && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <strong className="font-bold text-sm block">Account Pending Approval</strong>
            <span>Your application has been received. Our Admin team is currently verifying your details. You can explore your dashboard and manage availability in the meantime.</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{s.label}</span>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-2xl font-extrabold text-slate-100">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Incoming Bookings Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100">Incoming Customer Booking Requests</h3>
        
        <div className="space-y-4">
          {providerBookings.map((b) => (
            <div key={b.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">{b.id}</span>
                  <h4 className="text-base font-bold text-slate-100">{b.customerName}</h4>
                  <p className="text-xs text-slate-400">Address: {b.address}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    b.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    b.status === 'ACCEPTED' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                    b.status === 'STARTED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                    b.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {b.status}
                  </span>
                  <span className="text-sm font-extrabold text-slate-200">₹{b.price}</span>
                </div>
              </div>

              <div className="text-xs text-slate-300">
                Scheduled: <strong>{b.date}</strong> at <strong>{b.time}</strong>
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                {b.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => updateBookingStatus(b.id, 'ACCEPTED')}
                      className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30"
                    >
                      Accept Booking
                    </button>
                    <button
                      onClick={() => updateBookingStatus(b.id, 'REJECTED')}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/20"
                    >
                      Reject
                    </button>
                  </>
                )}

                {b.status === 'ACCEPTED' && (
                  <button
                    onClick={() => updateBookingStatus(b.id, 'STARTED')}
                    className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold hover:bg-blue-500/30"
                  >
                    Mark Service Started
                  </button>
                )}

                {b.status === 'STARTED' && (
                  <button
                    onClick={() => updateBookingStatus(b.id, 'COMPLETED')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg hover:bg-emerald-400"
                  >
                    Mark Service Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
