import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Phone,
  Video,
  Sparkles,
  CheckCheck,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';
import { ViewState } from '../App';
import { api } from '../services/api';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'doctor';
  time: string;
  error?: boolean;
}

interface ChatViewProps {
  onNavigate: (view: ViewState) => void;
  doctor: any;
  user: any;
}

// Suggested questions per specialty
const SUGGESTIONS: Record<string, string[]> = {
  default: [
    'What are my key health risks based on my profile?',
    'How can I improve my overall wellness?',
    'What should I eat for my goals?',
  ],
  Cardiology: [
    'What heart rate zone should I train in?',
    'How does my weight affect my heart health?',
    'What cardio exercises are best for me?',
  ],
  Nutritionist: [
    'What daily calorie intake do you recommend for me?',
    'How should I balance my macros for my goal?',
    'Are there any foods I should avoid?',
  ],
  Pediatrician: [
    'What are the best wellness habits to build?',
    'How much sleep should I be getting?',
    'What vitamins should I be taking?',
  ],
};

function getSuggestions(specialty: string): string[] {
  for (const key of Object.keys(SUGGESTIONS)) {
    if (specialty?.toLowerCase().includes(key.toLowerCase())) {
      return SUGGESTIONS[key];
    }
  }
  return SUGGESTIONS.default;
}

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatView({ onNavigate, doctor, user }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Hello! I'm ${doctor?.name || 'your specialist'} from ${doctor?.specialty || 'the clinic'}. How can I help you today? Feel free to share your health concern or question.`,
      sender: 'doctor',
      time: now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = getSuggestions(doctor?.specialty || '');

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now(), text, sender: 'user', time: now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setShowSuggestions(false);
    setIsTyping(true);

    try {
      // Send full conversation history so AI has context
      const historyForAPI = updatedMessages.map(m => ({ sender: m.sender, text: m.text }));
      const response = await api.chat.sendMessage(doctor, user, historyForAPI);

      const replyText = response.success
        ? response.reply
        : (response.message || 'I apologise, I encountered an issue. Please try again.');

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: replyText,
          sender: 'doctor',
          time: now(),
          error: !response.success,
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: 'Connection error. Please check that the server is running and try again.',
          sender: 'doctor',
          time: now(),
          error: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <Stethoscope className="w-16 h-16 text-primary/30" />
        <p className="text-on-surface-variant font-medium text-center">No doctor selected. Please choose a provider first.</p>
        <button onClick={() => onNavigate('providers')} className="btn-primary h-12 px-8">
          Find a Provider
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-surface-container-lowest flex flex-col overflow-hidden font-inter">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-outline-variant/10 px-4 md:px-6 py-3 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('providers')}
            className="p-2 hover:bg-surface-container-low rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={doctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random&color=fff`}
                alt={doctor.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=5B8AF5&color=fff`;
                }}
                className="w-11 h-11 rounded-2xl object-cover border border-outline-variant/10"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <h3 className="font-outfit font-black text-base text-on-surface leading-tight">{doctor.name}</h3>
              <div className="flex items-center gap-1.5">
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-green-500 rounded-full"
                />
                <p className="text-[10px] font-black uppercase tracking-widest text-green-500">AI Live · Online</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* AI badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-full mr-2">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Gemini AI</span>
          </div>
          <button className="p-2.5 hover:bg-surface-container-low rounded-xl transition-colors text-on-surface-variant">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2.5 hover:bg-surface-container-low rounded-xl transition-colors text-on-surface-variant">
            <Video className="w-4 h-4" />
          </button>
          <button className="p-2.5 hover:bg-surface-container-low rounded-xl transition-colors text-on-surface-variant">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <main
        ref={scrollRef}
        className="flex-grow overflow-y-auto px-4 md:px-8 py-6 space-y-4 scroll-smooth"
      >
        {/* Date separator */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-outline-variant/10" />
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 px-2">Today</span>
          <div className="flex-1 h-px bg-outline-variant/10" />
        </div>

        {/* User health context banner */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-sm bg-primary/5 border border-primary/10 rounded-2xl p-3 text-center mb-2"
          >
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Health Context Shared</p>
            <p className="text-xs text-on-surface-variant">
              {[user.age && `Age ${user.age}`, user.weight && `${user.weight}kg`, user.goal].filter(Boolean).join(' · ')}
            </p>
          </motion.div>
        )}

        {/* Messages */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Doctor avatar */}
              {msg.sender === 'doctor' && (
                <img
                  src={doctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=5B8AF5&color=fff`}
                  alt={doctor.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=5B8AF5&color=fff`;
                  }}
                  className="w-8 h-8 rounded-xl object-cover mr-2 mt-1 shrink-0 border border-outline-variant/10"
                />
              )}

              <div className={`max-w-[78%] md:max-w-[58%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.sender === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : msg.error
                      ? 'bg-red-50 text-red-600 border border-red-200 rounded-bl-sm'
                      : 'bg-white text-on-surface border border-outline-variant/10 rounded-bl-sm'
                    }`}
                >
                  {msg.error && <AlertCircle className="w-4 h-4 inline mr-1.5 -mt-0.5" />}
                  {msg.text}
                </div>
                <div className={`mt-1 flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant/40 px-1 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <span>{msg.time}</span>
                  {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-primary" />}
                  {msg.sender === 'doctor' && !msg.error && (
                    <span className="flex items-center gap-0.5 text-primary/60">
                      <Sparkles className="w-2.5 h-2.5" /> AI
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-end gap-2"
            >
              <img
                src={doctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=5B8AF5&color=fff`}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=5B8AF5&color=fff`; }}
                className="w-8 h-8 rounded-xl object-cover shrink-0 border border-outline-variant/10"
              />
              <div className="bg-white border border-outline-variant/10 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                {[0, 0.2, 0.4].map((delay) => (
                  <motion.div
                    key={delay}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay, ease: 'easeInOut' }}
                    className="w-2 h-2 bg-primary/40 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggested questions */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pt-2"
            >
              <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-3 pl-1">
                Suggested Questions
              </p>
              <div className="flex flex-col gap-2">
                {suggestions.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => handleSuggestion(s)}
                    disabled={isTyping}
                    className="text-left px-4 py-3 rounded-2xl border border-primary/20 bg-primary/5 text-sm font-medium text-primary hover:bg-primary/10 transition-all active:scale-98 disabled:opacity-50"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Input Bar ───────────────────────────────────────────────────── */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-outline-variant/10 px-4 md:px-6 py-4 shrink-0">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto flex items-center gap-3 bg-surface-container-low border border-outline-variant/15 rounded-[28px] p-1.5 pl-5 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={isTyping ? `${doctor.name} is typing...` : 'Ask your health question…'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            className="flex-grow bg-transparent border-none focus:ring-0 font-inter text-sm py-2.5 disabled:opacity-60 placeholder:text-on-surface-variant/40"
          />
          <motion.button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 bg-primary text-white rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-40 disabled:shadow-none shrink-0"
          >
            {isTyping ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <Send className="w-4 h-4 -rotate-12 translate-x-px" />
            )}
          </motion.button>
        </form>

        <div className="flex items-center justify-center gap-2 mt-3">
          <Sparkles className="w-3 h-3 text-primary/40" />
          <p className="text-center text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
            Powered by Gemini AI · Not a substitute for in-person care
          </p>
        </div>
      </footer>
    </div>
  );
}
