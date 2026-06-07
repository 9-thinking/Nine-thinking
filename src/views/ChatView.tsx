import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  MoreVertical, 
  Phone, 
  Video,
  Smile,
  CheckCheck
} from 'lucide-react';
import { ViewState } from '../App';

interface ChatViewProps {
  onNavigate: (view: ViewState) => void;
  doctor: any;
}

export default function ChatView({ onNavigate, doctor }: ChatViewProps) {
  const [messages, setMessages] = useState([
    { id: 1, text: `Hello! I'm ${doctor?.name || 'your specialist'}. How can I help you today?`, sender: 'doctor', time: '10:30 AM' },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Mock doctor reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Understood. Let me review your health metrics and I'll get back to you shortly.",
        sender: 'doctor',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 2000);
  };

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={() => onNavigate('providers')} className="btn-primary">Select a Provider</button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-surface-container-lowest flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-outline-variant/10 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('providers')}
            className="p-2 hover:bg-surface-container-low rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={doctor.image} 
                alt={doctor.name} 
                className="w-12 h-12 rounded-2xl object-cover border border-outline-variant/10" 
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <h3 className="font-outfit font-black text-lg text-primary leading-tight">{doctor.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">{doctor.specialty} • Online</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-3 hover:bg-surface-container-low rounded-xl transition-colors text-on-surface-variant">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-3 hover:bg-surface-container-low rounded-xl transition-colors text-on-surface-variant">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-3 hover:bg-surface-container-low rounded-xl transition-colors text-on-surface-variant">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <main 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-6 md:p-12 space-y-8 bg-surface-container-lowest/50 backdrop-blur-3xl scroll-smooth"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="px-4 py-1.5 bg-surface-container-low rounded-full text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">
            Today
          </div>
        </div>

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] md:max-w-[60%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-5 rounded-3xl font-inter text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white text-on-surface rounded-tl-none border border-outline-variant/10'
                }`}>
                  {msg.text}
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-on-surface-variant/40 px-2">
                  {msg.time}
                  {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-primary" />}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      {/* Input */}
      <footer className="p-6 bg-white border-t border-outline-variant/10">
        <form 
          onSubmit={handleSend}
          className="max-w-4xl mx-auto flex items-center gap-4 bg-surface-container-low border border-outline-variant/10 rounded-[28px] p-2 pl-6"
        >
          <button type="button" className="p-2 text-on-surface-variant/40 hover:text-primary transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            placeholder="Type your health concern..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-grow bg-transparent border-none focus:ring-0 font-inter font-medium text-sm py-3"
          />
          <button type="button" className="p-2 text-on-surface-variant/40 hover:text-primary transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:scale-100"
          >
            <Send className="w-5 h-5 -rotate-12 translate-x-0.5 -translate-y-0.5" />
          </button>
        </form>
        <p className="text-center mt-4 text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
          All communications are encrypted and secure.
        </p>
      </footer>
    </div>
  );
}
