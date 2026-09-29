import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, ShieldCheck, Briefcase } from 'lucide-react';
import StarRating from './StarRating';

export default function ProviderCard({ provider, onBookNow }) {
  return (
    <div className="glass-card rounded-2xl p-6 hover:border-sky-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/10 flex flex-col justify-between h-full">
      <div>
        {/* Top bar with avatar, name, and verification status */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <img
              src={provider.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
              alt={provider.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-sky-500/30"
            />
            {provider.status === 'APPROVED' && (
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full shadow-lg" title="Verified Provider">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100 truncate hover:text-sky-400 transition-colors">
                {provider.name}
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                ₹{provider.hourlyRate}/hr
              </span>
            </div>

            <p className="text-sky-400 text-xs font-medium mb-1 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {provider.category}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <StarRating rating={provider.rating} size="xs" />
              <span className="font-semibold text-slate-200">{provider.rating}</span>
              <span>({provider.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Location & Experience badges */}
        <div className="space-y-2 mb-4 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">{provider.location || provider.city}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{provider.experienceYears} Years Exp.</span>
            </span>
            <span className="text-slate-400 font-medium">
              {provider.completedBookings ? `${provider.completedBookings} Jobs` : 'New'}
            </span>
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-slate-400 text-xs line-clamp-2 mb-5 leading-relaxed">
          {provider.description || provider.bio}
        </p>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
        <Link
          to={`/providers/${provider.id}`}
          className="w-full py-2.5 px-3 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold text-center transition-colors hover:bg-slate-800/60"
        >
          View Profile
        </Link>
        <button
          onClick={() => onBookNow ? onBookNow(provider) : (window.location.href = `/providers/${provider.id}`)}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold text-center shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02]"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
