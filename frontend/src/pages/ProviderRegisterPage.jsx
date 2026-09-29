import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, Sparkles, ShieldCheck, Mail, Lock, User, Phone, MapPin, IndianRupee, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { getServices } from '../services/servicesApi';

export default function ProviderRegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('Electrician');
  const [categories, setCategories] = useState([]);
  const [experience, setExperience] = useState('5');
  const [price, setPrice] = useState('450');
  const [description, setDescription] = useState('');
  const [availability, setAvailability] = useState('Mon - Sat, 8:00 AM - 6:00 PM');
  
  const [generatingAi, setGeneratingAi] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchCat = async () => {
      try {
        const data = await getServices();
        if (isMounted && data && data.length > 0) {
          setCategories(data);
          setCategory(data[0].name);
        }
      } catch (err) {
        console.error("Failed to fetch service categories", err);
      }
    };
    fetchCat();
    return () => { isMounted = false; };
  }, []);

  // AI Feature 3: Generate Professional Description
  const handleGenerateAiDescription = async () => {
    if (!category) return;
    setGeneratingAi(true);

    try {
      const res = await api.post('/ai/provider-description', {
        name: fullName || 'Service Professional',
        category,
        experienceYears: experience,
        city: city || 'Local Area'
      });
      if (res.data.description) {
        setDescription(res.data.description);
        addNotification("AI Generated Description!", "Your professional bio has been crafted by Gemini AI.", "success");
      }
    } catch (err) {
      const generated = `Certified ${category} technician with over ${experience} years of dedicated field experience in ${city || 'the metropolitan area'}. Specialist in precision troubleshooting, modern installations, and emergency maintenance. Committed to 100% safety standards, clean work, and transparent pricing.`;
      setDescription(generated);
      addNotification("Description Generated (Offline Fallback)", "AI service is currently unavailable. A standard template has been generated for you.", "info");
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const providerUser = {
      id: Date.now(),
      name: fullName,
      email,
      mobile,
      role: 'PROVIDER',
      status: 'PENDING', // Requirement: status = PENDING until admin approves
      category,
      experienceYears: Number(experience),
      hourlyRate: Number(price),
      description,
      location: `${address}, ${city}`,
      city,
      workingHours: availability
    };

    try {
      const res = await api.post('/auth/register-provider', providerUser);
      login(res.data.user, res.data.access_token);
      addNotification(
        "Application Submitted!",
        "Your provider account is currently PENDING Admin approval. Once approved, you can accept customer bookings.",
        "info"
      );
      navigate('/provider/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed. Please try again.";
      addNotification("Registration Failed", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="glass-panel p-8 rounded-3xl border border-sky-500/20 max-w-2xl w-full space-y-6 shadow-2xl">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/30">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">Become a Service Provider</h1>
          <p className="text-xs text-slate-400">Join LocalFix to get verified and receive customer service bookings</p>
        </div>

        {/* Notice Badge */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl flex items-start gap-3 text-xs text-amber-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <strong className="font-bold block">Approval Process Notice</strong>
            <span>All provider accounts start with <strong>PENDING</strong> status. Our Admin team reviews credentials before enabling live customer bookings.</span>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          
          {/* Row 1: Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Full Name</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-sky-500/50">
                <User className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Marcus Vance"
                  className="bg-transparent text-slate-100 placeholder-slate-500 outline-none w-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Email Address</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-sky-500/50">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="marcus.pro@example.com"
                  className="bg-transparent text-slate-100 placeholder-slate-500 outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Mobile & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Mobile Phone</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-sky-500/50">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="bg-transparent text-slate-100 placeholder-slate-500 outline-none w-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Password</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-sky-500/50">
                <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent text-slate-100 placeholder-slate-500 outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Service Category, Experience, Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Primary Service</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-sky-500/50"
              >
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <option value="Electrician">Electrician</option>
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="50"
                required
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-sky-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Hourly Rate (₹)</label>
              <input
                type="number"
                min="50"
                max="5000"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-sky-500/50"
              />
            </div>
          </div>

          {/* Row 4: Address & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Full Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, Suite 4"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-sky-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">City / Operating Zone</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Downtown Metro"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-sky-500/50"
              />
            </div>
          </div>

          {/* AI Description Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-300">Professional Service Description</label>
              <button
                type="button"
                onClick={handleGenerateAiDescription}
                disabled={generatingAi}
                className="flex items-center gap-1.5 text-[11px] font-bold text-sky-400 hover:text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/30 transition-all hover:scale-105 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                {generatingAi ? 'AI Generating...' : 'Generate Professional Description'}
              </button>
            </div>
            <textarea
              required
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your expertise, certifications, and service tools (or click Generate above)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-sky-500/50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-sky-500/25 transition-all mt-4"
          >
            {loading ? 'Submitting Application...' : 'Submit Provider Application (Starts as PENDING)'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already registered?{' '}
          <Link to="/login" className="text-sky-400 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
