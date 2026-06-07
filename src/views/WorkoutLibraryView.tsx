import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ViewState } from "../App";
import {
  Play,
  Clock,
  Flame,
  Dumbbell,
  Heart,
  Zap,
  Leaf,
  Brain,
  ChevronRight,
  Plus,
  TrendingUp,
  Target,
  RefreshCw,
} from "lucide-react";

const workouts = [
  {
    id: 1,
    title: "Morning Yoga in Gardens",
    duration: "20 min",
    intensity: "Low",
    calories: "150 kcal",
    category: "Flexibility",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400",
    color: "bg-green-500",
    exercises: [
      {
        name: "Sun Salutation",
        sets: 5,
        reps: "Hold 5 breaths",
        rest: "30 sec",
      },
      { name: "Downward Dog", sets: 3, reps: "Hold 1 min", rest: "20 sec" },
      {
        name: "Warrior II",
        sets: 3,
        reps: "Hold 45 sec each side",
        rest: "15 sec",
      },
      {
        name: "Tree Pose",
        sets: 2,
        reps: "Hold 30 sec each side",
        rest: "10 sec",
      },
    ],
  },
  {
    id: 2,
    title: "KL Urban Run",
    duration: "45 min",
    intensity: "Medium",
    calories: "450 kcal",
    category: "Cardio",
    image:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=400",
    color: "bg-primary",
    exercises: [
      { name: "Warm-up Jog", sets: 1, reps: "5 min slow pace", rest: "0 sec" },
      {
        name: "Interval Sprints",
        sets: 8,
        reps: "30 sec sprint",
        rest: "30 sec walk",
      },
      {
        name: "Hill Repeats",
        sets: 6,
        reps: "20 sec uphill",
        rest: "40 sec down",
      },
      { name: "Cool Down", sets: 1, reps: "10 min easy jog", rest: "0 sec" },
    ],
  },
  {
    id: 3,
    title: "Full Body HIIT",
    duration: "30 min",
    intensity: "High",
    calories: "320 kcal",
    category: "HIIT",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400",
    color: "bg-secondary",
    exercises: [
      { name: "Burpees", sets: 5, reps: "15 reps", rest: "20 sec" },
      { name: "Mountain Climbers", sets: 4, reps: "30 sec", rest: "15 sec" },
      { name: "Jump Squats", sets: 4, reps: "12 reps", rest: "20 sec" },
      { name: "Push-ups", sets: 4, reps: "10 reps", rest: "15 sec" },
      { name: "High Knees", sets: 4, reps: "30 sec", rest: "15 sec" },
    ],
  },
];

const categories = [
  { name: "Strength", icon: Dumbbell, tag: "Build" },
  { name: "Cardio", icon: Heart, tag: "Burn" },
  { name: "HIIT", icon: Zap, tag: "Fast" },
  { name: "Yoga", icon: Leaf, tag: "Relax" },
  { name: "Mindset", icon: Brain, tag: "Focus" },
];

interface WorkoutLibraryViewProps {
  onNavigate: (view: ViewState) => void;
}

