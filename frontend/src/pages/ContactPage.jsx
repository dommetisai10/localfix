import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const { addNotification } = useNotification();

  const handleSubmit = (e) => {
    e.preventDefault();
    addNotification("Message Sent!", "Thank you for contacting LocalFix. Our support team will reply within 24 hours.", "success");
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-16 pb-20 relative min-h-screen" id="contact">
      {/* Full Page Ambient Background Texture */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed opacity-10 pointer-events-none"
        style={{ backgroundImage: `url('/hero-bg.png')` }}
      ></div>

      {/* Hero Header Section */}
      <section className="relative w-full pt-12 sm:pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800/80 shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: `url('/hero-bg.png')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/85 to-slate-950"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-100">
            Get in Touch With <span className="text-sky-400">LocalFix</span>
          </h1>
          <p className="text-slate-300 text-base max-w-xl mx-auto leading-relaxed">
            Have questions about booking a service or registering as a provider in Ravulapalem? We're here to help 24/7.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-start gap-4 hover:border-sky-500/40 transition-all">
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Customer Support Phone</h4>
                <p className="text-xs text-slate-300 mt-1 font-semibold">+91 9573842155</p>
                <span className="text-[10px] text-emerald-400 font-semibold">Available Mon-Sat, 8am-8pm</span>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-start gap-4 hover:border-sky-500/40 transition-all">
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Official Email</h4>
                <p className="text-xs text-slate-300 mt-1 font-semibold">dommetisai997@gmail.com</p>
                <span className="text-[10px] text-sky-400 font-semibold">Average response: 2 hours</span>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-start gap-4 hover:border-sky-500/40 transition-all">
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Headquarters / Location</h4>
                <p className="text-xs text-slate-300 mt-1 font-semibold">Ravulapalem, Andhra Pradesh, India</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-100 mb-6">Send Us a Direct Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-sky-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Your Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-sky-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Booking Inquiry / Account Assistance..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-sky-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Message</label>
                <textarea
                  required
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-sky-500/50 resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
