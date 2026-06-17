import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Search,
  MapPin,
  Star,
  MessageSquare,
  Calendar,
  Filter,
  X,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { ViewState } from '../App';

interface ProvidersViewProps {
  onNavigate: (view: ViewState) => void;
  onSelectDoctor: (doctor: any) => void;
}

// ── Time slots ────────────────────────────────────────────────────────────────
const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '2:00 PM',  '2:30 PM',
  '3:00 PM',  '3:30 PM',  '4:00 PM',  '4:30 PM',
];

// ── Build a 7-day calendar starting today ─────────────────────────────────────
function getNextDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}
function fmt(d: Date) {
  return d.toLocaleDateString('en-MY', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function ProvidersView({ onNavigate, onSelectDoctor }: ProvidersViewProps) {
  const [providers, setProviders]       = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchQuery, setSearchQuery]   = useState('');
  const [bookingDoctor, setBookingDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate]  = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot]  = useState<string | null>(null);
  const [patientName, setPatientName]    = useState('');
  const [patientNote, setPatientNote]    = useState('');
  const [confirmed, setConfirmed]        = useState(false);
  const [dayOffset, setDayOffset]        = useState(0);

  const days = getNextDays(14).slice(dayOffset, dayOffset + 7);

  useEffect(() => {
    fetch('http://localhost:3001/api/consultations')
      .then(r => r.json())
      .then(d => setProviders(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = providers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openBooking = (doc: any) => {
    setBookingDoctor(doc);
    setSelectedDate(null);
    setSelectedSlot(null);
    setPatientName('');
    setPatientNote('');
    setConfirmed(false);
    setDayOffset(0);
  };

  const confirmBooking = () => {
    if (!selectedDate || !selectedSlot || !patientName.trim()) return;
    // Save to localStorage
    const appts = JSON.parse(localStorage.getItem('appointments') || '[]');
    appts.push({
      id: Date.now(),
      doctor: bookingDoctor.name,
      specialty: bookingDoctor.specialty,
      date: fmt(selectedDate),
      time: selectedSlot,
      patient: patientName,
      note: patientNote,
      bookedAt: new Date().toISOString(),
    });
    localStorage.setItem('appointments', JSON.stringify(appts));
    setConfirmed(true);
  };

  const closeModal = () => setBookingDoctor(null);

  return (
    <div className="min-h-screen bg-surface-container-lowest font-inter pb-24">

      {/* ── Header ─────────────────────────────────────────────────────── */}
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
            <p className="text-on-surface-variant font-medium">Find and book top-tier medical providers across Malaysia.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative group max-w-xs w-full">
              <input
                type="text"
                placeholder="Search specialty or doctor..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
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

      {/* ── Provider Grid ───────────────────────────────────────────────── */}
      <main className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((doc, idx) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bento-card group hover:shadow-2xl hover:shadow-primary/5 transition-all overflow-hidden p-0"
              >
                <div className="aspect-[16/9] relative overflow-hidden bg-primary/5">
                  <img
                    src={doc.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=5B8AF5&color=fff`}
                    alt={doc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=5B8AF5&color=fff`; }}
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-black tracking-widest">4.9 (120+)</span>
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
                      className="btn-primary h-12 text-xs"
                    >
                      <MessageSquare className="w-4 h-4" /> Consult
                    </button>
                    <button
                      onClick={() => openBooking(doc)}
                      className="h-12 rounded-2xl bg-surface-container-low border-2 border-outline-variant/20 font-bold text-xs hover:bg-primary/5 hover:border-primary/30 transition-all flex items-center justify-center gap-2 text-on-surface"
                    >
                      <Calendar className="w-4 h-4 text-primary" /> Book
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* ── Booking Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {bookingDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', bounce: 0.25 }}
              className="w-full max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-white border-b border-outline-variant/10 px-6 py-5 flex items-center justify-between z-10 rounded-t-3xl">
                <div className="flex items-center gap-4">
                  <img
                    src={bookingDoctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(bookingDoctor.name)}&background=5B8AF5&color=fff`}
                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bookingDoctor.name)}&background=5B8AF5&color=fff`; }}
                    className="w-12 h-12 rounded-2xl object-cover border border-outline-variant/10"
                  />
                  <div>
                    <h3 className="font-outfit font-black text-lg text-on-surface">{bookingDoctor.name}</h3>
                    <p className="text-xs text-primary font-bold">{bookingDoctor.specialty}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 rounded-xl hover:bg-surface-container-low transition-colors">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              {!confirmed ? (
                <div className="p-6 space-y-6">
                  {/* Date picker */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-outfit font-bold text-lg text-on-surface flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" /> Select Date
                      </h4>
                      <div className="flex gap-1">
                        <button onClick={() => setDayOffset(Math.max(0, dayOffset - 7))} disabled={dayOffset === 0}
                          className="p-1.5 rounded-lg hover:bg-surface-container-low disabled:opacity-30 transition-all">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDayOffset(dayOffset + 7)}
                          className="p-1.5 rounded-lg hover:bg-surface-container-low transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {days.map((d) => {
                        const isSelected = selectedDate?.toDateString() === d.toDateString();
                        const isToday = d.toDateString() === new Date().toDateString();
                        return (
                          <button
                            key={d.toISOString()}
                            onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                            className={`flex flex-col items-center py-3 rounded-2xl transition-all text-center ${
                              isSelected
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-surface-container-low hover:bg-primary/5 hover:border-primary/20 border border-transparent'
                            }`}
                          >
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white/70' : 'text-on-surface-variant/50'}`}>
                              {d.toLocaleDateString('en', { weekday: 'short' })}
                            </span>
                            <span className={`text-lg font-outfit font-black ${isSelected ? 'text-white' : isToday ? 'text-primary' : 'text-on-surface'}`}>
                              {d.getDate()}
                            </span>
                            {isToday && !isSelected && <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time slot picker */}
                  {selectedDate && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <h4 className="font-outfit font-bold text-lg text-on-surface flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-primary" /> Select Time
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map(slot => (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2.5 rounded-2xl text-xs font-bold transition-all ${
                              selectedSlot === slot
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'bg-surface-container-low hover:bg-primary/5 border border-transparent hover:border-primary/20 text-on-surface'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Patient info */}
                  {selectedSlot && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <h4 className="font-outfit font-bold text-lg text-on-surface flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" /> Your Details
                      </h4>
                      <div>
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Ahmad bin Abdullah"
                          value={patientName}
                          onChange={e => setPatientName(e.target.value)}
                          className="w-full h-12 bg-surface-container-low border border-outline-variant/20 rounded-2xl px-4 font-medium text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-1.5">Reason / Notes (optional)</label>
                        <textarea
                          placeholder="e.g. Routine checkup, chest pain, follow-up..."
                          value={patientNote}
                          onChange={e => setPatientNote(e.target.value)}
                          rows={3}
                          className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-4 py-3 font-medium text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all resize-none"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Booking summary + confirm */}
                  {selectedDate && selectedSlot && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-2 text-sm">
                        <p className="font-black text-primary text-[10px] uppercase tracking-widest mb-2">Appointment Summary</p>
                        <div className="flex justify-between"><span className="text-on-surface-variant">Doctor</span><strong>{bookingDoctor.name}</strong></div>
                        <div className="flex justify-between"><span className="text-on-surface-variant">Date</span><strong>{fmt(selectedDate)}</strong></div>
                        <div className="flex justify-between"><span className="text-on-surface-variant">Time</span><strong>{selectedSlot}</strong></div>
                        <div className="flex justify-between"><span className="text-on-surface-variant">Location</span><strong>{bookingDoctor.location}</strong></div>
                      </div>
                      <button
                        onClick={confirmBooking}
                        disabled={!patientName.trim()}
                        className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-5 h-5" /> Confirm Appointment
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                /* Confirmation screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 text-center space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                    className="w-24 h-24 bg-green-500/10 border-4 border-green-500/20 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </motion.div>
                  <div>
                    <h3 className="font-outfit font-black text-3xl text-on-surface mb-2">Appointment Booked! 🎉</h3>
                    <p className="text-on-surface-variant">Your appointment has been confirmed and saved.</p>
                  </div>
                  <div className="p-5 bg-surface-container-low rounded-2xl space-y-3 text-sm text-left">
                    <div className="flex justify-between"><span className="text-on-surface-variant">Doctor</span><strong>{bookingDoctor.name}</strong></div>
                    <div className="flex justify-between"><span className="text-on-surface-variant">Date</span><strong>{fmt(selectedDate!)}</strong></div>
                    <div className="flex justify-between"><span className="text-on-surface-variant">Time</span><strong>{selectedSlot}</strong></div>
                    <div className="flex justify-between"><span className="text-on-surface-variant">Patient</span><strong>{patientName}</strong></div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={closeModal} className="flex-1 h-12 rounded-2xl bg-surface-container-low border border-outline-variant/20 font-bold text-sm hover:bg-surface-container-high transition-all">
                      Close
                    </button>
                    <button onClick={() => onSelectDoctor(bookingDoctor)} className="flex-1 h-12 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Chat with Doctor
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
