import React from 'react';
import { ShieldCheck, Sparkles, Wrench, Users, Award, Heart, CheckCircle2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="space-y-16 pb-20 relative min-h-screen" id="about">
      {/* Full Page Ambient Background Texture */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed opacity-10 pointer-events-none"
        style={{ backgroundImage: `url('/hero-bg.png')` }}
      ></div>

      {/* Hero Banner Section for About */}
      <section className="relative w-full pt-12 sm:pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800/80 shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: `url('/hero-bg.png')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/85 to-slate-950"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Wrench className="w-3.5 h-3.5" /> About LocalFix Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-100">
            Transforming Local Services With <span className="text-sky-400">Trust & AI</span>
          </h1>
          <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
            LocalFix was engineered to eliminate friction, unverified service claims, and unfair pricing in home repair and local maintenance across Ravulapalem and beyond.
          </p>
        </div>
      </section>

      {/* Main Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-4 text-center hover:border-sky-500/40 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Strict Vetting Process</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Every electrician, plumber, AC technician, and cleaner undergoes thorough background checks and manual admin approval.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-4 text-center hover:border-amber-500/40 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Gemini AI Support</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Integrated artificial intelligence provides real-time service issue diagnostics, complaint summaries, and tailored suggestions.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-4 text-center hover:border-emerald-500/40 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Guaranteed Quality</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Upfront hourly rates in INR (₹), double-booking protection, transparent customer reviews, and complete resolution workflows.
            </p>
          </div>
        </div>

        {/* Mission Banner */}
        <div className="glass-panel p-10 rounded-3xl border border-sky-500/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <h3 className="text-2xl font-extrabold text-slate-100">Our Core Mission</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              To empower skilled local technicians with reliable income while offering homeowners peace of mind with 100% verified, prompt home maintenance services.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-sky-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Transparent</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verified Pros</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Fast Response</span>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/providers"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all"
            >
              Explore Local Professionals
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
