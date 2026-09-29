import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Col 1: About */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Wrench className="w-4.5 h-4.5" />
            </div>
            <span className="text-xl font-extrabold text-white">
              Local<span className="text-sky-400">Fix</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            Trusted Local Services, Just a Click Away. Connecting customers with verified local service professionals for fast, reliable, and transparent repairs & services.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
            <ShieldCheck className="w-4 h-4" /> 100% Verified Professionals
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 className="text-slate-100 font-bold text-sm mb-4 uppercase tracking-wider">Platform</h4>
          <ul className="space-y-2.5 text-xs font-medium">
            <li><Link to="/services" className="hover:text-sky-400 transition-colors">Browse Services</Link></li>
            <li><Link to="/providers" className="hover:text-sky-400 transition-colors">Find Professionals</Link></li>
            <li><Link to="/about" className="hover:text-sky-400 transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-sky-400 transition-colors">Contact Support</Link></li>
            <li><Link to="/provider-register" className="hover:text-sky-400 transition-colors">Become a Provider</Link></li>
          </ul>
        </div>

        {/* Col 3: Popular Categories */}
        <div>
          <h4 className="text-slate-100 font-bold text-sm mb-4 uppercase tracking-wider">Top Categories</h4>
          <ul className="space-y-2.5 text-xs font-medium">
            <li><Link to="/providers?service=Electrician" className="hover:text-sky-400 transition-colors">Electrician Services</Link></li>
            <li><Link to="/providers?service=Plumber" className="hover:text-sky-400 transition-colors">Plumbing & Leak Repairs</Link></li>
            <li><Link to="/providers?service=AC%20Repair" className="hover:text-sky-400 transition-colors">AC Servicing & Repair</Link></li>
            <li><Link to="/providers?service=Home%20Cleaning" className="hover:text-sky-400 transition-colors">Deep Home Cleaning</Link></li>
            <li><Link to="/providers?service=Laptop%20Repair" className="hover:text-sky-400 transition-colors">Computer & Laptop Repair</Link></li>
          </ul>
        </div>

        {/* Col 4: Contact Info */}
        <div className="space-y-3">
          <h4 className="text-slate-100 font-bold text-sm mb-4 uppercase tracking-wider">Contact & Support</h4>
          <div className="flex items-center gap-3 text-xs">
            <Phone className="w-4 h-4 text-sky-400 shrink-0" />
            <span>+91 9573842155</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Mail className="w-4 h-4 text-sky-400 shrink-0" />
            <span>dommetisai997@gmail.com</span>
          </div>
          <div className="flex items-start gap-3 text-xs">
            <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>Ravulapalem, Andhra Pradesh, India</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} LocalFix Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for local service excellence.
          </p>
        </div>
      </div>
    </footer>
  );
}
