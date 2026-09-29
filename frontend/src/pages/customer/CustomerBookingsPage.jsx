import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Star, AlertTriangle, XCircle, CheckCircle2, MessageSquare, X, ArrowRight } from 'lucide-react';
import StarRating from '../../components/StarRating';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getMyBookings, updateBookingStatus } from '../../services/bookingsApi';
import { createReview } from '../../services/reviewsApi';
import { createComplaint } from '../../services/complaintsApi';

export default function CustomerBookingsPage() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getMyBookings();
      setBookings(data || []);
    } catch (err) {
      console.error("Failed to load customer bookings", err);
      addNotification("Error", err.response?.data?.detail || "Could not load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Complaint Modal State
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [complaintType, setComplaintType] = useState('Service Quality');
  const [complaintText, setComplaintText] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  const handleCancelBooking = async (bookingId) => {
    try {
      await updateBookingStatus(bookingId, 'CANCELLED');
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b)
      );
      addNotification("Booking Cancelled", `Booking #${bookingId} status updated to CANCELLED.`, "info");
    } catch (err) {
      const msg = err.response?.data?.detail || "Could not cancel booking";
      addNotification("Cancellation Failed", msg, "error");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setSubmittingReview(true);
    try {
      await createReview({
        booking_id: selectedBooking.id,
        rating: Number(rating),
        comment: reviewText
      });
      setBookings(prev =>
        prev.map(b => b.id === selectedBooking.id ? { ...b, hasReviewed: true } : b)
      );
      setReviewModalOpen(false);
      setReviewText('');
      addNotification("Review Submitted!", "Thank you for rating your service provider.", "success");
    } catch (err) {
      const msg = err.response?.data?.detail || "Could not submit review";
      addNotification("Review Failed", msg, "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setSubmittingComplaint(true);
    try {
      const res = await createComplaint({
        booking_id: selectedBooking.id,
        complaint_type: complaintType,
        description: complaintText
      });
      setComplaintModalOpen(false);
      setComplaintText('');
      addNotification(
        "Complaint Submitted",
        `Complaint logged successfully. Reference Code: ${res.complaint_reference || res.id}`,
        "success"
      );
    } catch (err) {
      const msg = err.response?.data?.detail || "Could not submit complaint";
      addNotification("Complaint Failed", msg, "error");
    } finally {
      setSubmittingComplaint(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">My Service Bookings</h1>
        <p className="text-xs text-slate-400 mt-1">Track status, manage appointments, leave reviews, or submit complaints.</p>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
          <div key={booking.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">{booking.booking_reference || booking.id}</span>
                <h3 className="text-base font-bold text-slate-100">{booking.provider_name || booking.providerName}</h3>
                <p className="text-xs text-slate-400">{booking.category_name || booking.category}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  booking.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  booking.status === 'ACCEPTED' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                  booking.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                  'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {booking.status}
                </span>
                <span className="text-sm font-extrabold text-slate-200">₹{booking.price}/hr</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>Date: <strong>{booking.date}</strong> at <strong>{booking.time}</strong></span>
              </div>
              <div>Address: {booking.address}</div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {booking.status === 'COMPLETED' && !booking.hasReviewed && (
                <button
                  onClick={() => {
                    setSelectedBooking(booking);
                    setReviewModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> Leave Review
                </button>
              )}

              {(booking.status === 'PENDING' || booking.status === 'ACCEPTED') && (
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/20 flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancel Booking
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedBooking(booking);
                  setComplaintModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Report Issue / Complaint
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="glass-card p-8 rounded-2xl text-center border border-slate-800 space-y-4 max-w-md mx-auto">
          <Calendar className="w-12 h-12 text-sky-400 mx-auto opacity-70" />
          <h3 className="text-base font-bold text-slate-200">No Bookings Found</h3>
          <p className="text-xs text-slate-400">You haven't scheduled any home service appointments yet.</p>
          <div className="pt-2">
            <Link
              to="/providers"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-400 transition shadow-lg shadow-sky-500/20"
            >
              Book a Service Provider <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
      </div>

      {/* REVIEW MODAL */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">Rate Your Provider</h3>
              <button onClick={() => setReviewModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div className="text-center space-y-2 py-2">
                <span className="text-slate-300 font-semibold block">Select Rating (1 to 5 Stars)</span>
                <div className="flex justify-center">
                  <StarRating rating={rating} size="lg" interactive onChange={(r) => setRating(r)} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Write Your Review</label>
                <textarea
                  required
                  rows="3"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details of your experience..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs shadow-lg"
              >
                {submittingReview ? 'Submitting...' : 'Submit Rating & Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COMPLAINT MODAL */}
      {complaintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base">Submit Complaint</h3>
              <button onClick={() => setComplaintModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleComplaintSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Complaint Type</label>
                <select
                  value={complaintType}
                  onChange={(e) => setComplaintType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none"
                >
                  <option value="Service Quality">Service Quality Issue</option>
                  <option value="Late Arrival">Late Arrival / No Show</option>
                  <option value="Pricing Dispute">Overcharging / Pricing Dispute</option>
                  <option value="Unprofessional Behavior">Unprofessional Behavior</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Detailed Description</label>
                <textarea
                  required
                  rows="3"
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="Describe the complaint in detail..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-rose-500/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingComplaint}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg"
              >
                {submittingComplaint ? 'Submitting...' : 'Submit Official Complaint (OPEN)'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
