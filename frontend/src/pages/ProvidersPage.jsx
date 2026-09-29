import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Filter, Star, IndianRupee, Briefcase } from 'lucide-react';
import { INITIAL_PROVIDERS, DEFAULT_CATEGORIES } from '../utils/mockData';
import ProviderCard from '../components/ProviderCard';

export default function ProvidersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialCategory = searchParams.get('service') || '';
  const initialLocation = searchParams.get('location') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [locationQuery, setLocationQuery] = useState(initialLocation);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  useEffect(() => {
    if (searchParams.get('service')) {
      setSelectedCategory(searchParams.get('service'));
    }
  }, [searchParams]);

  const filteredProviders = INITIAL_PROVIDERS.filter((provider) => {
    const matchesCategory = selectedCategory
      ? provider.category.toLowerCase() === selectedCategory.toLowerCase()
      : true;
    const matchesLocation = locationQuery
      ? provider.location.toLowerCase().includes(locationQuery.toLowerCase()) ||
        provider.city.toLowerCase().includes(locationQuery.toLowerCase())
      : true;
    const matchesRating = provider.rating >= minRating;
    const matchesPrice = provider.hourlyRate <= maxPrice;

    return matchesCategory && matchesLocation && matchesRating && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100">
          Find Local <span className="text-sky-400">Service Professionals</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Browse top-rated background-checked providers in your area
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-sky-400" /> Service Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:border-sky-500/50 outline-none"
            >
              <option value="">All Categories</option>
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Location / City
            </label>
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="e.g. Metro, Downtown..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500/50 outline-none"
            />
          </div>

          {/* Rating Filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" /> Minimum Rating ({minRating}+)
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:border-sky-500/50 outline-none"
            >
              <option value={0}>Any Rating</option>
              <option value={4.0}>4.0 Stars & above</option>
              <option value={4.5}>4.5 Stars & above</option>
              <option value={4.8}>4.8 Stars & above</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" /> Max Rate
              </span>
              <span className="text-sky-400 font-bold">₹{maxPrice}/hr</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>

        {/* Reset button */}
        {(selectedCategory || locationQuery || minRating > 0 || maxPrice < 1000) && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setSelectedCategory('');
                setLocationQuery('');
                setMinRating(0);
                setMaxPrice(1000);
              }}
              className="text-xs font-semibold text-sky-400 hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Provider Results Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
          <span>Showing <strong className="text-slate-100">{filteredProviders.length}</strong> available professionals</span>
        </div>

        {filteredProviders.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4 max-w-2xl mx-auto px-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">No Service Providers Listed Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              No registered professionals match your filter right now. Skilled service technicians can register their profile to start accepting bookings!
            </p>
            <div className="pt-2">
              <Link
                to="/provider-register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
              >
                Register as a Provider
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
