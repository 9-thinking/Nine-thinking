import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
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
  Moon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip,
  BarChart,
  Bar
} from 'recharts';

// Data for weight tracking chart
const weightData = [
  { month: 'Jan', weight: 82 },
  { month: 'Feb', weight: 80.5 },
  { month: 'Mar', weight: 79 },
  { month: 'Apr', weight: 78.2 },
  { month: 'May', weight: 77.5 },
  { month: 'Jun', weight: 76.8 },
];

// Default empty chart data before database data loads
const defaultActivityData = [
  { day: 'Mon', active: 0 },
  { day: 'Tue', active: 0 },
  { day: 'Wed', active: 0 },
  { day: 'Thu', active: 0 },
  { day: 'Fri', active: 0 },
  { day: 'Sat', active: 0 },
  { day: 'Sun', active: 0 },
];

interface ProgressViewProps {
  onNavigate: (view: ViewState) => void;
  user: any;
}

export default function ProgressView({ onNavigate, user }: ProgressViewProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Store today's calorie burn from database
  const [dailyKcal, setDailyKcal] = useState(0);

  // Store weekly calorie data for the bar chart
  const [activityData, setActivityData] = useState(defaultActivityData);

  // Fetch latest metrics, today's calories, and weekly chart data
  const fetchMetrics = async () => {
    const userId = user?.id || 1;

    try {
      // Fetch existing mock metrics from API
      const data = await api.metrics.get(userId);
      setMetrics(data);
    } catch (e) {
      console.log('Mock API skipped');
    }

    try {
      // Fetch today's total calorie burn
      const dailyUrl =
        `http://localhost:3001/api/workouts/daily-stats/${userId}?t=${Date.now()}`;

      const statsRes = await fetch(dailyUrl, {
        cache: 'no-store'
      });

      const statsData = await statsRes.json();

      console.log(
        '🔥 Latest daily calorie burn:',
        statsData.totalCalories
      );

      setDailyKcal(
        statsData.totalCalories || 0
      );

    } catch (error) {
      console.error(
        'Failed to fetch daily calorie data:',
        error
      );
    }

    try {
      // Fetch weekly calorie data for the bar chart
      const weeklyUrl =
        `http://localhost:3001/api/workouts/weekly-calories/${userId}?t=${Date.now()}`;

      const weeklyRes = await fetch(weeklyUrl, {
        cache: 'no-store'
      });

      const weeklyData = await weeklyRes.json();

      console.log(
        '📊 Weekly calorie chart data:',
        weeklyData
      );

      setActivityData(
        weeklyData.length > 0 ? weeklyData : defaultActivityData
      );

    } catch (error) {
      console.error(
        'Failed to fetch weekly calorie chart:',
        error
      );

      setActivityData(defaultActivityData);
    } finally {
      setLoading(false);
    }
  };

  // Load progress data when page opens
  useEffect(() => {
    if (user) {
      fetchMetrics();
    }
  }, [user]);

  // Listen for workout completion events
  // and refresh calorie data automatically
  useEffect(() => {
    const handleWorkoutLogged = () => {
      console.log(
        'Workout completed. Refreshing progress page...'
      );

      fetchMetrics();
    };

    window.addEventListener(
      'workoutLogged',
      handleWorkoutLogged
    );

    return () => {
      window.removeEventListener(
        'workoutLogged',
        handleWorkoutLogged
      );
    };
  }, [user]);

  // Auto refresh progress data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        fetchMetrics();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  // Handle report export to CSV
  const handleExport = () => {
    const headers = [
      'Date', 
      'Week',
      'Calories (kcal)', 
      'Steps', 
      'Heart Rate (bpm)', 
      'Sleep Duration', 
      'Weight (kg)'
    ];
    
    const rows = Array.from({ length: 30 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      
      return [
        date.toLocaleDateString(),
        `Week ${Math.floor(i / 7) + 1}`,
        2000 + Math.floor(Math.random() * 500),
        8000 + Math.floor(Math.random() * 4000),
        65 + Math.floor(Math.random() * 15),
        `${7 + Math.floor(Math.random() * 2)}h ${Math.floor(Math.random() * 60)}m`,
        (77.5 - (i * 0.05)).toFixed(1)
      ];
    });

    const docHeader = [
      ['NINE THINKING - MONTHLY WELLNESS REPORT'],
      [`Patient Name: ${user?.name || 'Adam'}`],
      [`Health ID: NT-${user?.id || '8821'}`],
      ['Report Period: May 1, 2024 - May 30, 2024'],
      [`Generated On: ${new Date().toLocaleString()}`],
      [], 
      headers
    ];

    const csvContent = docHeader.map(r => r.join(',')).join('\n') + '\n' + 
      rows.map((r: any) => r.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Nine_Thinking_Monthly_Report_${user?.name || 'User'}_May_2024.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-gutter pb-32">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-margin-mobile md:px-0">
        <div>
          <h1 className="font-outfit font-black text-4xl md:text-5xl text-primary tracking-tighter mb-2">
            Trends & Progress
          </h1>
          <p className="text-on-surface-variant font-inter font-medium">
            Deep dive into your health metrics over time.
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="h-14 px-6 bg-surface-container-low border border-outline-variant/30 rounded-2xl flex items-center gap-3 font-bold hover:bg-surface-container-high transition-all group"
          >
            <Download className="w-5 h-5 text-on-surface-variant" />
            <span className="hidden sm:inline">Export Report</span>
          </button>

          <button 
            onClick={() => setShowAnalysis(!showAnalysis)}
            className={`h-14 px-6 rounded-2xl flex items-center gap-3 font-bold transition-all group ${
              showAnalysis
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-surface-container-low border border-outline-variant/30 text-on-surface'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>
              {showAnalysis ? 'Close Analysis' : 'Full Analysis'}
            </span>
          </button>
        </div>
      </header>

      {/* Analysis Expansion Section */}
      <AnimatePresence>
        {showAnalysis && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-margin-mobile md:px-0 overflow-hidden"
          >
            <div className="bento-card border-2 border-primary/20 bg-primary/5 mb-gutter">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="font-outfit font-black text-2xl text-primary tracking-tight">
                    Monthly Deep-Dive
                  </h3>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Comparison: May vs April 2024
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <h4 className="font-black text-xs uppercase tracking-widest text-primary">
                    Physical Evolution
                  </h4>

                  <div className="p-5 bg-white rounded-2xl border border-outline-variant/10">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">
                      Weight Loss
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-outfit font-black text-on-surface">
                        -1.8 kg
                      </span>
                      <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                        ↑ 4% Improved
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-black text-xs uppercase tracking-widest text-secondary">
                    Metabolic Status
                  </h4>

                  <div className="p-5 bg-white rounded-2xl border border-outline-variant/10">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">
                      Resting Heart Rate
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-outfit font-black text-on-surface">
                        64 bpm
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-black text-xs uppercase tracking-widest text-tertiary">
                    Performance Index
                  </h4>

                  <div className="p-5 bg-white rounded-2xl border border-outline-variant/10">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">
                      Consistency Rate
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-outfit font-black text-on-surface">
                        92%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="grid grid-cols-12 gap-gutter px-margin-mobile md:px-0">
        {/* Wellness Score Card */}
        <motion.div 
          className="col-span-12 lg:col-span-4 bento-card flex flex-col items-center justify-center py-12 bg-primary text-white border-none group"
        >
          <div className="relative mb-8">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle 
                cx="96"
                cy="96"
                r="88" 
                fill="transparent" 
                stroke="white" 
                strokeOpacity="0.1" 
                strokeWidth="12" 
              />

              <motion.circle 
                cx="96"
                cy="96"
                r="88" 
                fill="transparent" 
                stroke="white" 
                strokeWidth="12" 
                strokeDasharray={2 * Math.PI * 88}
                initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - 0.84) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-outfit font-black tracking-tighter">
                84
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
                Wellness Index
              </span>
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-outfit font-bold text-2xl mb-2">
              Feeling Prime
            </h3>
            <p className="text-sm text-white/60 leading-relaxed md:px-8">
              You're in the top 5% of users in your age group in Selangor.
            </p>
          </div>
        </motion.div>

        {/* Milestone Cards */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div className="bento-card relative overflow-hidden group">
            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-secondary" />
              </div>

              <ArrowUpRight className="w-5 h-5 text-on-surface-variant/40" />
            </div>

            <h4 className="font-outfit font-bold text-xl text-on-surface mb-2">
              Weight Journey
            </h4>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-outfit font-black text-on-surface">
                -5.2 KG
              </span>
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">
                Target Reached
              </span>
            </div>

            <div className="h-[140px] -mx-4 -mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="var(--color-secondary)" 
                    strokeWidth={4} 
                    dot={{
                      r: 4,
                      fill: 'var(--color-secondary)',
                      strokeWidth: 2,
                      stroke: 'white'
                    }}
                    activeDot={{
                      r: 6,
                      fill: 'var(--color-secondary)'
                    }}
                  />

                  <XAxis dataKey="month" hide />

                  <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />

                  <Tooltip 
                    formatter={(value: any) => [
                      `${value} kg`,
                      'Weight'
                    ]}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Real-time Calorie Burn Card */}
          <div className="bento-card relative overflow-hidden group border-2 border-transparent hover:border-tertiary/30 transition-colors">
            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-12 bg-tertiary/10 rounded-2xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-tertiary" />
              </div>

              <div className="bg-tertiary text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1 shadow-md shadow-tertiary/20">
                <Zap className="w-3 h-3" />
                Live Data
              </div>
            </div>

            <h4 className="font-outfit font-bold text-xl text-on-surface mb-2">
              Today's Real Burn
            </h4>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-outfit font-black text-tertiary">
                {dailyKcal} KCAL
              </span>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                Calculated
              </span>
            </div>

            <div className="h-[140px] -mx-4 -mb-4 opacity-50 grayscale mix-blend-multiply">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <Bar 
                    dataKey="active" 
                    name="Calories Burned"
                    fill="var(--color-tertiary)" 
                    radius={[6, 6, 0, 0]}
                  />

                  <XAxis dataKey="day" hide />

                  <Tooltip 
                    formatter={(value: any) => [
                      `${value} kcal`,
                      'Calories Burned'
                    ]}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="px-margin-mobile md:px-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          <div className="bento-card bg-surface-container-low border-none">
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">
              Avg Sleep
            </p>
            <p className="text-2xl font-outfit font-black text-on-surface">
              7h 48m
            </p>
          </div>

          <div className="bento-card bg-surface-container-low border-none">
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">
              Active Streak
            </p>
            <p className="text-2xl font-outfit font-black text-on-surface">
              14 Days
            </p>
          </div>

          <div className="bento-card bg-surface-container-low border-none">
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">
              Recovery Score
            </p>
            <p className="text-2xl font-outfit font-black text-on-surface">
              88/100
            </p>
          </div>

          <div className="bento-card bg-surface-container-low border-none">
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">
              Health Index
            </p>
            <p className="text-2xl font-outfit font-black text-on-surface">
              Tier A
            </p>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="px-margin-mobile md:px-0">
        <div className="bento-card py-10">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-outfit font-black text-2xl text-on-surface tracking-tight">
              Recent Achievements
            </h3>
            <Calendar className="w-5 h-5 text-on-surface-variant/40" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-6 group cursor-pointer">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Flame className="w-8 h-8 text-primary" />
              </div>

              <div>
                <h4 className="font-bold text-on-surface mb-1">
                  7 Day Streak
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Completed daily goals for 7 consecutive days.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 group cursor-pointer">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-secondary" />
              </div>

              <div>
                <h4 className="font-bold text-on-surface mb-1">
                  Marathon Ready
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Run a total of 42.2km within a single month.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 group cursor-pointer">
              <div className="w-16 h-16 bg-tertiary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Moon className="w-8 h-8 text-tertiary" />
              </div>

              <div>
                <h4 className="font-bold text-on-surface mb-1">
                  Night Owl Balance
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Maintain 7+ hours of sleep during high stress weeks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}