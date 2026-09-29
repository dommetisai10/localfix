import React, { useState } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { Search, MapPin, Sparkles, ShieldCheck, Clock, Award, Star, ArrowRight, CheckCircle2, UserCheck, Wrench, ThumbsUp } from 'lucide-react';
import { DEFAULT_CATEGORIES, INITIAL_PROVIDERS, INITIAL_REVIEWS } from '../utils/mockData';
import ServiceCard from '../components/ServiceCard';
import ProviderCard from '../components/ProviderCard';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const navigate = useNavigate();
  const context = useOutletContext();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('service', searchQuery);
    if (locationQuery) params.append('location', locationQuery);
    navigate(`/providers?${params.toString()}`);
  };

  const featuredCategories = DEFAULT_CATEGORIES.slice(0, 8);
  const featuredProviders = INITIAL_PROVIDERS.slice(0, 3);

  return (
    <div className="relative min-h-screen pb-20">
      {/* Full Page Ambient Background Texture */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed opacity-10 pointer-events-none"
        style={{ backgroundImage: `url('/hero-bg.png')` }}
      ></div>
      
      {/* HERO SECTION - Starts immediately below navbar */}
      <section className="relative w-full pt-10 sm:pt-14 pb-20 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800/80 shadow-2xl">
        {/* Full-width Background Image with Soft Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url('/hero-bg.png')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/70 to-slate-950 backdrop-blur-[1px]"></div>

        {/* Glow background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-purple-500/20 border border-sky-500/40 text-sky-300 text-xs font-bold uppercase tracking-widest shadow-xl backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            AI-Powered Local Service Booking
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-100 tracking-tight leading-tight">
            Trusted Local Services, <br />
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
              Just a Click Away
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Find reliable professionals near you in Ravulapalem and book quality home services with upfront pricing and verified customer reviews.
          </p>

          {/* Search Bar Form */}
          <form
            onSubmit={handleSearch}
            className="glass-panel p-3.5 rounded-2xl border border-sky-500/30 shadow-2xl max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-3 mt-8 bg-slate-900/80 backdrop-blur-xl"
          >
            <div className="flex-1 flex items-center gap-3 bg-slate-950/90 px-4 py-3 rounded-xl border border-slate-800 w-full focus-within:border-sky-500/50 transition-colors">
              <Search className="w-5 h-5 text-sky-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What service do you need? (e.g. AC Repair, Electrician)"
                className="bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none w-full"
              />
            </div>

            <div className="flex-1 flex items-center gap-3 bg-slate-950/90 px-4 py-3 rounded-xl border border-slate-800 w-full focus-within:border-sky-500/50 transition-colors">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Enter your location / city..."
                className="bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none w-full"
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 transition-all hover:scale-105 shrink-0 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </form>

          {/* Quick AI Trigger Banner */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => context?.openAiAssistant && context.openAiAssistant()}
              className="inline-flex items-center gap-2 text-xs text-sky-300 hover:text-white font-semibold bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-sky-500/30 hover:border-sky-400 transition-all cursor-pointer shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Unsure what issue you have? Ask our AI Assistant for instant service recommendations →</span>
            </button>
          </div>
        </div>
      </section>

      {/* SUBSEQUENT SECTIONS WRAPPER */}
      <div className="space-y-24 mt-24">

        {/* POPULAR SERVICE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Popular Service Categories
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Explore top-rated local services verified for high quality standards
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300"
          >
            View All 15 Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCategories.map((category) => (
            <ServiceCard key={category.id} service={category} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-900/50 border-y border-slate-800/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              How LocalFix Works
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Book certified local service technicians in 3 simple transparent steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-3xl text-center space-y-4 border border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center text-2xl font-extrabold mx-auto">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-100">Search Service or Provider</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Filter by service category, location, pricing, and ratings or ask our AI chatbot to match your issue.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl text-center space-y-4 border border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-2xl font-extrabold mx-auto">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-100">Select Date & Time Slot</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Pick a convenient date and time window with instant provider confirmation. No hidden fees.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl text-center space-y-4 border border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-2xl font-extrabold mx-auto">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-100">Service & Satisfaction</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                The provider completes the job cleanly. Mark as completed and rate your overall experience!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROVIDERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Featured Top Professionals
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Top-rated local experts with verified backgrounds and proven customer satisfaction
            </p>
          </div>
          <Link
            to="/providers"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300"
          >
            Explore All Providers <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredProviders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-2xl text-center border border-slate-800 space-y-4 max-w-2xl mx-auto">
            <UserCheck className="w-12 h-12 text-sky-400 mx-auto opacity-70" />
            <h3 className="text-lg font-bold text-slate-200">No Service Providers Listed Yet</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Are you a skilled professional in Ravulapalem or nearby regions? Register your service business today and reach local customers!
            </p>
            <div className="pt-2">
              <Link
                to="/provider/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-400 transition shadow-lg shadow-sky-500/20"
              >
                Become a Provider <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-10 rounded-3xl border border-sky-500/20 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-slate-100">
                Why Thousands Choose <span className="text-sky-400">LocalFix</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                We bring transparency, safety, and modern artificial intelligence to home and local services. Every professional passes rigorous background checks and quality evaluations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Admin-Approved Pros</h4>
                    <p className="text-xs text-slate-400">Identity & experience verified.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-sky-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">On-Time Guarantee</h4>
                    <p className="text-xs text-slate-400">Punctual arrival and quick service.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">AI Diagnostic Assistant</h4>
                    <p className="text-xs text-slate-400">Instant problem analysis.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ThumbsUp className="w-5 h-5 text-sky-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Upfront Pricing</h4>
                    <p className="text-xs text-slate-400">No hidden fees or surprise costs.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800"
                alt="LocalFix Technician at work"
                className="rounded-2xl border border-slate-700/60 shadow-2xl object-cover h-80 w-full"
              />
              <div className="absolute -bottom-6 -left-6 glass-card p-4 rounded-2xl border border-sky-500/30 flex items-center gap-4 shadow-2xl">
                <div className="p-3 bg-sky-500/20 text-sky-400 rounded-xl">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-100">4.9 / 5.0 Rating</div>
                  <div className="text-xs text-slate-400">From over 12,000+ completed local bookings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            What Our Customers Say
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real feedback from satisfied homeowners and business owners
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_REVIEWS.map((rev) => (
            <div key={rev.id} className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800 mt-4">
                <img
                  src={rev.customerAvatar}
                  alt={rev.customerName}
                  className="w-10 h-10 rounded-full object-cover border border-sky-500/30"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{rev.customerName}</h4>
                  <span className="text-[10px] text-slate-500">{rev.createdAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 rounded-3xl p-10 sm:p-14 text-center text-white space-y-6 shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Are You a Skilled Service Professional?</h2>
          <p className="text-sky-100 text-sm sm:text-base max-w-2xl mx-auto">
            Join LocalFix today to connect with thousands of local customers looking for electricians, plumbers, AC technicians, tutors, cleaners, and more.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/provider-register"
              className="px-8 py-3.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-sm font-extrabold shadow-xl transition-all hover:scale-105"
            >
              Register as a Service Provider
            </Link>
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl bg-sky-950/60 hover:bg-sky-950/80 border border-white/20 text-white text-sm font-bold transition-all"
            >
              Create Customer Account
            </Link>
          </div>
        </div>
      </section>

      </div>
    </div>
  );
}
