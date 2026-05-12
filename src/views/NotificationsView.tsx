import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Calendar,
  X
} from 'lucide-react';
import { ViewState } from '../App';

interface NotificationsViewProps {
  onNavigate: (view: ViewState) => void;
}

export default function NotificationsView({ onNavigate }: NotificationsViewProps) {
  const notifications = [
    {
      id: 1,
      title: 'Workout Completed!',
      desc: 'You just finished "KL Urban Run". Great job!',
      time: '2h ago',
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      id: 2,
      title: 'New Message',
      desc: 'Dr. Sarah Lim sent you a message about your heart rate.',
      time: '5h ago',
      icon: MessageSquare,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      id: 3,
      title: 'Appointment Reminder',
      desc: 'Your consultation with Dr. Azman is tomorrow at 10 AM.',
      time: '1d ago',
      icon: Calendar,
      color: 'text-secondary',
      bg: 'bg-secondary/10'
    },
    {
      id: 4,
      title: 'Health Alert',
      desc: 'Your steps are 20% lower than your daily average.',
      time: '2d ago',
      icon: AlertCircle,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-surface-container-lowest font-inter">
      <header className="bg-white border-b border-outline-variant/10 px-margin-mobile md:px-margin-desktop py-8 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-on-surface-variant font-bold text-sm mb-4 hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <h1 className="font-outfit font-black text-4xl text-primary tracking-tighter">Notifications</h1>
            <button className="text-xs font-black text-primary uppercase tracking-widest hover:underline">Mark all as read</button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-margin-mobile py-12">
        <div className="space-y-4">
          {notifications.map((notif, idx) => (
            <motion.div 
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 bg-white border border-outline-variant/10 rounded-[32px] flex items-start gap-6 group hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer"
            >
              <div className={`w-14 h-14 ${notif.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                <notif.icon className={`w-7 h-7 ${notif.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-outfit font-bold text-lg text-on-surface">{notif.title}</h3>
                  <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">{notif.time}</span>
                </div>
                <p className="text-sm text-on-surface-variant font-medium leading-relaxed">{notif.desc}</p>
              </div>
              <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-surface-container-low rounded-xl transition-all">
                <X className="w-4 h-4 text-on-surface-variant/40" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell className="w-10 h-10 text-outline/20" />
          </div>
          <p className="text-on-surface-variant font-bold text-sm tracking-tight">You're all caught up!</p>
          <p className="text-xs text-on-surface-variant/40 mt-1">Check back later for new health updates.</p>
        </div>
      </main>
    </div>
  );
}
