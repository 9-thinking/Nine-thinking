import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewState } from '../App';
import {
  TrendingUp,
  ArrowUpRight,
  Target,
  Trophy,
  Activity,
  Zap,
  Calendar,
  Download,
  Flame,
  Apple,
  ArrowDown,
  ArrowUp,
  Minus,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const weightData = [
  { month: 'Jan', weight: 82 },
  { month: 'Feb', weight: 80.5 },
  { month: 'Mar', weight: 79 },
  { month: 'Apr', weight: 78.2 },
  { month: 'May', weight: 77.5 },
  { month: 'Jun', weight: 76.8 },
];

const defaultActivityData = [
  { day: 'Mon', burnt: 0, intake: 0 },
  { day: 'Tue', burnt: 0, intake: 0 },
  { day: 'Wed', burnt: 0, intake: 0 },
  { day: 'Thu', burnt: 0, intake: 0 },
  { day: 'Fri', burnt: 0, intake: 0 },
  { day: 'Sat', burnt: 0, intake: 0 },
  { day: 'Sun', burnt: 0, intake: 0 },
];

interface ProgressViewProps {
  onNavigate: (view: ViewState) => void;
  user: any;
}

// ── BMI helpers ──────────────────────────────────────────────────────────────
function calcBMI(weight: number, height: number) {
  if (!weight || !height) return null;
  return +(weight / Math.pow(height / 100, 2)).toFixed(1);
}
function bmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500', bg: 'bg-blue-500/10' };
  if (bmi < 25)   return { label: 'Healthy', color: 'text-green-500', bg: 'bg-green-500/10' };
  if (bmi < 30)   return { label: 'Overweight', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
  return { label: 'Obese', color: 'text-red-500', bg: 'bg-red-500/10' };
}

// ── TDEE helpers ─────────────────────────────────────────────────────────────
function calcTDEE(user: any) {
  if (!user?.weight || !user?.height || !user?.age) return null;
  const w = Number(user.weight), h = Number(user.height), a = Number(user.age);
  const bmr = user.gender === 'female'
    ? 10 * w + 6.25 * h - 5 * a - 161
    : 10 * w + 6.25 * h - 5 * a + 5;
  const actMap: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
  };
  const factor = actMap[user.activity_level] || 1.55;
  return Math.round(bmr * factor);
}

// ── Macro targets ─────────────────────────────────────────────────────────────
function calcMacroTargets(tdee: number | null, goal: string) {
  if (!tdee) return { protein: 0, carbs: 0, fats: 0, calories: 0 };
  let calories = tdee;
  if (goal === 'lose_weight') calories = Math.round(tdee * 0.8);
  if (goal === 'gain_muscle') calories = Math.round(tdee * 1.1);
  const protein = Math.round((calories * 0.30) / 4);
  const carbs   = Math.round((calories * 0.45) / 4);
  const fats    = Math.round((calories * 0.25) / 9);
  return { protein, carbs, fats, calories };
}

