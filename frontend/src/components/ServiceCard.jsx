import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wrench } from 'lucide-react';

export default function ServiceCard({ service }) {
  return (
    <div className="group glass-card rounded-2xl overflow-hidden hover:border-sky-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/10 flex flex-col h-full">
      <div className="relative h-44 overflow-hidden">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-sky-400 text-xs font-semibold px-3 py-1 rounded-full border border-sky-500/30">
          {service.count ? `${service.count}+ Pros` : 'Available'}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-100 group-hover:text-sky-400 transition-colors mb-2">
            {service.name}
          </h3>
          <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
            {service.description}
          </p>
        </div>

        <Link
          to={`/providers?service=${encodeURIComponent(service.name)}`}
          className="inline-flex items-center justify-between text-sm font-semibold text-sky-400 hover:text-sky-300 pt-3 border-t border-slate-800/80 group/link"
        >
          <span>Find {service.name} Pros</span>
          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
