import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, User, Ruler, Weight, UserCircle2 } from 'lucide-react';
import { ViewState } from '../App';
import { api } from '../services/api';

interface OnboardingViewProps {
  onNavigate: (view: ViewState) => void;
  user: any;
  onUpdate: (user: any) => void;
}

export default function OnboardingView({ onNavigate, user, onUpdate }: OnboardingViewProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [formData, setFormData] = useState({
    gender: 'Male',
    age: '',
    height: '',
    weight: '',
    activity_level: 'Moderately Active',
    goal: 'Build Muscle'
  });

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      try {
        const result = await api.auth.onboarding({
          userId: user.id,
          ...formData
        });
        if (result.success) {
          onUpdate(result.user);
          onNavigate('dashboard');
        }
      } catch (error) {
        console.error('Onboarding failed', error);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onNavigate('login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-inter">
      {/* Header */}
      <header className="p-margin-mobile md:px-margin-desktop py-6 flex justify-between items-center bg-background/50 backdrop-blur-sm sticky top-0 z-40">
        <button 
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-on-surface" />
        </button>
        
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step >= i + 1 ? 'w-8 bg-primary' : 'w-2 bg-outline-variant/30'
              }`}
            />
          ))}
        </div>

        <button 
          onClick={() => onNavigate('dashboard')}
          className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] hover:text-primary"
        >
          Skip
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 mb-20 lg:mb-0">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-xl"
            >
              <div className="text-center mb-12">
                <span className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4 block">Step 01</span>
                <h1 className="font-outfit font-black text-4xl md:text-5xl text-on-surface mb-4 tracking-tighter">Complete your profile</h1>
                <p className="text-on-surface-variant text-lg">We need some basic info to personalize your health plan.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bento-card p-10 shadow-2xl shadow-primary/5">
                {/* Gender */}
                <div className="space-y-4">
                  <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Gender Identity</label>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setFormData({ ...formData, gender: 'Male' })}
                      className={`flex-1 h-16 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all hover:opacity-90 active:scale-95 ${formData.gender === 'Male' ? 'bg-primary text-white' : 'bg-surface-container-low border border-outline-variant/30 text-on-surface-variant'}`}
                    >
                      Male
                    </button>
                    <button 
                      onClick={() => setFormData({ ...formData, gender: 'Female' })}
                      className={`flex-1 h-16 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all hover:opacity-90 active:scale-95 ${formData.gender === 'Female' ? 'bg-primary text-white' : 'bg-surface-container-low border border-outline-variant/30 text-on-surface-variant'}`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-4">
                  <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Current Age</label>
                  <div className="relative group">
                    <input 
                      type="number" 
                      placeholder="e.g. 28"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full h-16 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-6 font-inter font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all pr-14"
                    />
                    <UserCircle2 className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                {/* Height */}
                <div className="space-y-4">
                  <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Height (CM)</label>
                  <div className="relative group">
                    <input 
                      type="number" 
                      placeholder="e.g. 175"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full h-16 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-6 font-inter font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all pr-14"
                    />
                    <Ruler className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                {/* Weight */}
                <div className="space-y-4">
                  <label className="block text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Weight (KG)</label>
                  <div className="relative group">
                    <input 
                      type="number" 
                      placeholder="e.g. 70"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full h-16 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-6 font-inter font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all pr-14"
                    />
                    <Weight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                <div className="md:col-span-2 pt-6">
                  <button 
                    onClick={handleNext}
                    className="btn-primary w-full h-16 shadow-primary/20 text-lg"
                  >
                    Continue to Activity
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-xl"
            >
              <div className="text-center mb-12">
                <span className="text-xs font-black text-secondary uppercase tracking-[0.3em] mb-4 block">Step 02</span>
                <h1 className="font-outfit font-black text-4xl md:text-5xl text-on-surface mb-4 tracking-tighter">Your daily routine</h1>
                <p className="text-on-surface-variant text-lg">How active are you on a typical day?</p>
              </div>

              <div className="grid gap-4">
                {[
                  { title: 'Sedentary', desc: 'Mainly sitting at a desk or home', level: 'Level 1' },
                  { title: 'Lightly Active', desc: 'Light exercise or active hobbies', level: 'Level 2' },
                  { title: 'Moderately Active', desc: 'Consistent workouts 3-5x/week', level: 'Level 3' },
                  { title: 'Very Active', desc: 'High intensity sports or physical labor', level: 'Level 4' },
                ].map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setFormData({ ...formData, activity_level: item.title });
                      handleNext();
                    }}
                    className={`bento-card p-6 flex items-center justify-between group hover:border-primary transition-all text-left ${formData.activity_level === item.title ? 'border-primary ring-2 ring-primary/5' : ''}`}
                  >
                    <div>
                      <h3 className="font-outfit font-bold text-xl mb-1 text-on-surface">{item.title}</h3>
                      <p className="text-sm text-on-surface-variant">{item.desc}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${formData.activity_level === item.title ? 'text-primary' : 'text-primary/40 group-hover:text-primary'}`}>{item.level}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-xl"
            >
              <div className="text-center mb-12">
                <span className="text-xs font-black text-tertiary uppercase tracking-[0.3em] mb-4 block">Step 03</span>
                <h1 className="font-outfit font-black text-4xl md:text-5xl text-on-surface mb-4 tracking-tighter">Primary Wellness Goals</h1>
                <p className="text-on-surface-variant text-lg">Select what matters most to you right now.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  'Weight Loss', 'Build Muscle', 'Better Sleep', 'Reduce Stress', 'Flexibility', 'Heart Health'
                ].map((goal, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setFormData({ ...formData, goal });
                      handleNext();
                    }}
                    className={`bento-card p-8 flex flex-col items-center justify-center gap-4 text-center group hover:bg-primary transition-all duration-300 active:scale-95 ${formData.goal === goal ? 'bg-primary border-none' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${formData.goal === goal ? 'bg-white/20' : 'bg-surface-container-high group-hover:bg-white/20'}`}>
                      <User className={`w-6 h-6 transition-colors ${formData.goal === goal ? 'text-white' : 'text-primary group-hover:text-white'}`} />
                    </div>
                    <span className={`font-outfit font-bold text-lg transition-colors ${formData.goal === goal ? 'text-white' : 'text-on-surface group-hover:text-white'}`}>{goal}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Navigation (Mobile Sticky) */}
      <footer className="md:hidden p-margin-mobile border-t border-outline-variant/10 bg-background/80 backdrop-blur-md fixed bottom-0 w-full flex gap-4">
        <button 
          onClick={handleBack}
          className="flex-1 h-14 bg-surface-container-low border border-outline-variant/20 rounded-2xl font-bold"
        >
          Back
        </button>
        <button 
          onClick={handleNext}
          className="flex-1 h-14 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20"
        >
          {step === totalSteps ? 'Complete' : 'Continue'}
        </button>
      </footer>
    </div>
  );
}
