import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { ViewState } from '../App';
import { api } from '../services/api';

interface ForgotPasswordViewProps {
  onNavigate: (view: ViewState) => void;
}

export default function ForgotPasswordView({ onNavigate }: ForgotPasswordViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Reset, 3: Success

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.auth.forgotPassword(email);
      if (result.success) {
        setStep(2);
      } else {
        setError(result.message || 'Account not found');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await api.auth.resetPassword({ email, password });
      if (result.success) {
        setStep(3);
      } else {
        setError(result.message || 'Failed to update password');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-inter bg-background p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bento-card p-10 shadow-2xl shadow-primary/5"
      >
        <button 
          onClick={() => onNavigate('login')}
          className="flex items-center gap-2 text-on-surface-variant font-bold text-sm mb-12 hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </button>

        {step === 1 && (
          <>
            <header className="mb-10">
              <h1 className="font-outfit font-black text-4xl text-on-surface mb-3 tracking-tight">Forgot Password</h1>
              <p className="text-on-surface-variant leading-relaxed">
                Enter your registered email address to find your account.
              </p>
            </header>

            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-sm font-bold animate-shake">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              <div className="space-y-2">
                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative group">
                  <input 
                    type="email" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-12 font-inter font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40 group-focus-within:text-primary transition-colors" />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-14 text-base shadow-primary/20 disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Find Account'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <header className="mb-10">
              <h1 className="font-outfit font-black text-4xl text-on-surface mb-3 tracking-tight">New Password</h1>
              <p className="text-on-surface-variant leading-relaxed">
                Account verified! Please enter your new password below.
              </p>
            </header>

            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-sm font-bold animate-shake">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleResetSubmit}>
              <div className="space-y-2">
                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">New Password</label>
                <div className="relative group">
                  <input 
                    type="password" 
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-12 font-inter font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40 group-focus-within:text-primary transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                <div className="relative group">
                  <input 
                    type="password" 
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-12 font-inter font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40 group-focus-within:text-primary transition-colors" />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-14 text-base shadow-primary/20 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="font-outfit font-black text-3xl text-on-surface mb-4">All set!</h2>
            <p className="text-on-surface-variant mb-10 leading-relaxed">
              Your password has been updated successfully. You can now log in with your new credentials.
            </p>
            <button 
              onClick={() => onNavigate('login')}
              className="btn-primary w-full h-14 text-base shadow-primary/20"
            >
              Go to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
