import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewState } from '../App';
import { api } from '../services/api';
import {
  Camera,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Sparkles,
  Upload,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Scale,
  Brain,
  Clock
} from 'lucide-react';

interface CalorieScannerViewProps {
  onNavigate: (view: ViewState) => void;
  user: any;
}

export default function CalorieScannerView({
  onNavigate,
  user
}: CalorieScannerViewProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState<'idle' | 'uploading' | 'analysing' | 'done'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await api.calories.getAll(user.id);
        setLogs(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) loadLogs();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setResult(null);
    setError(null);
    setScanStep('idle');
    const url = URL.createObjectURL(selected);
    setPreview(url);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (!dropped || !dropped.type.startsWith('image/')) return;
    setFile(dropped);
    setResult(null);
    setError(null);
    setScanStep('idle');
    setPreview(URL.createObjectURL(dropped));
  };

  const scanFood = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setScanStep('uploading');

    try {
      await new Promise(r => setTimeout(r, 600));
      setScanStep('analysing');

      const response = await api.calories.scan(user.id, file);

      if (!response.success) {
        setError(response.message || 'Food detection failed.');
        setScanStep('idle');
        return;
      }

      setResult(response);
      setScanStep('done');

      const updatedLogs = await api.calories.getAll(user.id);
      setLogs(updatedLogs);
      setFile(null);
      setPreview(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to scan food. Make sure both servers are running.');
      setScanStep('idle');
    } finally {
      setLoading(false);
    }
  };

  const scanStepLabel = {
    idle: null,
    uploading: 'Uploading image…',
    analysing: 'Gemini is analysing your food…',
    done: 'Analysis complete!',
  }[scanStep];

  return (
    <div className="space-y-10 pb-32 font-inter">

      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs font-black text-primary uppercase tracking-widest">Powered by Gemini Vision</span>
        </div>
        <h1 className="font-outfit font-black text-5xl text-on-surface tracking-tight">
          AI Calorie Scanner
        </h1>
        <p className="text-on-surface-variant mt-2 max-w-lg">
          Upload any food photo and Gemini AI will identify it, estimate portion weight, and calculate real nutritional values — for any food in the world.
        </p>
      </header>

      {/* Scanner Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-12 gap-6"
      >
        {/* Drop Zone */}
        <div className="col-span-12 md:col-span-6">
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => !loading && fileInputRef.current?.click()}
            className={`relative w-full aspect-square rounded-3xl border-2 border-dashed overflow-hidden cursor-pointer transition-all group
              ${preview ? 'border-primary/40' : 'border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-low/50'}
            `}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Food preview"
                  className="w-full h-full object-cover"
                />
                {/* Scan overlay animation */}
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
                    >
                      {/* Scanning laser line */}
                      <motion.div
                        initial={{ top: '0%' }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_4px] shadow-primary/60"
                        style={{ position: 'absolute' }}
                      />
                      <div className="relative z-10 text-center px-6">
                        <motion.div
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          className="w-16 h-16 bg-primary/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-3 mx-auto border border-primary/30"
                        >
                          <Sparkles className="w-7 h-7 text-white" />
                        </motion.div>
                        <p className="text-white font-bold text-sm">{scanStepLabel}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Change photo button */}
                {!loading && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <span className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                      Change Photo
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-on-surface-variant">
                <div className="w-20 h-20 rounded-full bg-surface-container-low group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                  <Upload className="w-9 h-9 group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-on-surface">Drop your food photo here</p>
                  <p className="text-sm mt-1 text-on-surface-variant/70">or click to browse</p>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
                  JPG · PNG · WEBP · HEIC
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Action Panel */}
        <div className="col-span-12 md:col-span-6 flex flex-col gap-4">
          {/* Info card */}
          <div className="bento-card flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-black text-primary uppercase tracking-widest">What Gemini analyses</span>
            </div>
            <ul className="space-y-3">
              {[
                ['Food identification', 'Recognises any food from any cuisine'],
                ['Portion estimation', 'Estimates weight from visual cues'],
                ['Calorie calculation', 'Per-image, not a fixed lookup table'],
                ['Full macros', 'Protein, carbs, and fat breakdown'],
                ['Confidence score', 'How certain the AI is about its analysis'],
              ].map(([title, desc]) => (
                <li key={title} className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-on-surface">{title}</p>
                    <p className="text-xs text-on-surface-variant">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Scan button */}
          <motion.button
            onClick={scanFood}
            disabled={!file || loading}
            whileTap={{ scale: 0.97 }}
            className={`w-full h-16 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all
              ${file && !loading
                ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:opacity-90'
                : 'bg-surface-container-low text-on-surface-variant cursor-not-allowed'
              }
            `}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                {scanStepLabel}
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                {file ? 'Analyse with Gemini' : 'Select a food photo first'}
              </>
            )}
          </motion.button>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Result Card */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bento-card border-primary/20 bg-gradient-to-br from-primary/5 via-surface to-surface"
          >
            {/* Result header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-0.5">Identified Food</p>
                  <h2 className="font-outfit font-black text-2xl text-on-surface capitalize">
                    {result.food_name}
                  </h2>
                </div>
              </div>
              {result.confidence != null && (
                <div className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border
                  ${result.confidence >= 75
                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                    : result.confidence >= 50
                    ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}
                >
                  {result.confidence}% confident
                </div>
              )}
            </div>

            {/* Description */}
            {result.description && (
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10">
                {result.description}
              </p>
            )}

            {/* Macros grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { icon: Flame, label: 'Calories', value: result.calories, unit: 'kcal', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                { icon: Beef, label: 'Protein', value: result.protein, unit: 'g', color: 'text-primary', bg: 'bg-primary/10' },
                { icon: Wheat, label: 'Carbs', value: result.carbs, unit: 'g', color: 'text-secondary', bg: 'bg-secondary/10' },
                { icon: Droplets, label: 'Fats', value: result.fats, unit: 'g', color: 'text-tertiary', bg: 'bg-tertiary/10' },
              ].map(({ icon: Icon, label, value, unit, color, bg }) => (
                <motion.div
                  key={label}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`p-4 rounded-2xl ${bg} flex flex-col gap-2`}
                >
                  <div className={`w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">{label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-outfit font-black ${color}`}>{value}</span>
                    <span className="text-xs text-on-surface-variant/50 font-bold">{unit}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer meta */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-outline-variant/10">
              {result.weight > 0 && (
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <Scale className="w-4 h-4" />
                  <span className="font-medium">Estimated portion: <strong className="text-on-surface">{result.weight}g</strong></span>
                </div>
              )}
              {result.confidence_note && (
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <Brain className="w-4 h-4" />
                  <span className="font-medium">{result.confidence_note}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {logs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-outfit font-black text-3xl text-on-surface">Scan History</h2>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <Clock className="w-4 h-4" />
              <span>{logs.length} scan{logs.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {logs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="col-span-12 md:col-span-6 lg:col-span-4 bento-card overflow-hidden group"
              >
                {log.image && (
                  <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-surface-container-low">
                    <img
                      src={log.image}
                      alt={log.food_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <h3 className="font-outfit font-bold text-lg text-on-surface mb-4 capitalize">
                  {log.food_name}
                </h3>

                <div className="space-y-2">
                  {[
                    { label: 'Calories', value: `${log.calories} kcal`, color: 'text-orange-500' },
                    { label: 'Protein', value: `${log.protein}g`, color: 'text-primary' },
                    { label: 'Carbs', value: `${log.carbs}g`, color: 'text-secondary' },
                    { label: 'Fat', value: `${log.fats}g`, color: 'text-tertiary' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className="text-on-surface-variant">{label}</span>
                      <strong className={color}>{value}</strong>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}