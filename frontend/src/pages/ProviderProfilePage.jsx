import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Clock, Calendar, Star, CheckCircle2, AlertCircle, Phone, Mail, Award, X, ArrowLeft } from 'lucide-react';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

export default function ProviderProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotification();

  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingAddress, setBookingAddress] = useState(user?.location || '');
  const [bookingNotes, setBookingNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const timeSlots = [
    '08:00 AM', '09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM', '06:00 PM'
  ];

  useEffect(() => {
    let isMounted = true;
    const loadProviderData = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const [provRes, revRes] = await Promise.all([
          api.get(`/providers/${id}`),
          api.get(`/providers/${id}/reviews`).catch(() => ({ data: [] }))
        ]);
        if (isMounted) {
          setProvider(provRes.data);
          setReviews(revRes.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setNotFound(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadProviderData();
    }
    return () => { isMounted = false; };
  }, [id]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!bookingDate || !bookingAddress) {
      addNotification("Missing Fields", "Please select a booking date and service address.", "error");
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/bookings', {
        provider_id: provider.id,
        service_id: provider.service_category_id || provider.serviceCategoryId || null,
        booking_date: bookingDate,
        booking_time: bookingTime,
        address: bookingAddress,
        description: bookingNotes
      });

      setSubmitting(false);
      setBookingModalOpen(false);
      addNotification(
        "Booking Submitted Successfully!",
        `Your booking with ${provider.name} for ${bookingDate} at ${bookingTime} is pending confirmation.`,
        "success"
      );
      navigate('/customer/bookings');
    } catch (err) {
      setSubmitting(false);
      const msg = err.response?.data?.detail || "Failed to submit booking. Please try again.";
      addNotification("Booking Failed", msg, "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (notFound || !provider) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Service Provider Not Found</h2>
        <p className="text-slate-400 text-sm">
          The service provider profile you are looking for does not exist or is currently inactive.
        </p>
        <Link
          to="/providers"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Browse All Providers
        </Link>
      </div>
    );
  }

  const defaultAvatar = `https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80`;
  const availableDaysList = provider.availableDays || provider.available_days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Top Banner & Header Card */}
      <div className="glass-panel p-8 rounded-3xl border border-sky-500/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <img
                src={provider.avatar || defaultAvatar}
                alt={provider.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-sky-500/30"
              />
              <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-full shadow-lg">
                <ShieldCheck className="w-5 h-5" />
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">{provider.name}</h1>
                <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold">
                  {provider.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  Verified Provider
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <StarRating rating={provider.rating || 5.0} size="sm" />
                <span className="font-bold text-slate-100">{provider.rating || 5.0}</span>
                <span className="text-slate-400">({reviews.length || provider.reviewCount || 0} verified reviews)</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-400" /> {provider.location || provider.city || 'Local Service Area'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" /> {provider.experienceYears || provider.experience_years || 1} Years Experience
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" /> {provider.completedBookings || provider.completed_bookings || 0} Jobs Completed
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Booking Trigger */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 text-center space-y-3 w-full md:w-64 shrink-0">
            <div className="text-xs text-slate-400">Standard Hourly Rate</div>
            <div className="text-3xl font-extrabold text-slate-100">
              ₹{provider.hourlyRate || provider.hourly_rate || 50} <span className="text-xs text-slate-400 font-normal">/ hour</span>
            </div>
            <button
              onClick={() => setBookingModalOpen(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-sky-500/25 transition-all hover:scale-[1.02]"
            >
              Book Service Now
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Bio, Availability, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About & Bio */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-100">About {provider.name}</h3>
            {provider.description && (
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {provider.description}
              </p>
            )}
            <p className="text-slate-400 text-xs leading-relaxed">
              {provider.bio || "Professional local service provider committed to high quality work and customer satisfaction."}
            </p>
          </div>

          {/* Working Hours & Availability */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" /> Working Schedule & Hours
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Available Days</span>
                <div className="flex flex-wrap gap-1.5">
                  {availableDaysList.map((day) => (
                    <span key={day} className="px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Operating Hours</span>
                <span className="text-slate-200 font-bold text-sm">{provider.workingHours || provider.working_hours || "08:00 AM - 06:00 PM"}</span>
              </div>
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">Customer Reviews ({reviews.length})</h3>
              <div className="flex items-center gap-2 text-xs">
                <StarRating rating={provider.rating || 5.0} size="xs" />
                <span className="font-bold text-slate-100">{provider.rating || 5.0} / 5.0</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
                No customer reviews submitted yet for this provider.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs border border-sky-500/30">
                          {rev.customer_name ? rev.customer_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <span className="text-xs font-bold text-slate-200">{rev.customer_name || rev.customerName || "Customer"}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <StarRating rating={rev.rating} size="xs" />
                    <p className="text-xs text-slate-300 italic">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Service Guarantees & Booking Quick Card */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Service Guarantee</h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Clean & professional service execution</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>30-day warranty on repair labor</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>No upfront payment required until completed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* BOOKING MODAL */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-sky-500/30 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-100 text-lg">Book Service</h3>
                <p className="text-xs text-sky-400">With {provider.name} ({provider.category})</p>
              </div>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
              
              {/* Preferred Date */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Select Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-sky-500/50"
                />
              </div>

              {/* Time Slot */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Select Time Slot</label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-sky-500/50"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              {/* Service Address */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Service Address</label>
                <textarea
                  required
                  rows="2"
                  value={bookingAddress}
                  onChange={(e) => setBookingAddress(e.target.value)}
                  placeholder="Enter your full home or office address..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-sky-500/50 resize-none"
                />
              </div>

              {/* Job Description / Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Issue Description (Optional)</label>
                <textarea
                  rows="2"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Describe your issue or specific instructions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-sky-500/50 resize-none"
                />
              </div>

              {/* Estimate Summary */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Estimated Rate:</span>
                <span className="font-extrabold text-sky-400">₹{provider.hourlyRate || provider.hourly_rate || 50} / hour</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all"
              >
                {submitting ? 'Confirming Booking...' : 'Confirm & Request Booking'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
