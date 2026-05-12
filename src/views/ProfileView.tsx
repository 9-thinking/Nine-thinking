import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  CreditCard, 
  LogOut, 
  ChevronRight,
  ExternalLink,
  Smartphone,
  Watch,
  Heart,
  Globe,
  Camera,
  Check,
  X
} from 'lucide-react';
import { ViewState } from '../App';

interface ProfileViewProps {
  onNavigate: (view: ViewState) => void;
  user: any;
  onLogout: () => void;
}

export default function ProfileView({ onNavigate, user, onLogout }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Adam Nasir');
  const [nickname, setNickname] = useState(user?.nickname || 'adam');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profilePic, setProfilePic] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuAMLjGYLOnfptLhLIMb08pu4p5KGtZcz0QElTgp7o3nRK0pnKWC10SmsU1K0zMyDuoMZTwH3kG5NntpfTpPOgpDfON2KDvPv7zMnlFzPm3Qbk3dIERfvE3erJslVQPtLw_LbnJ-yCOu9h1c6hlTPqGk78TeAXkgCbauDZ6pLVAe3TYdDAyAy11ZP9rUlVUlN02j13tf7QIb1L5b9Nf8VcwD7haU47h5cjm6ZwXScvouKrt5Ae1GVCBgGJL-PLZpfAJCpAtWXNO4NO0');

  const handleSave = () => {
    alert('Profile updated successfully!');
    setIsEditing(false);
  };

  const sections = [
    {
      title: 'Global Settings',
      items: [
        { 
          icon: User, 
          label: 'Personal Information', 
          value: user?.email || '@adam.ninethinking',
          onClick: () => setIsEditing(true)
        },
        { 
          icon: Bell, 
          label: 'Notifications', 
          value: notificationsEnabled ? 'All On' : 'Muted',
          toggle: true
        },
        { 
          icon: Shield, 
          label: 'Update Password', 
          value: 'Changed 2m ago',
          onClick: () => onNavigate('forgot-password')
        },
      ]
    },
    {
      title: 'Connected Ecosystem',
      items: [
        { icon: Watch, label: 'Wearable Sync', value: 'Apple Watch Series 9' },
        { icon: Smartphone, label: 'MySejahtera Integration', value: 'Connected' },
        { icon: Globe, label: 'Localized Health Insights', value: 'Malaysia (KL)' },
      ]
    }
  ];

  return (
    <div className="space-y-gutter pb-32">
      {/* Profile Header */}
      <header className="px-margin-mobile md:px-0">
        <div className="bento-card bg-primary text-white border-none py-12 flex flex-col md:flex-row items-center gap-10 text-center md:text-left relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="relative z-10">
            <div className="w-32 h-32 rounded-full border-4 border-white/20 p-1 relative group cursor-pointer">
              <img 
                src={profilePic} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="absolute bottom-0 right-0 w-10 h-10 bg-white text-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                {isEditing ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative z-10 w-full max-w-md">
            {isEditing ? (
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-2xl font-outfit font-black text-white placeholder-white/40 focus:bg-white/20 transition-all outline-none"
                  placeholder="Full Name"
                />
                <div className="flex items-center bg-white/10 border border-white/20 rounded-xl px-4 py-2">
                  <span className="text-white/40 font-bold">@</span>
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="flex-1 bg-transparent px-2 text-lg font-outfit font-bold text-white placeholder-white/40 transition-all outline-none"
                    placeholder="nickname"
                  />
                </div>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-white text-primary px-6 py-2 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-xl"
                >
                  <Check className="w-4 h-4" />
                  Save Profile
                </button>
              </div>
            ) : (
              <>
                <h1 className="font-outfit font-black text-4xl md:text-5xl mb-1 tracking-tighter">{name}</h1>
                <p className="text-white font-outfit font-bold text-xl mb-4 tracking-tight opacity-90">@{nickname}</p>
                <p className="text-white/60 font-inter font-bold uppercase tracking-widest text-[10px] mb-8">Premium Member Since 2023 • KL, Malaysia</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="px-6 py-3 bg-white/10 rounded-2xl flex flex-col items-center md:items-start min-w-[120px]">
                    <span className="text-2xl font-outfit font-black">{user?.weight || '74.5'}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Weight (KG)</span>
                  </div>
                  <div className="px-6 py-3 bg-white/10 rounded-2xl flex flex-col items-center md:items-start min-w-[120px]">
                    <span className="text-2xl font-outfit font-black">{user?.height || '178'}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Height (CM)</span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <User className="w-64 h-64" />
          </div>
        </div>
      </header>

      {/* Settings Sections */}
      <section className="px-margin-mobile md:px-0 grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          {sections.map((section, idx) => (
            <div key={idx} className="bento-card">
              <h3 className="font-outfit font-black text-xl text-on-surface mb-8 tracking-tight">{section.title}</h3>
              <div className="space-y-4">
                {section.items.map((item, i) => (
                  <div 
                    key={i}
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-surface-container-low transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-all">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-on-surface">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.toggle ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setNotificationsEnabled(!notificationsEnabled); }}
                          className={`w-12 h-6 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-primary' : 'bg-outline-variant'}`}
                        >
                          <motion.div 
                            animate={{ x: notificationsEnabled ? 26 : 4 }}
                            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </button>
                      ) : (
                        <>
                          <span className="text-sm text-on-surface-variant font-medium">{item.value}</span>
                          <ChevronRight className="w-4 h-4 text-outline/30 group-hover:text-primary transition-colors" />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onLogout}
              className="flex-1 btn-secondary h-16 group border-red-100 hover:border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="text-red-600 font-bold">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          <div className="bento-card bg-surface-container-highest text-white border-none">
            <h3 className="font-outfit font-bold text-xl mb-6">Wellness Assessment</h3>
            <p className="text-sm text-white/60 mb-8 leading-relaxed">
              Your comprehensive health scan was last updated 3 days ago. Would you like to refresh your data?
            </p>
            <button className="w-full h-14 bg-white/10 border border-white/20 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all">
              <ExternalLink className="w-4 h-4" />
              Start New Scan
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
