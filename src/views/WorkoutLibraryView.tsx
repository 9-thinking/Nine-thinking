import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewState } from '../App';
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
  LayoutGrid 
} from 'lucide-react';

const workouts = [
  {
    id: 1,
    title: 'Morning Yoga in Gardens',
    duration: '20 min',
    intensity: 'Low',
    calories: '150 kcal',
    category: 'Yoga',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600',
    color: 'bg-green-500'
  },
  {
    id: 2,
    title: 'KL Urban Run',
    duration: '45 min',
    intensity: 'Medium',
    calories: '450 kcal',
    category: 'Cardio',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=600',
    color: 'bg-blue-500'
  },
  {
    id: 3,
    title: 'Full Body HIIT',
    duration: '30 min',
    intensity: 'High',
    calories: '320 kcal',
    category: 'HIIT',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600',
    color: 'bg-red-500'
  },
  {
    id: 4, 
    title: 'Dumbbell Power Build',
    duration: '45 min',
    intensity: 'High',
    calories: '400 kcal',
    category: 'Strength',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=600',
    color: 'bg-orange-500'
  },
  {
    id: 5, 
    title: 'Zen Mindset Focus',
    duration: '15 min',
    intensity: 'Low',
    calories: '50 kcal',
    category: 'Mindset',
    image: 'https://images.unsplash.com/photo-1528319725582-ddc096101511?auto=format&fit=crop&q=80&w=600',
    color: 'bg-purple-500'
  }
];

const categories = [
  { name: 'All', icon: LayoutGrid, tag: 'Discover' },
  { name: 'Strength', icon: Dumbbell, tag: 'Build' },
  { name: 'Cardio', icon: Heart, tag: 'Burn' },
  { name: 'HIIT', icon: Zap, tag: 'Fast' },
  { name: 'Yoga', icon: Leaf, tag: 'Relax' },
  { name: 'Mindset', icon: Brain, tag: 'Focus' },
];

interface WorkoutLibraryViewProps {
  onNavigate: (view: ViewState) => void;
  user: any;
}

