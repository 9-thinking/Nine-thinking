import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ViewState } from '../App';
import { api } from '../services/api';
import { 
  TrendingUp, 
  Flame, 
  Droplets,
  Plus,
  ArrowUpRight,
  Stethoscope,
  Calendar,
  MessageSquare,
  Beef,
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  Tooltip,
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (view: ViewState) => void;
  user: any;
}

export default function DashboardView({
  onNavigate,
  user,
}: DashboardViewProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCalories, setTotalCalories] = useState(0);
  const [dailyGoal] = useState(600);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, consultsData] = await Promise.all([
          api.metrics.get(user.id),
          fetch("http://localhost:3001/api/consultations").then((res) =>
            res.json(),
          ),
        ]);
        console.log("Dashboard Data:", { metricsData, consultsData });
        setMetrics(metricsData);
        setConsultations(consultsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-gutter pb-32"
    >
      {/* Welcome Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-margin-mobile md:px-0">
        <div>
          <h1 className="font-outfit font-black text-4xl md:text-5xl text-primary tracking-tighter mb-2">
            Hello, {user?.nickname || user?.name || "Adam"}.
          </h1>
          <p className="text-on-surface-variant font-inter font-medium">
            Your health journey is in full swing. Keep it up!
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate("providers")}
            className="h-14 px-6 bg-surface-container-low border border-outline-variant/30 rounded-2xl flex items-center gap-3 font-bold hover:bg-surface-container-high transition-all active:scale-95 group"
          >
            <Calendar className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Schedule Appointment</span>
          </button>
          <button
            onClick={() => onNavigate("vision-log")}
            className="h-14 w-14 md:w-auto md:px-6 bg-primary text-white rounded-2xl flex items-center justify-center gap-3 font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
          >
            <Plus className="w-6 h-6" />
            <span className="hidden md:inline">Log Entry</span>
          </button>
        </div>
      </header>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-12 gap-gutter px-margin-mobile md:px-0">

        {/* Core Vision Progress - Full Width Card */}
        <motion.div 
          onClick={() => onNavigate('progress')}
          variants={itemVariants}
          className="col-span-12 bento-card flex flex-col gap-8 overflow-hidden group cursor-pointer"
        >
          <div className="flex-1 flex flex-col justify-between py-2">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-outfit font-black text-2xl text-on-surface tracking-tight mb-1">
                    Weekly Vision Progress
                  </h3>
                  <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                    Kuala Lumpur • Wellness Index
                  </p>
                </div>
                <div className="bg-primary/10 px-3 py-1 rounded-full text-primary font-bold text-xs">
                  +12% this week
                </div>
              </div>

              {/* Calorie Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-on-surface">
                    Today's Calories Burned
                  </span>
                  <span className="text-primary">
                    {totalCalories} / {dailyGoal} kcal
                  </span>
                </div>
                <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(totalCalories / dailyGoal) * 100}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>

              <div className="h-[220px] -mx-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics?.calories || []}>
                    <defs>
                      <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-primary)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-primary)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                        backgroundColor:
                          "var(--color-surface-container-highest)",
                        fontFamily: "Inter",
                        fontWeight: "bold",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="calories"
                      stroke="var(--color-primary)"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorCal)"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 10,
                        fontWeight: 700,
                        fill: "var(--color-outline)",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-outline-variant/10">
              <div className="flex gap-8">
                <div>
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-1">
                    Calories Avg
                  </p>
                  <p className="text-xl font-outfit font-black text-on-surface">
                    2,050 kcal
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-1">
                    Peak Activity
                  </p>
                  <p className="text-xl font-outfit font-black text-on-surface">
                    Fri, 4 PM
                  </p>
                </div>
              </div>
              <button className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary hover:text-white transition-all group-hover:translate-x-1">
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Nutritional Tracker */}
        <motion.div
          variants={itemVariants}
          className="col-span-12 md:col-span-6 bento-card relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-10">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Beef className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs font-black text-primary uppercase tracking-widest">
              Macro Overview
            </span>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-3">
                <span className="text-on-surface">Protein</span>
                <span className="text-on-surface-variant">120g / 150g</span>
              </div>
              <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "80%" }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-3">
                <span className="text-on-surface">Carbs</span>
                <span className="text-on-surface-variant">210g / 250g</span>
              </div>
              <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "84%" }}
                  className="h-full bg-secondary"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-3">
                <span className="text-on-surface">Fats</span>
                <span className="text-on-surface-variant">45g / 70g</span>
              </div>
              <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "64%" }}
                  className="h-full bg-tertiary"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate("vision-log")}
            className="mt-12 w-full btn-secondary h-14 group"
          >
            AI Food Scan
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          </button>
        </motion.div>

        {/* Active Consultations */}
        <motion.div 
          variants={itemVariants}
          className="col-span-12 md:col-span-6 bento-card"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-outfit font-black text-xl text-on-surface tracking-tight">
              Active Consultations
            </h3>
            <button
              onClick={() => onNavigate("providers")}
              className="text-xs font-black text-primary uppercase tracking-widest hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {consultations.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                onClick={() => onNavigate("providers")}
                className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl flex items-center gap-4 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-outline-variant/10 bg-primary/5">
                  <img
                    src={
                      doc.image ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=random&color=fff`
                    }
                    alt={doc.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=random&color=fff`;
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors">
                    {doc.name}
                  </h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                    {doc.specialty}
                  </p>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${doc.status === "online" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-outline/20"}`}
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate("providers")}
            className="mt-8 w-full btn-primary h-14"
          >
            Find New Provider
          </button>
        </motion.div>

      </div>
    </motion.div>
  );
}
