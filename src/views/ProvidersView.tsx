import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Star, 
  MessageSquare, 
  Calendar,
  Filter
} from 'lucide-react';
import { ViewState } from '../App';
import { api } from '../services/api';

interface ProvidersViewProps {
  onNavigate: (view: ViewState) => void;
  onSelectDoctor: (doctor: any) => void;
}

export default function ProvidersView({ onNavigate, onSelectDoctor }: ProvidersViewProps) {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/consultations');
        const data = await response.json();
        setProviders(data);
      } catch (error) {
        console.error('Failed to fetch providers', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface-container-lowest font-inter pb-24">
      {/* Header */}
      <header className="bg-white border-b border-outline-variant/10 px-margin-mobile md:px-margin-desktop py-8 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 text-on-surface-variant font-bold text-sm mb-4 hover:text-primary transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
            <h1 className="font-outfit font-black text-4xl text-primary tracking-tighter">Health Specialists</h1>
            <p className="text-on-surface-variant font-medium">Find and connect with top-tier medical providers across Malaysia.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="relative group max-w-xs w-full">
              <input 
                type="text" 
                placeholder="Search specialty or doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-12 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40 group-focus-within:text-primary transition-colors" />
            </div>
            <button className="w-12 h-12 rounded-2xl border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container-low transition-colors">
              <Filter className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProviders.map((doc, idx) => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bento-card group hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer overflow-hidden p-0"
              >
                <div className="aspect-[16/9] relative overflow-hidden bg-primary/5">
                  <img 
                    src={doc.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=random&color=fff`} 
                    alt={doc.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=random&color=fff`;
                    }}
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-black tracking-widest text-on-surface">4.9 (120+)</span>
                  </div>
                  {doc.status === 'online' && (
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-green-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-green-500/20">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Available Now
                    </div>
                  )}
                </div>
                
                <div className="p-8">
                  <h3 className="font-outfit font-bold text-2xl text-on-surface mb-1">{doc.name}</h3>
                  <p className="text-primary font-bold text-sm mb-4">{doc.specialty}</p>
                  
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs font-medium mb-8">
                    <MapPin className="w-4 h-4 text-outline" />
                    {doc.location}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => onSelectDoctor(doc)}
                      className="btn-primary h-12 text-xs flex-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Consult
                    </button>
                    <button className="h-12 rounded-2xl border-2 border-outline-variant/30 font-bold text-xs hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Book
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
