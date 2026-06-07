import { motion } from 'motion/react';
import { 
  PlayCircle, 
  Verified, 
  Users, 
  ShieldCheck, 
  Stethoscope, 
  ArrowRight,
  TrendingUp,
  Beef,
  Brain,
  Heal
} from 'lucide-react';
import { ViewState } from '../App';

interface LandingViewProps {
  onNavigate: (view: ViewState) => void;
}

export default function LandingView({ onNavigate }: LandingViewProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-background">
      {/* Navbar Mock for Landing */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 bg-background/80 backdrop-blur-md border-b border-outline-variant/10">
        <span className="font-outfit font-black text-2xl text-primary tracking-tighter">Nine Thinking</span>
        <div className="flex gap-4">
          <button 
            onClick={() => onNavigate('login')}
            className="text-on-surface-variant font-outfit font-bold text-sm hover:text-primary transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => onNavigate('register')}
            className="bg-primary text-white px-8 h-10 rounded-full font-outfit font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            Create Account
          </button>
        </div>
      </nav>

      <main className="pt-24 lg:pt-32 pb-24 max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
        
        {/* Hero Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-12 gap-gutter mb-gutter"
        >
          {/* Main Hero Card */}
          <motion.div 
            variants={itemVariants}
            className="col-span-12 lg:col-span-8 bento-card relative overflow-hidden min-h-[480px] flex flex-col justify-center"
          >
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-container/20 text-secondary rounded-full mb-8">
                <Verified className="w-4 h-4" />
                <span className="font-inter font-bold text-xs uppercase tracking-widest">Verified Wellness Platform</span>
              </div>
              
              <h1 className="font-outfit font-black text-5xl md:text-7xl leading-[1.05] text-primary mb-8 tracking-tighter">
                Smart Health for Every Malaysian
              </h1>
              
              <p className="font-inter text-lg text-on-surface-variant max-w-lg mb-10 leading-relaxed">
                Personalized health insights driven by local AI to help you live a balanced, holistic lifestyle in the heart of Malaysia.
              </p>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => onNavigate('register')}
                  className="btn-primary px-10 text-lg shadow-primary/25"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute right-[-10%] bottom-[-5%] opacity-[0.03] pointer-events-none scale-150 transform rotate-12">
              <Stethoscope className="w-96 h-96 text-primary" />
            </div>
          </motion.div>

          {/* Hero Image Card */}
          <motion.div 
            variants={itemVariants}
            className="col-span-12 lg:col-span-4 rounded-[24px] overflow-hidden relative group aspect-[4/5] lg:aspect-auto"
          >
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHp4dcTZQaLpz7EVl7SmPCIh1Z5XlcWG30OxaYndrgeH1kO6koTtcwRTGu8pVAHqVh8X-vEBvG7imePrXeDRoxxk7QOHGd_y-bpetWqOvVCZjs12B-n-NswjfiO1LvhTUwgBRepkbryLDA2Z0YFUXpcznezBFUKKkJj3FB1kLPmp3J1IqfX1B5yxGu6-wz7XthnQ3yhzC6brgWzQuOZ8oY4PuEszK4hbgOnRPzeVjq7iu4osNihYb5zUlh9F63grqvQVRDAdnXdLw" 
              alt="Healthy Malaysian Meal" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent p-8 flex flex-col justify-end">
              <h3 className="text-white font-outfit font-bold text-2xl mb-1">Localized Nutrition</h3>
              <p className="text-white/80 font-inter text-sm">Smart analysis of Malaysian delicacies</p>
            </div>
          </motion.div>
        </motion.section>

        {/* Impact & Metrics Grid */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-12 gap-gutter mb-gutter"
        >
          {/* SDG Badge */}
          <motion.div variants={itemVariants} className="col-span-12 md:col-span-4 bento-card flex items-center gap-6 border-l-4 border-green-600">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-green-200">
              <span className="text-white font-outfit font-black text-4xl">3</span>
            </div>
            <div>
              <h3 className="font-outfit font-bold text-xl text-on-surface">SDG 3 Impact</h3>
              <p className="font-inter text-sm text-on-surface-variant">Committed to Health and Well-being in SE Asia.</p>
            </div>
          </motion.div>

          {/* Social Metrics */}
          <motion.div variants={itemVariants} className="col-span-6 md:col-span-2 bento-card flex flex-col justify-between">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-outfit font-black text-primary">50k+</p>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Active Users</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="col-span-6 md:col-span-2 bento-card flex flex-col justify-between">
            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-3xl font-outfit font-black text-secondary">100%</p>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Data Private</p>
            </div>
          </motion.div>

          {/* Call to Action Card */}
          <motion.div variants={itemVariants} className="col-span-12 md:col-span-4 bg-primary text-white bento-card border-none flex items-center justify-between group cursor-pointer overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-2">Next Step</p>
              <h4 className="font-outfit font-bold text-xl mb-2 group-hover:translate-x-1 transition-transform">Book a Consultation</h4>
              <p className="text-xs text-white/70">Connect with specialists near you in KL or Selangor.</p>
            </div>
            <Stethoscope className="w-12 h-12 text-white/20 group-hover:scale-125 transition-transform" />
          </motion.div>
        </motion.section>

        {/* Feature Ecosystem Header */}
        <div className="text-center mb-16 mt-24">
          <h2 className="font-outfit font-black text-4xl md:text-5xl text-primary tracking-tighter mb-4">
            Comprehensive Wellness Ecosystem
          </h2>
          <p className="text-on-surface-variant font-inter max-w-2xl mx-auto">
            Our modular platform adapts to your daily life, providing tools for every aspect of your kesejahteraan.
          </p>
        </div>

        {/* Features Bento Grid */}
        <section className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12 md:col-span-6 lg:col-span-3 bento-card">
            <TrendingUp className="w-10 h-10 text-primary mb-6" />
            <h3 className="font-outfit font-bold text-xl mb-4 text-on-surface">Real-time Tracking</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Sync seamlessly with wearables and MySejahtera to track every beat and step.
            </p>
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-3 bento-card">
            <Beef className="w-10 h-10 text-tertiary mb-6" />
            <h3 className="font-outfit font-bold text-xl mb-4 text-on-surface">AI Dietitian</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Snap a photo of your Nasi Lemak and get instant nutritional breakdown and alternatives.
            </p>
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-3 bento-card">
            <Brain className="w-10 h-10 text-secondary mb-6" />
            <h3 className="font-outfit font-bold text-xl mb-4 text-on-surface">Mental Clarity</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Guided localized meditations and stress management sessions designed for urban lifestyles.
            </p>
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-3 bento-card">
            <Stethoscope className="w-10 h-10 text-primary mb-6" />
            <h3 className="font-outfit font-bold text-xl mb-4 text-on-surface">E-Pharmacy</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Halal-certified medication delivery directly to your doorstep within hours.
            </p>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-outline-variant/10 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-outfit font-black text-xl text-primary tracking-tighter">Nine Thinking</span>
            <span className="text-outline-variant text-[10px] uppercase font-bold tracking-widest ml-4">Wellness Malaysia</span>
          </div>
          <div className="flex gap-8 text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Help</a>
          </div>
          <p className="text-xs text-on-surface-variant/40">© 2024 Nine Thinking Wellness Malaysia. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
