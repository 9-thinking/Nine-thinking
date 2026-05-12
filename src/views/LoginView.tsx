import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Apple, Globe } from 'lucide-react';
import { ViewState } from '../App';
import { api } from '../services/api';

interface LoginViewProps {
  onNavigate: (view: ViewState) => void;
  onLogin: (user: any) => void;
}

export default function LoginView({ onNavigate, onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await api.auth.login(email, password);
      if (result.success) {
        onLogin(result.user);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 bg-background font-inter p-margin-mobile md:p-6 lg:p-10 transition-all duration-700">
      
      {/* Branding Overlay for Mobile */}
      <div className="md:hidden flex items-center gap-2 mb-10 mt-4">
        <span className="font-outfit font-black text-2xl text-primary tracking-tighter">Nine Thinking</span>
      </div>

      {/* Left Column: Visual Bento */}
      <motion.section 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden md:flex md:col-span-7 relative overflow-hidden rounded-[32px] bg-primary group"
      >
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDozO8ntMpK9pwd1M1M6G5GlADfsJ4ySzjgW5y2Sdq9kGw9iiVE9KMCioRVOm-lI6PksHN1yH9U2A9qASu3sCWOrcDSXnFtQIxszc2bQKt-nTuNMz0s_8eNRNrjmCbMJXm3nO22G6wXI19qcoE3-dYT0znoFrpOh7iFQpAFlZqYyB38Fi9HxjTVN01F14Ni9rYmXFE1B1gkicQjgagIMXlZJ8FeLV-_pZXosSS6nC50RQoWD5eG4YltAW5T942AV6Ijpty7cTcVSy4" 
          alt="Healthcare Professional" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />
        
        <div className="relative z-10 p-12 lg:p-20 flex flex-col justify-end h-full max-w-2xl">
          <h2 className="font-outfit font-black text-5xl lg:text-7xl text-white leading-[1.05] mb-8 tracking-tighter">
            Holistic wellbeing for every Malaysian.
          </h2>
          <p className="text-white/80 text-lg lg:text-xl leading-relaxed mb-10">
            Access your personalized health dashboard, manage specialist appointments, and track your daily wellness metrics in one secure place.
          </p>
          
          <div className="flex gap-6 items-center">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-surface-container-high ring-2 ring-white/10" />
              ))}
            </div>
            <p className="text-sm font-bold text-white/60 tracking-widest uppercase">
              Joined by 50k+ users in KL & Selangor
            </p>
          </div>
        </div>
      </motion.section>

      {/* Right Column: Form Bento */}
      <motion.section 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="col-span-1 md:col-span-5 flex items-center justify-center py-20 px-4 md:px-12 lg:px-20"
      >
        <div className="w-full max-w-md">
            <header className="mb-12">
            <h1 className="font-outfit font-bold text-4xl text-on-surface mb-3 tracking-tight">Selamat Datang</h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Log in to your Nine Thinking account to continue your journey.
            </p>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-sm font-bold animate-shake">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 ml-1">Email Address</label>
              <div className="relative group">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@ninethinking.my"
                  required
                  className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-6 font-inter text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                />
                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3 ml-1">
                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em]">Password</label>
                <button 
                  type="button" 
                  onClick={() => onNavigate('forgot-password')}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-6 font-inter text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                />
                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="btn-primary w-full shadow-primary/20 h-16 text-lg tracking-tight disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="mt-12 text-center text-sm font-medium text-on-surface-variant">
            Don't have an account? {' '}
            <button 
              onClick={() => onNavigate('register')}
              className="text-primary font-bold hover:underline"
            >
              Create an account
            </button>
          </p>
        </div>
      </motion.section>
    </div>
  );
}
