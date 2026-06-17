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
  TrendingUp,
  Target,
  RefreshCw,
  PersonStanding,
  Wind,
} from "lucide-react";

// ─── MET values (calories = MET × weight_kg × hours) ──────────────────────
export const workouts = [
  {
    id: 1,
    title: "Walking",
    duration: "30 min",
    intensity: "Low",
    met: 3.5,
    category: "Cardio",
    color: "bg-teal-500",
    image:
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400",
    exercises: [
      { name: "Brisk Walk", sets: 1, reps: "30 min continuous", rest: "0 sec" },
      { name: "Cool Down Stroll", sets: 1, reps: "5 min easy", rest: "0 sec" },
    ],
  },
  {
    id: 2,
    title: "Jogging",
    duration: "30 min",
    intensity: "Medium",
    met: 7.0,
    category: "Cardio",
    color: "bg-orange-500",
    image:
      "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&q=80&w=400",
    exercises: [
      { name: "Warm-up Walk", sets: 1, reps: "5 min", rest: "0 sec" },
      { name: "Steady Jog", sets: 1, reps: "20 min at comfortable pace", rest: "0 sec" },
      { name: "Cool Down Walk", sets: 1, reps: "5 min", rest: "0 sec" },
    ],
  },
  {
    id: 3,
    title: "Morning Yoga in Gardens",
    duration: "20 min",
    intensity: "Low",
    met: 2.5,
    category: "Yoga",
    color: "bg-green-500",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400",
    exercises: [
      { name: "Sun Salutation", sets: 5, reps: "Hold 5 breaths", rest: "30 sec" },
      { name: "Downward Dog", sets: 3, reps: "Hold 1 min", rest: "20 sec" },
      { name: "Warrior II", sets: 3, reps: "Hold 45 sec each side", rest: "15 sec" },
      { name: "Tree Pose", sets: 2, reps: "Hold 30 sec each side", rest: "10 sec" },
    ],
  },
  {
    id: 4,
    title: "KL Urban Run",
    duration: "45 min",
    intensity: "High",
    met: 9.8,
    category: "Cardio",
    color: "bg-primary",
    image:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=400",
    exercises: [
      { name: "Warm-up Jog", sets: 1, reps: "5 min slow pace", rest: "0 sec" },
      { name: "Interval Sprints", sets: 8, reps: "30 sec sprint", rest: "30 sec walk" },
      { name: "Hill Repeats", sets: 6, reps: "20 sec uphill", rest: "40 sec down" },
      { name: "Cool Down", sets: 1, reps: "10 min easy jog", rest: "0 sec" },
    ],
  },
  {
    id: 5,
    title: "Full Body HIIT",
    duration: "30 min",
    intensity: "High",
    met: 8.0,
    category: "HIIT",
    color: "bg-secondary",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400",
    exercises: [
      { name: "Burpees", sets: 5, reps: "15 reps", rest: "20 sec" },
      { name: "Mountain Climbers", sets: 4, reps: "30 sec", rest: "15 sec" },
      { name: "Jump Squats", sets: 4, reps: "12 reps", rest: "20 sec" },
      { name: "Push-ups", sets: 4, reps: "10 reps", rest: "15 sec" },
      { name: "High Knees", sets: 4, reps: "30 sec", rest: "15 sec" },
    ],
  },
  {
    id: 6,
    title: "Dumbbell Power Build",
    duration: "45 min",
    intensity: "Medium",
    met: 5.0,
    category: "Strength",
    color: "bg-purple-500",
    image:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=400",
    exercises: [
      { name: "Dumbbell Squat", sets: 4, reps: "12 reps", rest: "60 sec" },
      { name: "Dumbbell Bench Press", sets: 4, reps: "10 reps", rest: "60 sec" },
      { name: "Dumbbell Row", sets: 3, reps: "12 reps each side", rest: "45 sec" },
      { name: "Dumbbell Shoulder Press", sets: 3, reps: "10 reps", rest: "60 sec" },
      { name: "Dumbbell Lunges", sets: 3, reps: "10 reps each leg", rest: "45 sec" },
      { name: "Dumbbell Curl + Press", sets: 3, reps: "12 reps", rest: "45 sec" },
    ],
  },
  {
    id: 7,
    title: "Zen Mindset Focus",
    duration: "20 min",
    intensity: "Low",
    met: 1.5,
    category: "Mindset",
    color: "bg-indigo-500",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400",
    exercises: [
      { name: "Box Breathing", sets: 5, reps: "4-4-4-4 count", rest: "30 sec" },
      { name: "Body Scan Meditation", sets: 1, reps: "10 min", rest: "0 sec" },
      { name: "Mindful Stretching", sets: 1, reps: "5 min", rest: "0 sec" },
      { name: "Gratitude Reflection", sets: 1, reps: "3 min", rest: "0 sec" },
    ],
  },
];

