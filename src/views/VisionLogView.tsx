import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ViewState } from '../App';
import { api } from '../services/api';
import { 
  Camera, 
  Search, 
  Filter, 
  MapPin, 
  Calendar,
  ChevronRight,
  TrendingUp,
  Target,
  Sparkles
} from 'lucide-react';

interface VisionLogViewProps {
  onNavigate: (view: ViewState) => void;
  user: any;
}

export default function VisionLogView({ onNavigate, user }: VisionLogViewProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.visionLogs.getAll(user.id);
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch logs', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchLogs();
  }, [user]);

  const handleAddLog = async () => {
    // Mock adding a log for now
    const newLog = {
      userId: user.id,
      title: 'New Health Moment',
      date: 'Just Now',
      location: 'Kuala Lumpur',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHp4dcTZQaLpz7EVl7SmPCIh1Z5XlcWG30OxaYndrgeH1kO6koTtcwRTGu8pVAHqVh8X-vEBvG7imePrXeDRoxxk7QOHGd_y-bpetWqOvVCZjs12B-n-NswjfiO1LvhTUwgBRepkbryLDA2Z0YFUXpcznezBFUKKkJj3FB1kLPmp3J1IqfX1B5yxGu6-wz7XthnQ3yhzC6brgWzQuOZ8oY4PuEszK4hbgOnRPzeVjq7iu4osNihYb5zUlh9F63grqvQVRDAdnXdLw',
      tags: ['New', 'Wellness'],
      sentiment: 'Happy'
    };
    
    try {
      await api.visionLogs.create(newLog);
      const updatedLogs = await api.visionLogs.getAll(user.id);
      setLogs(updatedLogs);
    } catch (error) {
      console.error('Failed to add log', error);
    }
  };
  return (
    <div className="space-y-gutter pb-32 font-inter">
      {/* Header with Search */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-margin-mobile md:px-0">
        <div>
          <h1 className="font-outfit font-black text-4xl md:text-5xl text-primary tracking-tighter mb-2">Vision Log</h1>
          <p className="text-on-surface-variant font-medium">Capture your journey, visual by visual.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group flex-1 md:flex-none">
            <input 
              type="text" 
              placeholder="Search logs..."
              className="h-14 w-full md:w-64 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-12 font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/40 group-focus-within:text-primary transition-colors" />
          </div>
          <button className="h-14 w-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl flex items-center justify-center hover:bg-surface-container-high transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Action Cards */}
      <section className="grid grid-cols-12 gap-gutter px-margin-mobile md:px-0">
        <motion.div 
          whileHover={{ y: -5 }}
          className="col-span-12 md:col-span-8 bento-card bg-primary text-white border-none flex items-center gap-8 group cursor-pointer overflow-hidden relative"
        >
          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-white/60" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">New entry</span>
            </div>
            <h2 className="font-outfit font-black text-3xl mb-4 tracking-tight leading-tight">What are you <br/>focusing on today?</h2>
            <button 
              onClick={handleAddLog}
              className="h-12 px-6 bg-white text-primary rounded-full font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
            >
              <Camera className="w-4 h-4" />
              Capture Moment
            </button>
          </div>
          <div className="hidden md:block w-48 h-48 bg-white/10 rounded-[32px] transform rotate-12 group-hover:rotate-6 transition-transform flex items-center justify-center">
            <Camera className="w-16 h-16 text-white/20" />
          </div>
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Target className="w-64 h-64" />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="col-span-12 md:col-span-4 bento-card flex flex-col justify-between py-8"
        >
          <div>
            <h3 className="font-outfit font-black text-xl text-on-surface mb-2">Weekly Goal</h3>
            <p className="text-sm text-on-surface-variant mb-6">Complete 5 cardio sessions in KLCC park surroundings.</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-outfit font-black text-primary">3/5</span>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Sessions Done</span>
            </div>
            <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                className="h-full bg-primary"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Logs Grid */}
      <section className="grid grid-cols-12 gap-gutter px-margin-mobile md:px-0">
        {logs.map((log, idx) => (
          <motion.div 
            key={log.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="col-span-12 md:col-span-6 lg:col-span-4 bento-card p-0 overflow-hidden group cursor-pointer border-outline-variant/10 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5"
          >
            <div className="aspect-[16/10] overflow-hidden relative">
              <img 
                src={log.image} 
                alt={log.title} 
                className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
              />
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-background/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-white/20">
                <Calendar className="w-3 h-3" />
                {log.date}
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-outfit font-bold text-xl text-on-surface mb-1 group-hover:text-primary transition-colors">
                    {log.title}
                  </h3>
                  <div className="flex items-center gap-1 text-on-surface-variant/60">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs font-medium">{log.location}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {log.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-surface-container-low border border-outline-variant/30 rounded-full text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Empty State / Add More Card */}
        <motion.div 
          className="col-span-12 md:col-span-6 lg:col-span-4 bento-card flex flex-col items-center justify-center gap-6 border-dashed border-2 bg-transparent hover:bg-surface-container-low transition-all group"
        >
          <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Camera className="w-8 h-8 text-outline/30 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-center px-8">
            <h3 className="font-outfit font-bold text-lg text-on-surface-variant mb-1">Add another moment</h3>
            <p className="text-xs text-on-surface-variant/50 leading-relaxed uppercase tracking-widest font-black">Build your vision log</p>
          </div>
          <button className="h-10 px-6 rounded-full border border-outline-variant/30 font-bold text-xs hover:border-primary hover:text-primary transition-all">
            Upload Entry
          </button>
        </motion.div>
      </section>
    </div>
  );
}