export default function ProgressView({ onNavigate, user }: ProgressViewProps) {
  const [dailyKcalBurnt, setDailyKcalBurnt]   = useState(0);
  const [dailyKcalIntake, setDailyKcalIntake]  = useState(0);
  const [activityData, setActivityData]         = useState(defaultActivityData);
  const [macroToday, setMacroToday]             = useState({ protein: 0, carbs: 0, fats: 0 });
  const [showAnalysis, setShowAnalysis]         = useState(false);
  const [loading, setLoading]                   = useState(true);

  const userId   = user?.id || 1;
  const bmi      = calcBMI(Number(user?.weight), Number(user?.height));
  const bmiCat   = bmi ? bmiCategory(bmi) : null;
  const tdee     = calcTDEE(user);
  const targets  = calcMacroTargets(tdee, user?.goal || '');
  const netCalories = dailyKcalIntake - dailyKcalBurnt;

  // ── Fetch all data ──────────────────────────────────────────────────────────
  const fetchAll = async () => {
    try {
      // 1. Calories BURNT today (workouts)
      const statsRes = await fetch(`http://localhost:3001/api/workouts/daily-stats/${userId}?t=${Date.now()}`, { cache: 'no-store' });
      const stats = await statsRes.json();
      setDailyKcalBurnt(stats.totalCalories || 0);

      // 2. Calorie INTAKE today (food scanner logs)
      const logsRes = await fetch(`http://localhost:3001/api/calories/${userId}`, { cache: 'no-store' });
      const logs = await logsRes.json();
      const today = new Date().toISOString().split('T')[0];
      const todayLogs = Array.isArray(logs) ? logs.filter((l: any) => l.created_at?.startsWith(today)) : [];
      const intakeTotal = todayLogs.reduce((s: number, l: any) => s + (l.calories || 0), 0);
      setDailyKcalIntake(Math.round(intakeTotal));
      // Sum macros from today's food scans
      const p = todayLogs.reduce((s: number, l: any) => s + (l.protein || 0), 0);
      const c = todayLogs.reduce((s: number, l: any) => s + (l.carbs   || 0), 0);
      const f = todayLogs.reduce((s: number, l: any) => s + (l.fats    || 0), 0);
      setMacroToday({ protein: Math.round(p), carbs: Math.round(c), fats: Math.round(f) });

      // 3. Weekly chart (burnt + intake merged)
      const weeklyRes = await fetch(`http://localhost:3001/api/workouts/weekly-calories/${userId}?t=${Date.now()}`, { cache: 'no-store' });
      const weeklyBurnt = await weeklyRes.json();
      // Merge intake data (simplified: use today's intake for the current day bar)
      const merged = weeklyBurnt.length > 0 ? weeklyBurnt.map((d: any) => ({
        ...d,
        intake: d.day === new Date().toLocaleDateString('en-US', { weekday: 'short' }) ? Math.round(intakeTotal) : 0,
      })) : defaultActivityData;
      setActivityData(merged);
    } catch (e) {
      console.error('ProgressView fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchAll(); }, [user]);
  useEffect(() => {
    const interval = setInterval(() => { if (user) fetchAll(); }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // ── Export CSV ───────────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = ['Date', 'Calories Intake (kcal)', 'Calories Burnt (kcal)', 'Net Calories', 'Protein (g)', 'Carbs (g)', 'Fats (g)'];
    const today = new Date().toLocaleDateString();
    const row = [today, dailyKcalIntake, dailyKcalBurnt, netCalories, macroToday.protein, macroToday.carbs, macroToday.fats];
    const csv = [
      ['NINE THINKING - WELLNESS REPORT'],
      [`Patient: ${user?.name || 'User'}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [],
      headers,
      row,
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `NineThinking_Report_${user?.name || 'User'}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // ── Macro bar component ────────────────────────────────────────────────────
  const MacroBar = ({ label, value, target, color }: { label: string; value: number; target: number; color: string }) => {
    const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-on-surface-variant">{label}</span>
          <span className="text-on-surface">{value}g <span className="text-on-surface-variant/50">/ {target}g</span></span>
        </div>
        <div className="h-2.5 bg-surface-container-high rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${color}`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-gutter pb-32">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-margin-mobile md:px-0">
        <div>
          <h1 className="font-outfit font-black text-4xl md:text-5xl text-primary tracking-tighter mb-2">
            Trends & Progress
          </h1>
          <p className="text-on-surface-variant font-inter font-medium">
            Your real nutrition balance and body analysis.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="h-14 px-6 bg-surface-container-low border border-outline-variant/30 rounded-2xl flex items-center gap-3 font-bold hover:bg-surface-container-high transition-all">
            <Download className="w-5 h-5 text-on-surface-variant" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className={`h-14 px-6 rounded-2xl flex items-center gap-3 font-bold transition-all ${showAnalysis ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-container-low border border-outline-variant/30'}`}
          >
            <TrendingUp className="w-5 h-5" />
            {showAnalysis ? 'Close' : 'Full Analysis'}
          </button>
        </div>
      </header>

      {/* ── Full Analysis Panel ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showAnalysis && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-margin-mobile md:px-0 overflow-hidden"
          >
            <div className="bento-card border-2 border-primary/20 bg-primary/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-outfit font-black text-2xl text-primary tracking-tight">Body Analysis</h3>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Based on your profile</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-white rounded-2xl border border-outline-variant/10 space-y-1">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">BMI</p>
                  <p className="text-3xl font-outfit font-black text-on-surface">{bmi ?? '—'}</p>
                  {bmiCat && <span className={`text-xs font-black px-2 py-0.5 rounded-full ${bmiCat.color} ${bmiCat.bg}`}>{bmiCat.label}</span>}
                </div>
                <div className="p-5 bg-white rounded-2xl border border-outline-variant/10 space-y-1">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Est. Daily Burn (TDEE)</p>
                  <p className="text-3xl font-outfit font-black text-on-surface">{tdee ?? '—'} <span className="text-sm font-bold text-on-surface-variant">kcal</span></p>
                  <p className="text-xs text-on-surface-variant">Based on age, weight, height & activity</p>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-outline-variant/10 space-y-1">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Goal Target</p>
                  <p className="text-3xl font-outfit font-black text-on-surface">{targets.calories} <span className="text-sm font-bold text-on-surface-variant">kcal/day</span></p>
                  <p className="text-xs text-on-surface-variant capitalize">{(user?.goal || 'general wellness').replace(/_/g,' ')}</p>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Net Calorie Hero Card ────────────────────────────────────────── */}
      <section className="px-margin-mobile md:px-0">
        <div className="grid grid-cols-12 gap-gutter">

          {/* Net Balance Big Card */}
          <motion.div whileHover={{ y: -2 }} className={`col-span-12 lg:col-span-5 bento-card border-2 text-center flex flex-col items-center justify-center py-10 ${
            netCalories > 200 ? 'border-orange-400/30 bg-orange-500/5' :
            netCalories < -200 ? 'border-green-400/30 bg-green-500/5' :
            'border-primary/20 bg-primary/5'
          }`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 mb-3">Today's Calorie Balance</p>
            <div className="flex items-center gap-3 mb-2">
              {netCalories > 200 ? <ArrowUp className="w-8 h-8 text-orange-500" /> :
               netCalories < -200 ? <ArrowDown className="w-8 h-8 text-green-500" /> :
               <Minus className="w-8 h-8 text-primary" />}
              <span className={`text-6xl font-outfit font-black tracking-tighter ${
                netCalories > 200 ? 'text-orange-500' : netCalories < -200 ? 'text-green-500' : 'text-primary'
              }`}>{Math.abs(netCalories)}</span>
            </div>
            <p className="text-sm font-bold text-on-surface-variant mb-6">
              {netCalories > 200 ? 'kcal surplus (ate more than burnt)' :
               netCalories < -200 ? 'kcal deficit (burned more than ate)' :
               'kcal — balanced!'}
            </p>
            <div className="flex gap-6 w-full max-w-xs">
              <div className="flex-1 p-3 bg-white rounded-2xl border border-outline-variant/10 text-center">
                <Apple className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest">Intake</p>
                <p className="text-xl font-outfit font-black text-on-surface">{dailyKcalIntake}</p>
              </div>
              <div className="flex-1 p-3 bg-white rounded-2xl border border-outline-variant/10 text-center">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest">Burnt</p>
                <p className="text-xl font-outfit font-black text-on-surface">{dailyKcalBurnt}</p>
              </div>
            </div>
            <p className="text-[10px] text-on-surface-variant/40 mt-4 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Updates every 10 seconds
            </p>
          </motion.div>

          {/* Weekly Bar Chart */}
          <motion.div whileHover={{ y: -2 }} className="col-span-12 lg:col-span-7 bento-card">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-outfit font-black text-xl text-on-surface tracking-tight">Weekly Overview</h3>
                <p className="text-xs text-on-surface-variant font-medium">Calories burnt vs intake this week</p>
              </div>
              <div className="bg-tertiary text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1">
                <Zap className="w-3 h-3" /> Live
              </div>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} barGap={4}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(v: any, name: string) => [`${v} kcal`, name === 'burnt' ? 'Burnt' : 'Intake']}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: 12 }}
                  />
                  <Legend formatter={(v) => v === 'burnt' ? 'Calories Burnt' : 'Calories Intake'} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                  <Bar dataKey="burnt"  name="burnt"  fill="var(--color-tertiary)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="intake" name="intake" fill="var(--color-primary)"  radius={[6, 6, 0, 0]} opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Macro Overview + Weight Journey ─────────────────────────────── */}
      <section className="px-margin-mobile md:px-0">
        <div className="grid grid-cols-12 gap-gutter">

          {/* Macro Overview — body details */}
          <motion.div whileHover={{ y: -2 }} className="col-span-12 lg:col-span-6 bento-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-outfit font-black text-xl text-on-surface tracking-tight">Macro Overview</h3>
                <p className="text-xs text-on-surface-variant font-medium">Your body's nutritional status today</p>
              </div>
            </div>

            {/* Body stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Weight', value: user?.weight ? `${user.weight} kg` : '—', sub: 'Current' },
                { label: 'Height', value: user?.height ? `${user.height} cm` : '—', sub: 'Profile' },
                { label: 'BMI', value: bmi ?? '—', sub: bmiCat?.label ?? 'N/A', subColor: bmiCat?.color },
              ].map((s) => (
                <div key={s.label} className="p-3 bg-surface-container-low rounded-2xl text-center">
                  <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-xl font-outfit font-black text-on-surface">{s.value}</p>
                  <p className={`text-[10px] font-bold ${s.subColor || 'text-on-surface-variant/60'}`}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Macro bars vs targets */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest">Today vs Daily Target</p>
              <MacroBar label="Protein" value={macroToday.protein} target={targets.protein} color="bg-blue-500" />
              <MacroBar label="Carbohydrates" value={macroToday.carbs}   target={targets.carbs}   color="bg-amber-500" />
              <MacroBar label="Fats"    value={macroToday.fats}    target={targets.fats}    color="bg-pink-500" />
            </div>

            {/* Insight message */}
            <div className="mt-5 p-3 bg-primary/5 rounded-2xl border border-primary/10 text-xs text-on-surface-variant leading-relaxed">
              {!user?.weight || !user?.height
                ? '⚠️ Complete your profile (height & weight) for personalised macro targets.'
                : targets.protein > 0
                ? `💡 Your daily targets: ${targets.protein}g protein · ${targets.carbs}g carbs · ${targets.fats}g fats based on your ${(user?.goal || 'wellness').replace(/_/g,' ')} goal and ${tdee} kcal TDEE.`
                : '💡 Scan food items to start tracking your daily macro intake.'}
            </div>
          </motion.div>

          {/* Weight Journey */}
          <motion.div whileHover={{ y: -2 }} className="col-span-12 lg:col-span-6 bento-card">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-outfit font-black text-xl text-on-surface tracking-tight">Weight Journey</h3>
                  <p className="text-xs text-on-surface-variant font-medium">6-month trend</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-outfit font-black text-secondary">-5.2</span>
                <span className="text-xs font-bold text-secondary">kg</span>
              </div>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <Line type="monotone" dataKey="weight" stroke="var(--color-secondary)" strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--color-secondary)', strokeWidth: 2, stroke: 'white' }}
                    activeDot={{ r: 6, fill: 'var(--color-secondary)' }} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    formatter={(v: any) => [`${v} kg`, 'Weight']}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Wellness score mini */}
            <div className="mt-4 p-4 rounded-2xl bg-primary text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Wellness Index</p>
                <p className="text-3xl font-outfit font-black">84 <span className="text-sm opacity-60">/ 100</span></p>
                <p className="text-xs opacity-70 mt-0.5">Top 5% in your age group</p>
              </div>
              <div className="w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="white" strokeWidth="3"
                    strokeDasharray={2 * Math.PI * 15}
                    strokeDashoffset={2 * Math.PI * 15 * (1 - 0.84)}
                    strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Summary Stats (no sleep) ──────────────────────────────────── */}
      <section className="px-margin-mobile md:px-0">
        <div className="grid grid-cols-3 gap-gutter">
          <div className="bento-card bg-surface-container-low border-none text-center">
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Active Streak</p>
            <p className="text-3xl font-outfit font-black text-on-surface">14 Days</p>
          </div>
          <div className="bento-card bg-surface-container-low border-none text-center">
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Recovery Score</p>
            <p className="text-3xl font-outfit font-black text-on-surface">88/100</p>
          </div>
          <div className="bento-card bg-surface-container-low border-none text-center">
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Health Index</p>
            <p className="text-3xl font-outfit font-black text-on-surface">Tier A</p>
          </div>
        </div>
      </section>

      {/* ── Achievements ──────────────────────────────────────────────── */}
      <section className="px-margin-mobile md:px-0">
        <div className="bento-card py-10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-outfit font-black text-2xl text-on-surface tracking-tight">Recent Achievements</h3>
            <Calendar className="w-5 h-5 text-on-surface-variant/40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Flame, color: 'text-primary bg-primary/10', title: '7 Day Streak', desc: 'Completed daily goals for 7 consecutive days.' },
              { icon: Target, color: 'text-secondary bg-secondary/10', title: 'Macro Master', desc: 'Hit your protein, carb and fat targets on the same day.' },
              { icon: ArrowDown, color: 'text-green-500 bg-green-500/10', title: 'Calorie Deficit', desc: 'Maintained a healthy calorie deficit for 3 days straight.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-center gap-5 group cursor-pointer">
                <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">{title}</h4>
                  <p className="text-xs text-on-surface-variant">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}