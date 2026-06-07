import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ViewState } from "../App";
import { api } from "../services/api";
import {
  TrendingUp,
  Flame,
  Moon,
  Droplets,
  Plus,
  ArrowUpRight,
  Stethoscope,
  Calendar,
  MessageSquare,
  Beef,
  Activity,
  Heart,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";

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

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const savedWorkouts = localStorage.getItem("completed-workouts");
    if (savedWorkouts) {
      const workouts = JSON.parse(savedWorkouts);
      const todayWorkouts = workouts.filter((w: any) => w.date === today);
      const total = todayWorkouts.reduce(
        (sum: number, w: any) => sum + w.calories,
        0,
      );
      setTotalCalories(total);
    }
  }, []);

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
        {/* Core Vision Progress - Large Card */}
        <motion.div
          onClick={() => onNavigate("progress")}
          variants={itemVariants}
          className="col-span-12 lg:col-span-8 bento-card min-h-[400px] flex flex-col md:flex-row gap-8 overflow-hidden group cursor-pointer"
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

          {/* Quick Metrics Column */}
          <div className="w-full md:w-64 flex flex-col gap-4">
            <div className="flex-1 bg-secondary/5 rounded-3xl p-6 border border-secondary/10 flex flex-col justify-between group/metric hover:bg-secondary/10 transition-colors cursor-pointer">
              <Heart className="w-8 h-8 text-secondary group-hover/metric:scale-110 transition-transform" />
              <div>
                <p className="text-[10px] font-black text-secondary/60 uppercase tracking-[0.2em] mb-1">
                  Heart Rate
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-outfit font-black text-secondary">
                    {metrics?.heartRate || 72}
                  </span>
                  <span className="text-xs font-bold text-secondary/40">
                    bpm
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-tertiary/5 rounded-3xl p-6 border border-tertiary/10 flex flex-col justify-between group/metric hover:bg-tertiary/10 transition-colors cursor-pointer">
              <Activity className="w-8 h-8 text-tertiary group-hover/metric:scale-110 transition-transform" />
              <div>
                <p className="text-[10px] font-black text-tertiary/60 uppercase tracking-[0.2em] mb-1">
                  Step Count
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-outfit font-black text-tertiary">
                    {metrics?.steps || 8432}
                  </span>
                  <span className="text-xs font-bold text-tertiary/40">
                    steps
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Nutritional Tracker */}
        <motion.div
          variants={itemVariants}
          className="col-span-12 md:col-span-6 lg:col-span-4 bento-card relative overflow-hidden"
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

        {/* Specialists/Appointments */}
        <motion.div
          variants={itemVariants}
          className="col-span-12 md:col-span-6 lg:col-span-4 bento-card"
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

        {/* Sleep & Recovery Heatmap Placeholder */}
        <motion.div
          variants={itemVariants}
          className="col-span-12 md:col-span-12 lg:col-span-4 bento-card bg-on-surface border-none flex flex-col justify-between relative overflow-hidden group"
        >
          {/* Decorative Gradient Overlay */}
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-secondary/10 opacity-50 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                  <Moon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-outfit font-black text-white text-xl tracking-tight">
                    Sleep Quality
                  </h3>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                    Efficiency 94%
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                Optimal
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-10">
              <span className="text-6xl font-outfit font-black text-white tracking-tighter">
                7h 42m
              </span>
              <div className="flex items-center gap-1 text-green-400 font-bold text-xs">
                <ArrowUpRight className="w-3 h-3" />
                <span>15%</span>
              </div>
            </div>

            <div className="h-[140px] -mx-4 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.sleepData || []}>
                  <defs>
                    <linearGradient
                      id="sleepBarGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#fff" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#fff" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.1)", radius: 10 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-2xl shadow-xl border border-outline-variant/10 min-w-[120px]">
                            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">
                              {data.day || data.time || "Day"}
                            </p>
                            <p className="text-sm font-black text-primary">
                              {data.duration || `${data.quality}% Efficiency`}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="quality" radius={[6, 6, 0, 0]} barSize={20}>
                    {(metrics?.sleepData || []).map(
                      (entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.quality > 70
                              ? "url(#sleepBarGradient)"
                              : "rgba(255,255,255,0.05)"
                          }
                        />
                      ),
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="relative z-10 flex justify-between items-center bg-white/10 backdrop-blur-2xl p-5 rounded-[24px] border border-white/10 group-hover:bg-white/15 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Droplets className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">
                  Deep Sleep
                </p>
                <p className="text-sm font-bold text-white leading-none">
                  3h 15m (42%)
                </p>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white text-white hover:text-on-surface transition-all active:scale-90">
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