const categories = [
  { name: "All", icon: Target, tag: "All" },
  { name: "Cardio", icon: Heart, tag: "Burn" },
  { name: "HIIT", icon: Zap, tag: "Fast" },
  { name: "Strength", icon: Dumbbell, tag: "Build" },
  { name: "Yoga", icon: Leaf, tag: "Relax" },
  { name: "Mindset", icon: Brain, tag: "Focus" },
];

const intensityColor: Record<string, string> = {
  Low: "text-green-500 bg-green-500/10 border-green-500/20",
  Medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  High: "text-red-500 bg-red-500/10 border-red-500/20",
};

interface WorkoutLibraryViewProps {
  onNavigate: (view: ViewState) => void;
  user: any;
}

export default function WorkoutLibraryView({ onNavigate, user }: WorkoutLibraryViewProps) {
  const [activeTab, setActiveTab] = useState("All");
  const [totalCalories, setTotalCalories] = useState(0);
  const [dailyGoal] = useState(600);

  const bodyWeight = user?.weight || 70; // kg

  useEffect(() => {
    loadTodayCalories();
  }, []);

  const loadTodayCalories = () => {
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem("completed-workouts");
    if (saved) {
      const all = JSON.parse(saved);
      const total = all
        .filter((w: any) => w.date === today)
        .reduce((sum: number, w: any) => sum + w.calories, 0);
      setTotalCalories(Math.round(total));
    }
  };

  const handleReset = () => {
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem("completed-workouts");
    if (saved) {
      const filtered = JSON.parse(saved).filter((w: any) => w.date !== today);
      localStorage.setItem("completed-workouts", JSON.stringify(filtered));
      loadTodayCalories();
    }
  };

  const filtered =
    activeTab === "All"
      ? workouts
      : workouts.filter((w) => w.category === activeTab);

  // Estimated kcal for preview (use 30 min as reference)
  const estimatedKcal = (workout: typeof workouts[0]) =>
    Math.round(workout.met * bodyWeight * 0.5);

  return (
    <div className="space-y-gutter pb-32 font-inter">
      {/* Header */}
      <header className="px-margin-mobile md:px-0 flex justify-between items-end">
        <div>
          <h1 className="font-outfit font-black text-4xl md:text-5xl text-primary tracking-tighter mb-2">
            Fitness Center
          </h1>
          <p className="text-on-surface-variant font-medium">
            Real-time calorie tracking · MET-based accuracy
          </p>
        </div>
        <button
          onClick={() => onNavigate("progress")}
          className="hidden md:flex items-center gap-2 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10 hover:border-primary transition-all"
        >
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-on-surface">View My Progress</span>
        </button>
      </header>

      {/* Daily Goal Card */}
      <section className="px-margin-mobile md:px-0">
        <motion.div
          whileHover={{ y: -2 }}
          className="bento-card bg-surface-container-lowest border-2 border-primary/10 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-black text-xl text-on-surface tracking-tight">Daily Burn Goal</h3>
                    <p className="text-xs text-on-surface-variant/60 font-medium">Based on your body weight: {bodyWeight} kg</p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-on-surface-variant">Active Calories Burned Today</span>
                  <span className="text-xl font-black text-on-surface font-outfit">
                    {totalCalories} <span className="text-sm font-bold text-on-surface-variant">/ {dailyGoal} kcal</span>
                  </span>
                </div>
                <div className="h-4 bg-surface-container-high rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totalCalories / dailyGoal) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${totalCalories >= dailyGoal ? "bg-green-500" : "bg-primary"}`}
                  />
                </div>
                <p className="text-xs text-on-surface-variant/60">
                  {totalCalories >= dailyGoal
                    ? "🎉 Daily goal reached! Great work!"
                    : `${dailyGoal - totalCalories} kcal remaining`}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Category Tabs */}
      <section className="flex gap-3 overflow-x-auto pb-2 -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveTab(cat.name)}
            className={`flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-2xl border font-bold text-sm transition-all
              ${activeTab === cat.name
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-primary/40"
              }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.name}
          </button>
        ))}
      </section>

      {/* Workout Grid */}
      <section className="px-margin-mobile md:px-0">
        <div className="grid grid-cols-12 gap-gutter">
          {filtered.map((workout, idx) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="col-span-12 md:col-span-6 lg:col-span-4 bento-card p-0 overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-primary/5 transition-all"
              onClick={() => {
                localStorage.setItem("selected-workout", JSON.stringify(workout));
                onNavigate("workout-detail");
              }}
            >
              {/* Image */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={workout.image}
                  alt={workout.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 ${workout.color} text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                    {workout.category}
                  </span>
                </div>
                {/* Intensity badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-sm bg-white/90 ${intensityColor[workout.intensity]}`}>
                    {workout.intensity}
                  </span>
                </div>
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                    <Play className="w-7 h-7 fill-primary text-primary ml-1" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h4 className="font-outfit font-bold text-xl text-on-surface group-hover:text-primary transition-colors mb-3">
                  {workout.title}
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-on-surface-variant/70">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-bold">{workout.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-orange-500">
                      <Flame className="w-4 h-4" />
                      <span className="text-xs font-bold">~{estimatedKcal(workout)} kcal</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
