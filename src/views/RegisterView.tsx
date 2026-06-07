import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  User,
  Fingerprint,
  Smartphone
} from 'lucide-react';
import { ViewState } from '../App';
import { api } from '../services/api';

interface RegisterViewProps {
  onNavigate: (view: ViewState) => void;
  onLogin: (user: any) => void;
}

export default function RegisterView({ onNavigate, onLogin }: RegisterViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!name || !nickname || !phone) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await api.auth.register({ email, password, name, nickname, phone });
      if (result.success) {
        onLogin(result.user);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 font-inter bg-background">
      {/* Visual Side */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden md:flex md:col-span-7 bg-primary relative overflow-hidden flex-col justify-between p-20"
      >
        <div className="relative z-10">
          <span className="font-outfit font-black text-3xl text-white tracking-tighter">Nine Thinking</span>
        </div>
        
        <div className="relative z-10 max-w-lg">
          <h2 className="font-outfit font-black text-6xl text-white mb-8 leading-[1.1] tracking-tighter">
            Join the wellness revolution.
          </h2>
          <p className="text-white/70 text-xl font-medium leading-relaxed">
            Create your account and start your personalized journey to better health in Malaysia.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-[-10%] top-[20%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute left-[10%] bottom-[-5%] w-64 h-64 bg-secondary/20 rounded-full blur-2xl" />
      </motion.div>

      {/* Form Side */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="col-span-1 md:col-span-5 flex items-center justify-center py-20 px-4 md:px-12 lg:px-20 overflow-y-auto"
      >
        <div className="w-full max-w-md">
          <button 
            onClick={() => onNavigate('login')}
            className="flex items-center gap-2 text-on-surface-variant font-bold text-sm mb-12 hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </button>

          <header className="mb-12">
            <h1 className="font-outfit font-bold text-4xl text-on-surface mb-3 tracking-tight">Create Account</h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Start your journey today.
            </p>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-sm font-bold animate-shake">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Full Name</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-12 font-inter font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40 group-focus-within:text-primary transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Nickname</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="JD"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-12 font-inter font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                  />
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40 group-focus-within:text-primary transition-colors" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Phone Number</label>
              <div className="relative group">
                <input 
                  type="tel" 
                  placeholder="+60 12-345 6789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-12 font-inter font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                />
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-12 font-inter font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Password</label>
                <div className="relative group">
                  <input 
                    type="password" 
                    placeholder="Min. 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-12 font-inter font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40 group-focus-within:text-primary transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Confirm</label>
                <div className="relative group">
                  <input 
                    type="password" 
                    placeholder="Repeat"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-12 font-inter font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40 group-focus-within:text-primary transition-colors" />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-14 text-base shadow-primary/20 mt-4 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="mt-12 text-center text-sm font-medium text-on-surface-variant">
            Already have an account? {' '}
            <button 
              onClick={() => onNavigate('login')}
              className="text-primary font-bold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