export default function WorkoutLibraryView({
  onNavigate,
}: WorkoutLibraryViewProps) {
  const [activeTab, setActiveTab] = useState("All");
  const [totalCalories, setTotalCalories] = useState(0);
  const [dailyGoal] = useState(600);
  const [streak, setStreak] = useState(5);
  const [consistency, setConsistency] = useState(85);

  // Load completed workouts from localStorage
  useEffect(() => {
    loadTodayCalories();
  }, []);

  const loadTodayCalories = () => {
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
    } else {
      setTotalCalories(0);
    }
  };

  const handleReset = () => {
    const today = new Date().toISOString().split("T")[0];
    const savedWorkouts = localStorage.getItem("completed-workouts");
    if (savedWorkouts) {
      const workouts = JSON.parse(savedWorkouts);
      // Remove only today's workouts
      const filteredWorkouts = workouts.filter((w: any) => w.date !== today);
      localStorage.setItem(
        "completed-workouts",
        JSON.stringify(filteredWorkouts),
      );
      loadTodayCalories();
    }
  };

  const handleStartWorkout = (title: string) => {
    alert(
      `Starting ${title}... \nGet ready! Your session begins in 5 seconds.`,
    );
  };

  const handleAddToPlan = (title: string) => {
    alert(`${title} has been added to your Weekly Fitness Plan.`);
  };

  return (
    <div className="space-y-gutter pb-32 font-inter">
      {/* Header */}
      <header className="px-margin-mobile md:px-0 flex justify-between items-end">
        <div>
          <h1 className="font-outfit font-black text-4xl md:text-5xl text-primary tracking-tighter mb-2">
            Fitness Center
          </h1>
          <p className="text-on-surface-variant font-medium">
            Professional routines tailored to your lifestyle.
          </p>
        </div>
        <button
          onClick={() => onNavigate("progress")}
          className="hidden md:flex items-center gap-2 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10 hover:border-primary transition-all"
        >
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-on-surface">
            View My Progress
          </span>
        </button>
      </header>

      {/* Daily Fitness Goal Card */}
      <section className="px-margin-mobile md:px-0">
        <div className="grid grid-cols-12 gap-6">
          <motion.div
            whileHover={{ y: -4 }}
            className="col-span-12 lg:col-span-8 bento-card bg-surface-container-lowest border-2 border-primary/10 relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-outfit font-black text-xl text-on-surface tracking-tight">
                      Daily Fitness Goal
                    </h3>
                  </div>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset Today
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-on-surface-variant">
                      Active Calories
                    </span>
                    <span className="text-lg font-black text-on-surface">
                      {totalCalories} / {dailyGoal} kcal
                    </span>
                  </div>
                  <div className="h-4 bg-surface-container-high rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(totalCalories / dailyGoal) * 100}%`,
                      }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              </div>
              <div className="w-full md:w-px h-px md:h-24 bg-outline-variant/20" />
              <div className="flex flex-row md:flex-col gap-6 shrink-0">
                <div>
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">
                    Consistency
                  </p>
                  <p className="text-2xl font-outfit font-black text-primary">
                    {consistency}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">
                    Streak
                  </p>
                  <p className="text-2xl font-outfit font-black text-secondary">
                    {streak} Days
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => handleStartWorkout("Personal Routine")}
            className="col-span-12 lg:col-span-4 bento-card bg-primary text-white border-none flex flex-col justify-between cursor-pointer group"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-outfit font-black text-2xl mb-1">
                Quick Start
              </h3>
              <p className="text-white/60 text-sm">
                Resume your custom 15-min cardio blast.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Slider */}
      <section className="flex gap-4 overflow-x-auto pb-4 -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0 no-scrollbar">
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(cat.name)}
            className={`flex-shrink-0 bento-card py-4 px-6 flex items-center gap-4 transition-all group ${activeTab === cat.name ? "border-primary bg-primary/5" : "hover:border-primary/30"}`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeTab === cat.name ? "bg-primary text-white" : "bg-surface-container-high group-hover:bg-primary/10"}`}
            >
              <cat.icon
                className={`w-5 h-5 ${activeTab === cat.name ? "text-white" : "text-on-surface-variant group-hover:text-primary"}`}
              />
            </div>
            <div>
              <p className="font-outfit font-bold text-lg text-on-surface leading-none mb-1">
                {cat.name}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
                {cat.tag}
              </p>
            </div>
          </button>
        ))}
      </section>

      {/* Featured Workout */}
      <section className="px-margin-mobile md:px-0">
        <motion.div className="bento-card overflow-hidden bg-on-surface text-white border-none min-h-[350px] flex flex-col md:flex-row relative group cursor-pointer">
          <div className="flex-1 p-8 md:p-12 z-10 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full mb-6 w-fit border border-white/10">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Masterclass
              </span>
            </div>
            <h2 className="font-outfit font-black text-4xl md:text-6xl mb-6 tracking-tighter leading-[1.1]">
              Elite Power <br /> Building
            </h2>
            <div className="flex gap-8 mb-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
                  Duration
                </p>
                <p className="font-outfit font-black text-2xl">55 MIN</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
                  Calories
                </p>
                <p className="font-outfit font-black text-2xl">620 KCAL</p>
              </div>
            </div>
            <button
              onClick={() => handleStartWorkout("Elite Power Building")}
              className="h-14 px-10 bg-primary text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:scale-105 active:scale-95 transition-all w-fit"
            >
              <Play className="w-5 h-5 fill-white" />
              Start Session
            </button>
          </div>

          <div className="md:w-1/2 relative h-64 md:h-auto">
            <img
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800"
              alt="Elite Workout"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-on-surface via-on-surface/40 to-transparent hidden md:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface via-on-surface/40 to-transparent md:hidden" />
          </div>
        </motion.div>
      </section>

      {/* Suggested Workouts Grid */}
      <section className="px-margin-mobile md:px-0">
        <div className="flex justify-between items-end mb-8">
          <h3 className="font-outfit font-black text-2xl text-on-surface tracking-tight">
            Suggested for You
          </h3>
          <button className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1 group">
            See All{" "}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-gutter">
          {workouts.map((workout, idx) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="col-span-12 md:col-span-6 lg:col-span-4 bento-card p-0 overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-primary/5 transition-all"
              onClick={() => {
                localStorage.setItem(
                  "selected-workout",
                  JSON.stringify(workout),
                );
                onNavigate("workout-detail");
              }}
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={workout.image}
                  alt={workout.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartWorkout(workout.title);
                  }}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="w-16 h-16 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                    <Play className="w-8 h-8 fill-primary" />
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-3 py-1 ${workout.color} text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg`}
                  >
                    {workout.category}
                  </span>
                </div>
              </div>

              <div className="p-6 bg-white">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-outfit font-bold text-xl text-on-surface leading-tight group-hover:text-primary transition-colors">
                    {workout.title}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToPlan(workout.title);
                    }}
                    className="p-2 bg-surface-container-low rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-on-surface-variant/60">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold">
                      {workout.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface-variant/60">
                    <Flame className="w-4 h-4" />
                    <span className="text-xs font-bold">
                      {workout.calories}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
