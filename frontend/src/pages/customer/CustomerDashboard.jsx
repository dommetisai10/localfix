import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, XCircle, Sparkles, ArrowRight, ShieldCheck, CheckSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_CATEGORIES } from '../../utils/mockData';
import { fetchCustomerBookings } from '../../utils/bookingStorage';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadBookings = async () => {
      setLoading(true);
      const data = await fetchCustomerBookings(user?.id);
      if (isMounted) {
        setBookings(data);
        setLoading(false);
      }
    };
    loadBookings();
    return () => { isMounted = false; };
  }, [user?.id]);

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: Calendar, color: "text-sky-400", bg: "bg-sky-500/10" },
    { label: "Pending", value: bookings.filter(b => b.status === "PENDING").length, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Accepted", value: bookings.filter(b => b.status === "ACCEPTED").length, icon: CheckSquare, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Completed", value: bookings.filter(b => b.status === "COMPLETED").length, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Cancelled", value: bookings.filter(b => b.status === "CANCELLED").length, icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10" },
  ];

  const recommendedServices = DEFAULT_CATEGORIES.slice(2, 6);

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-sky-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Welcome back, <span className="text-sky-400">{user?.name || 'Customer'}</span>!
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your service appointments, track status, and view AI recommendations.
          </p>
        </div>
        <Link
          to="/services"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-sky-500/20 hover:scale-105 transition-all"
        >
          + Book New Service
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">{s.label}</span>
                <div className={`p-1.5 rounded-xl ${s.bg} ${s.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-100">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Booking Card or Empty State */}
      {bookings.length > 0 ? (
        <div className="glass-card p-6 rounded-2xl border border-sky-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" /> Upcoming Service Appointment
            </h3>
            <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold">
              {bookings[0].status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 block">Service Provider</span>
              <span className="font-bold text-slate-200">{bookings[0].providerName} ({bookings[0].category})</span>
            </div>
            <div>
              <span className="text-slate-500 block">Date & Time</span>
              <span className="font-bold text-slate-200">{bookings[0].date} at {bookings[0].time}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Service Address</span>
              <span className="font-bold text-slate-200 truncate block">{bookings[0].address}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-3">
          <Calendar className="w-10 h-10 text-sky-400 mx-auto opacity-70" />
          <h3 className="text-sm font-bold text-slate-200">No Service Appointments Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't placed any service bookings yet. Explore our verified local providers and book your first service!
          </p>
          <div className="pt-1">
            <Link
              to="/providers"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-400 transition shadow-lg shadow-sky-500/20"
            >
              Browse Service Providers <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* AI Feature 5: Recommended Services based on history */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-bold text-slate-100">AI Suggested Services For Your Home</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedServices.map((cat) => (
            <div key={cat.id} className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
              <img src={cat.image} alt={cat.name} className="w-full h-24 object-cover rounded-xl" />
              <h4 className="text-xs font-bold text-slate-200">{cat.name}</h4>
              <Link
                to={`/providers?service=${encodeURIComponent(cat.name)}`}
                className="text-[11px] font-bold text-sky-400 hover:underline inline-flex items-center gap-1"
              >
                Browse Pros <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