export default function WorkoutLibraryView({ onNavigate, user }: WorkoutLibraryViewProps) {
  const [activeTab, setActiveTab] = useState('All');
  const [dailyKcal, setDailyKcal] = useState(0);

  // Store personalized calories for each workout card
  const [personalizedCalories, setPersonalizedCalories] = useState<Record<number, number>>({});
  
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [showWorkoutDetails, setShowWorkoutDetails] = useState(false);

  // Fetch today's calorie burn from database
  const fetchDailyStats = async () => {
    try {
      const userId = user?.id || 1;

      // Add timestamp to prevent browser caching
      const url =
        `http://localhost:3001/api/workouts/daily-stats/${userId}?t=${Date.now()}`;

      const res = await fetch(url, {
        cache: 'no-store'
      });

      const data = await res.json();

      setDailyKcal(data.totalCalories || 0);

    } catch (err) {
      console.error('Failed to fetch daily stats:', err);
    }
  };

  // Fetch personalized calorie estimates for all workout cards
  const fetchPersonalizedCalories = async () => {
    try {
      const userId = user?.id || 1;
      const calorieMap: Record<number, number> = {};

      await Promise.all(
        workouts.map(async (workout) => {
          try {
            // The backend calculates calories using user weight, exercise duration, sets, and MET value
            const response = await fetch(
              `http://localhost:3001/api/workouts/${workout.id}/details?userId=${userId}&t=${Date.now()}`,
              {
                cache: 'no-store'
              }
            );

            const data = await response.json();

            if (!data.error && data.totalKcal !== undefined) {
              calorieMap[workout.id] = Math.round(data.totalKcal);
            } else {
              calorieMap[workout.id] = parseInt(workout.calories) || 0;
            }

          } catch (error) {
            console.error(
              `Failed to fetch personalized calories for workout ${workout.id}:`,
              error
            );

            calorieMap[workout.id] = parseInt(workout.calories) || 0;
          }
        })
      );

      setPersonalizedCalories(calorieMap);

    } catch (error) {
      console.error('Failed to fetch personalized workout calories:', error);
    }
  };

  // Load calorie data when the page opens
  useEffect(() => {
    fetchDailyStats();
    fetchPersonalizedCalories();
  }, [user]);

  // Keep daily calories updated while staying on this page
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDailyStats();
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const getWorkoutCalories = (workout: any) => {
    const personalizedValue = personalizedCalories[workout.id];

    if (personalizedValue !== undefined) {
      return personalizedValue;
    }

    return parseInt(workout.calories) || 0;
  };

  const handleStartWorkout = async (idOrTitle: string | number) => {
    if (typeof idOrTitle === 'number') {
      try {
        const userId = user?.id || 1;

        const response = await fetch(
          `http://localhost:3001/api/workouts/${idOrTitle}/details?userId=${userId}&t=${Date.now()}`,
          {
            cache: 'no-store'
          }
        );

        const data = await response.json();
        
        if (data.error) {
          alert('Workout data not found in SQLite yet. Add it in db.ts!');
          return;
        }

        const matchedWorkout = workouts.find(
          (workout) => workout.id === Number(idOrTitle)
        );

        // Attach image and personalized calorie data to the selected workout
        setSelectedWorkout({
          ...data,
          image: matchedWorkout?.image || data.image,
          personalizedKcal: Math.round(data.totalKcal || 0)
        });

        setShowWorkoutDetails(true); 

      } catch (error) {
        console.error('API Error:', error);
        alert('Make sure server (3001) is running!');
      }

    } else {
      alert(`Starting ${idOrTitle}...`);
    }
  };

  const handleFinishWorkout = async () => {
    if (!selectedWorkout) return;

    try {
      const userId = user?.id || 1;

      // Use personalized calories calculated by backend
      // This keeps workout logging consistent with the user's body profile
      const finalCalories = selectedWorkout.totalKcal
        ? Math.round(selectedWorkout.totalKcal)
        : selectedWorkout.personalizedKcal
          ? Math.round(selectedWorkout.personalizedKcal)
          : 0;

      console.log(
        '[DEBUG] Personalized calories saved to database:',
        finalCalories
      );

      const response = await fetch(
        'http://localhost:3001/api/workouts/log',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userId,
            workoutId: selectedWorkout.id,
            caloriesBurned: finalCalories
          })
        }
      );

      const result = await response.json();
      
      if (result.success) {
        // Notify Progress View to refresh its calorie data
        window.dispatchEvent(
          new CustomEvent('workoutLogged')
        );

        alert(
          `Great job! ${finalCalories} personalized kcal added to your daily progress.`
        );

      } else {
        alert('Server failed to save data! Check terminal.');
      }

      setShowWorkoutDetails(false);

      // Refresh local calorie display immediately
      fetchDailyStats();
      fetchPersonalizedCalories();

    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const filteredWorkouts = activeTab === 'All' 
    ? workouts 
    : workouts.filter(w => w.category === activeTab);

  const masterclassCalories = personalizedCalories[3] ?? 0;

  return (
    <div className="space-y-gutter pb-32 font-inter relative">
      
      {/* Workout Details Overlay */}
      <AnimatePresence>
        {showWorkoutDetails && selectedWorkout && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center md:items-center"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md h-full md:h-[85vh] md:rounded-3xl overflow-hidden shadow-2xl flex flex-col relative"
            >
              <div className="relative h-64 shrink-0">
                <img
                  src={
                    workouts.find(w => w.id === selectedWorkout.id)?.image ||
                    selectedWorkout.image
                  }
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                <div className="absolute top-6 left-4 right-4 flex justify-between items-center text-white">
                  <button
                    onClick={() => setShowWorkoutDetails(false)}
                    className="p-2 bg-black/20 rounded-full backdrop-blur-md"
                  >
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </button>

                  <div className="flex gap-4">
                    <Target className="w-6 h-6" />
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 text-white">
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-1 bg-white text-black text-[10px] font-black">
                      {selectedWorkout.duration.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 bg-white text-black text-[10px] font-black">
                      HOME
                    </span>
                  </div>

                  <h2 className="text-3xl font-outfit font-black">
                    {selectedWorkout.title}
                  </h2>

                  <p className="text-white/80 text-sm">
                    {selectedWorkout.category} • {selectedWorkout.intensity} Intensity
                  </p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-white p-6 pb-72 md:pb-36">
                <div className="border border-outline-variant/20 rounded-2xl p-4 mb-6 shadow-sm">
                  <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3 mb-3">
                    <span className="text-on-surface-variant font-medium flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Difficulty
                    </span>

                    <span className="font-bold">
                      {selectedWorkout.intensity}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3 mb-3">
                    <span className="text-on-surface-variant font-medium flex items-center gap-2">
                      <Flame className="w-4 h-4" />
                      Personalized Burn
                    </span>

                    <span className="font-bold text-tertiary">
                      {Math.round(selectedWorkout.totalKcal || selectedWorkout.personalizedKcal || 0)} kcal
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant font-medium flex items-center gap-2">
                      <Flame className="w-4 h-4" />
                      Warm-up
                    </span>

                    <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
                      Included
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-4">
                  <h3 className="font-black text-on-surface text-lg">
                    ROUND 1
                    <span className="text-on-surface-variant font-normal text-sm">
                      {' '}• {selectedWorkout.exercises?.[0]?.sets || 3} sets
                    </span>
                  </h3>
                </div>

                <div className="space-y-6">
                  {selectedWorkout.exercises?.map((ex: any, i: number) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-surface-container-high overflow-hidden shrink-0">
                        {ex.image_url ? (
                          <img
                            src={ex.image_url}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                            <Play className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="font-bold text-on-surface text-base">
                          {ex.name}
                        </p>

                        <p className="text-sm text-on-surface-variant">
                          {ex.duration_seconds} seconds • rest {ex.rest_seconds} seconds
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute left-0 right-0 bottom-24 md:bottom-0 bg-white/95 backdrop-blur-md p-4 border-t border-outline-variant/10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] md:rounded-none rounded-t-3xl">
                <button 
                  onClick={handleFinishWorkout}
                  className="w-full bg-red-600 text-white h-14 rounded-xl font-bold tracking-wider shadow-lg shadow-red-600/30 hover:bg-red-700 active:scale-95 transition-all"
                >
                  MARK AS DONE & LOG
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          onClick={() => onNavigate('progress')}
          className="hidden md:flex items-center gap-2 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10 hover:border-primary transition-all"
        >
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-on-surface">
            View My Progress
          </span>
        </button>
      </header>

      <section className="px-margin-mobile md:px-0">
        <div className="grid grid-cols-12 gap-6">
          <motion.div 
            whileHover={{ y: -4 }}
            className="col-span-12 lg:col-span-8 bento-card bg-surface-container-lowest border-2 border-primary/10 relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>

                  <h3 className="font-outfit font-black text-xl text-on-surface tracking-tight">
                    Daily Fitness Goal
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-on-surface-variant">
                      Active Calories
                    </span>

                    <span className="text-lg font-black text-on-surface">
                      {dailyKcal} / 600 kcal
                    </span>
                  </div>

                  <div className="h-4 bg-surface-container-high rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((dailyKcal / 600) * 100, 100)}%`
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
                    Personalized
                  </p>
                  <p className="text-2xl font-outfit font-black text-primary">
                    MET
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">
                    Streak
                  </p>
                  <p className="text-2xl font-outfit font-black text-secondary">
                    5 Days
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            onClick={() => alert('Quick start feature coming soon!')}
            className="col-span-12 lg:col-span-4 bento-card bg-primary text-white border-none flex flex-col justify-between cursor-pointer group"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>

            <div>
              <h3 className="font-outfit font-black text-2xl mb-1">
                Quick Start
              </h3>
              <p className="text-white/60 text-sm">
                Resume your personalized 15-min cardio blast.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="flex gap-4 overflow-x-auto pb-4 -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0 no-scrollbar">
        {categories.map((cat, i) => (
          <button 
            key={i} 
            onClick={() => setActiveTab(cat.name)} 
            className={`flex-shrink-0 bento-card py-4 px-6 flex items-center gap-4 transition-all group ${
              activeTab === cat.name
                ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                : 'hover:border-primary/30'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                activeTab === cat.name
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-high group-hover:bg-primary/10'
              }`}
            >
              <cat.icon
                className={`w-5 h-5 ${
                  activeTab === cat.name
                    ? 'text-white'
                    : 'text-on-surface-variant group-hover:text-primary'
                }`}
              />
            </div>

            <div className="text-left">
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
              Elite Power <br />Building
            </h2>

            <div className="flex gap-8 mb-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
                  Duration
                </p>
                <p className="font-outfit font-black text-2xl">
                  30 MIN
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
                  Personalized Burn
                </p>
                <p className="font-outfit font-black text-2xl">
                  {masterclassCalories > 0 ? `${masterclassCalories} KCAL` : '...'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => handleStartWorkout(3)}
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

      {/* Filtered Workouts Grid */}
      <section className="px-margin-mobile md:px-0">
        <div className="flex justify-between items-end mb-8">
          <h3 className="font-outfit font-black text-2xl text-on-surface tracking-tight">
            {activeTab === 'All' ? 'Suggested for You' : `${activeTab} Workouts`}
          </h3>

          <button className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1 group">
            See All
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <motion.div layout className="grid grid-cols-12 gap-gutter">
          <AnimatePresence>
            {filteredWorkouts.map((workout) => {
              const kcal = getWorkoutCalories(workout);

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={`${workout.id}-${workout.title}`}
                  onClick={() => handleStartWorkout(workout.id)}
                  className="col-span-12 md:col-span-6 lg:col-span-4 bento-card p-0 overflow-hidden group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src={workout.image}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-all duration-300">
                      <div className="w-16 h-16 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-8 h-8 fill-primary ml-1" />
                      </div>
                    </div>

                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 ${workout.color} text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md`}
                      >
                        {workout.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 bg-white">
                    <div className="mb-4">
                      <h4 className="font-outfit font-bold text-xl text-on-surface leading-tight group-hover:text-primary transition-colors">
                        {workout.title}
                      </h4>
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
                          {kcal > 0 ? `${kcal} kcal` : 'Personalized'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/30 mt-3">
                      Based on your profile
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </section>
    </div>
  );
}