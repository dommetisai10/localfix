import React, { useState } from 'react';
import { Search, Filter, Wrench } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../utils/mockData';
import ServiceCard from '../components/ServiceCard';

export default function ServicesPage() {
  const [query, setQuery] = useState('');

  const filteredCategories = DEFAULT_CATEGORIES.filter((cat) =>
    cat.name.toLowerCase().includes(query.toLowerCase()) ||
    cat.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold uppercase tracking-wider">
          <Wrench className="w-3.5 h-3.5" /> All 15 Service Categories
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100">
          Find the Right <span className="text-sky-400">Service</span> for Your Home
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          From electrical repairs and plumbing to AC servicing, deep cleaning, tutoring, and computer fixes — we've got top local professionals ready to help.
        </p>

        {/* Search Bar */}
        <div className="pt-4 max-w-xl mx-auto">
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 focus-within:border-sky-500/50 px-4 py-3 rounded-2xl shadow-xl">
            <Search className="w-5 h-5 text-sky-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter service categories (e.g., Plumber, AC, Repair, Cleaning)..."
              className="bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Grid of Categories */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-16 text-slate-400 space-y-2">
          <p className="text-base font-semibold">No service category matching "{query}"</p>
          <p className="text-xs">Try searching for electrician, plumber, AC repair, cleaning, or tutor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <ServiceCard key={category.id} service={category} />
          ))}
        </div>
      )}
    </div>
  );
}
