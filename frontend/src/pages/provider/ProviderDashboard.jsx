import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, IndianRupee, Star, CheckCircle2, Clock, XCircle, Play, AlertCircle, ShieldCheck, Truck, CheckSquare, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import StarRating from '../../components/StarRating';
import { getProviderMe, getProviderReviews } from '../../services/providersApi';
import { getMyBookings, updateBookingStatus } from '../../services/bookingsApi';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const location = useLocation();

  const [providerProfile, setProviderProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine active view based on path
  const isBookingsTab = location.pathname.includes('/provider/bookings');
  const isEarningsTab = location.pathname.includes('/provider/earnings');

  const loadProviderDashboard = async () => {
    setLoading(true);
    try {
      const [profData, bookData] = await Promise.all([
        getProviderMe().catch(() => null),
        getMyBookings().catch(() => [])
      ]);
      setProviderProfile(profData);
      setBookings(bookData || []);

      if (profData && profData.id) {
        const revData = await getProviderReviews(profData.id).catch(() => []);
        setReviews(revData || []);
      }
    } catch (err) {
      console.error("Failed to load provider dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviderDashboard();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus);
      setBookings(prev =>
        prev.map(b => b.id === id ? { ...b, status: newStatus } : b)
      );
      addNotification("Status Updated", `Booking status updated to ${newStatus}`, "success");
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to update status";
      addNotification("Update Failed", msg, "error");
    }
  };

  const completedBookings = bookings.filter(b => b.status === "COMPLETED");
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);

  const currentStatus = providerProfile?.status || user?.status || 'PENDING';
  const isApproved = currentStatus === 'APPROVED';

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: Calendar, color: "text-sky-400" },
    { label: "Pending Requests", value: bookings.filter(b => b.status === "PENDING").length, icon: Clock, color: "text-amber-400" },
    { label: "Active Jobs", value: bookings.filter(b => b.status === "ACCEPTED" || b.status === "ON_THE_WAY" || b.status === "STARTED").length, icon: Play, color: "text-blue-400" },
    { label: "Completed Jobs", value: completedBookings.length, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Total Earnings", value: `₹${totalEarnings}`, icon: IndianRupee, color: "text-emerald-400" },
    { label: "Rating & Reviews", value: `${providerProfile?.rating || 5.0} ★ (${reviews.length})`, icon: Star, color: "text-amber-400" },
  ];

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-sky-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-100">{providerProfile?.name || user?.name || 'Provider'}</h1>
            {isApproved ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> APPROVED PROVIDER
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase">
                {currentStatus}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Category: <strong className="text-sky-400">{providerProfile?.category || 'General Service'}</strong> | Location: {providerProfile?.location || providerProfile?.city || 'Local Zone'}
          </p>
        </div>
      </div>

      {/* Account Status Alert Banner */}
      {!isApproved && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <strong className="font-bold text-sm block">Account Status: {currentStatus}</strong>
            <span>
              {currentStatus === 'PENDING' && "Your application is under review by Admin. Booking accept actions are disabled until approval."}
              {currentStatus === 'REJECTED' && "Your application was rejected by Admin. Please contact support for assistance."}
              {currentStatus === 'SUSPENDED' && "Your provider account is currently suspended. Please contact Admin."}
            </span>
          </div>
        </div>
      )}

      {/* DISTINCT VIEWS FOR DIFFERENT PATHS */}

      {/* 1. EARNINGS & REVIEWS VIEW */}
      {isEarningsTab && (
        <div className="space-y-8">
          <h2 className="text-xl font-bold text-slate-100">Earnings & Customer Reviews</h2>

          {/* Earnings summary card */}
          <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Lifetime Earnings</span>
              <IndianRupee className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-4xl font-black text-emerald-400">₹{totalEarnings}</div>
            <p className="text-xs text-slate-400">Computed from {completedBookings.length} completed booking(s).</p>
          </div>

          {/* Reviews list */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-400" /> Customer Reviews ({reviews.length})
            </h3>
            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="glass-card p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{r.customer_name || r.customerName || "Customer"}</span>
                      <StarRating rating={r.rating} size="xs" />
                    </div>
                    <p className="text-slate-300 italic">{r.comment}</p>
                    <span className="text-[10px] text-slate-500 block">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-6 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
                No customer reviews received yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. BOOKINGS VIEW OR OVERVIEW VIEW */}
      {!isEarningsTab && (
        <>
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

          {/* Bookings Table/List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-100">
              {isBookingsTab ? "All Customer Bookings" : "Recent Booking Requests"}
            </h3>
            
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div key={b.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">{b.booking_reference || b.id}</span>
                        <h4 className="text-base font-bold text-slate-100">{b.category_name || b.category || "Service Request"}</h4>
                        <p className="text-xs text-slate-400">Address: {b.address}</p>
                        {b.description && <p className="text-xs text-slate-300 italic mt-1">"{b.description}"</p>}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          b.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          b.status === 'ACCEPTED' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                          b.status === 'ON_THE_WAY' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                          b.status === 'STARTED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                          b.status === 'REJECTED' || b.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
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
                            disabled={!isApproved}
                            onClick={() => handleStatusUpdate(b.id, 'ACCEPTED')}
                            className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Accept Booking
                          </button>
                          <button
                            disabled={!isApproved}
                            onClick={() => handleStatusUpdate(b.id, 'REJECTED')}
                            className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {b.status === 'ACCEPTED' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(b.id, 'ON_THE_WAY')}
                            className="px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold hover:bg-indigo-500/30 flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" /> On The Way
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(b.id, 'STARTED')}
                            className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold hover:bg-blue-500/30 flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5" /> Start Service
                          </button>
                        </>
                      )}

                      {b.status === 'ON_THE_WAY' && (
                        <button
                          onClick={() => handleStatusUpdate(b.id, 'STARTED')}
                          className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold hover:bg-blue-500/30 flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" /> Start Service
                        </button>
                      )}

                      {b.status === 'STARTED' && (
                        <button
                          onClick={() => handleStatusUpdate(b.id, 'COMPLETED')}
                          className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg hover:bg-emerald-400 flex items-center gap-1.5"
                        >
                          <CheckSquare className="w-3.5 h-3.5" /> Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 rounded-2xl text-center border border-slate-800 text-slate-400 text-xs">
                No customer bookings assigned yet.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
