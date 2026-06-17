import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ViewState } from "../App";
import {
  ArrowLeft,
  Clock,
  Flame,
  Dumbbell,
  Timer,
  CheckCircle,
  Play,
  Pause,
  Square,
  Zap,
  RotateCcw,
} from "lucide-react";

interface WorkoutDetailViewProps {
  onNavigate: (view: ViewState) => void;
  user: any;
}

type SessionState = "idle" | "running" | "paused" | "done";

export default function WorkoutDetailView({ onNavigate, user }: WorkoutDetailViewProps) {
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);     // timestamp when last started/resumed
  const accumulatedRef = useRef<number>(0);   // seconds accumulated before current run

  // Body weight — from user profile, default 70 kg
  const bodyWeight: number = user?.weight ? Number(user.weight) : 70;

  // Selected workout stored by WorkoutLibraryView
  const selectedWorkout = JSON.parse(
    localStorage.getItem("selected-workout") || "{}"
  );

  const met: number = selectedWorkout.met || 4;

  // ─── Real-time calorie formula: MET × weight_kg × hours ──────────────
  const calcCalories = (seconds: number) =>
    Math.round((met * bodyWeight * seconds) / 3600);

  // ─── Timer tick ───────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionState === "running") {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const secondsSinceResume = (Date.now() - startTimeRef.current) / 1000;
        const total = accumulatedRef.current + secondsSinceResume;
        setElapsedSeconds(total);
        setCaloriesBurned(calcCalories(total));
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionState]);

  const handleStart = () => {
    if (sessionState === "idle") accumulatedRef.current = 0;
    setSessionState("running");
  };

  const handlePause = () => {
    accumulatedRef.current += (Date.now() - startTimeRef.current) / 1000;
    setSessionState("paused");
  };

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const finalCalories = calcCalories(elapsedSeconds);
    setCaloriesBurned(finalCalories);
    setSessionState("done");

    // Persist to localStorage
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem("completed-workouts");
    const all = saved ? JSON.parse(saved) : [];
    all.push({
      date: today,
      title: selectedWorkout.title,
      calories: finalCalories,
      duration: Math.floor(elapsedSeconds),
    });
    localStorage.setItem("completed-workouts", JSON.stringify(all));
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    accumulatedRef.current = 0;
    setElapsedSeconds(0);
    setCaloriesBurned(0);
    setCompletedExercises(new Set());
    setSessionState("idle");
  };

  // ─── Format helpers ───────────────────────────────────────────────────
  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const toggleExercise = (idx: number) => {
    setCompletedExercises((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  // ─── Guard ────────────────────────────────────────────────────────────
  if (!selectedWorkout.title) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-on-surface-variant">No workout selected.</p>
        <button onClick={() => onNavigate("workouts")} className="text-primary font-bold">
          ← Back to Fitness Center
        </button>
      </div>
    );
  }

  // ─── Completion Screen ────────────────────────────────────────────────
  if (sessionState === "done") {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = Math.floor(elapsedSeconds % 60);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-surface to-secondary/5"
      >
        <div className="max-w-md w-full text-center space-y-6">
          {/* Trophy */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            className="w-28 h-28 bg-green-500/10 border-4 border-green-500/20 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle className="w-14 h-14 text-green-500" />
          </motion.div>

          <div>
            <h1 className="font-outfit font-black text-4xl text-on-surface mb-2">Workout Done! 🎉</h1>
            <p className="text-on-surface-variant">{selectedWorkout.title}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bento-card text-center"
            >
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-1">Calories Burned</p>
              <p className="text-4xl font-outfit font-black text-orange-500">{caloriesBurned}</p>
              <p className="text-xs text-on-surface-variant/60 font-bold">kcal</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bento-card text-center"
            >
              <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-1">Total Time</p>
              <p className="text-4xl font-outfit font-black text-primary">{mins}</p>
              <p className="text-xs text-on-surface-variant/60 font-bold">min {secs}s</p>
            </motion.div>
          </div>

          {/* Intensity info */}
          <div className="bento-card text-sm text-on-surface-variant bg-surface-container-low/50">
            <div className="flex items-center justify-between">
              <span>MET Value</span>
              <strong className="text-on-surface">{met}</strong>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span>Body Weight Used</span>
              <strong className="text-on-surface">{bodyWeight} kg</strong>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span>Formula</span>
              <strong className="text-on-surface">{met} × {bodyWeight} × {(elapsedSeconds / 3600).toFixed(3)} h</strong>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 h-14 rounded-2xl bg-surface-container-low border border-outline-variant/20 font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all"
            >
              <RotateCcw className="w-5 h-5" /> Redo
            </button>
            <button
              onClick={() => onNavigate("workouts")}
              className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
            >
              Back to Fitness
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── Main Session Screen ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface pb-32 font-inter">
      {/* Hero Image */}
      <div className="relative h-64 w-full overflow-hidden">
        <img
          src={selectedWorkout.image}
          className="w-full h-full object-cover"
          alt={selectedWorkout.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
        <button
          onClick={() => onNavigate("workouts")}
          className="absolute top-12 left-4 bg-black/40 backdrop-blur-sm p-3 rounded-full hover:bg-black/60 transition-all"
        >
          <ArrowLeft className="text-white w-5 h-5" />
        </button>
        {/* Live badge */}
        {sessionState === "running" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-12 right-4 flex items-center gap-2 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest"
          >
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-white rounded-full"
            />
            Live
          </motion.div>
        )}
      </div>

      <div className="px-6 -mt-6 relative z-10 space-y-6">
        {/* Title & meta */}
        <div>
          <div className={`inline-block w-14 h-14 rounded-2xl ${selectedWorkout.color} flex items-center justify-center shadow-xl border-4 border-surface mb-3`}>
            <Dumbbell className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-outfit font-black text-on-surface">{selectedWorkout.title}</h1>
          <div className="flex flex-wrap gap-3 mt-2">
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">MET {met}</span>
            </div>
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <Dumbbell className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">{bodyWeight} kg body weight</span>
            </div>
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">{selectedWorkout.duration} suggested</span>
            </div>
          </div>
        </div>

        {/* ─── TIMER CARD ─── */}
        <motion.div
          layout
          className={`rounded-3xl p-6 text-center border-2 transition-all ${
            sessionState === "running"
              ? "bg-primary text-white border-primary shadow-2xl shadow-primary/30"
              : sessionState === "paused"
              ? "bg-yellow-500/10 border-yellow-500/30"
              : "bg-surface-container-low border-outline-variant/20"
          }`}
        >
          {/* Stopwatch */}
          <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${sessionState === "running" ? "text-white/60" : "text-on-surface-variant/50"}`}>
            {sessionState === "idle" ? "Ready to start" : sessionState === "paused" ? "Paused" : "Elapsed Time"}
          </p>
          <motion.p
            key={Math.floor(elapsedSeconds)}
            className={`text-7xl font-outfit font-black tracking-tighter mb-4 ${sessionState === "running" ? "text-white" : "text-on-surface"}`}
          >
            {fmt(elapsedSeconds)}
          </motion.p>

          {/* Live calorie counter */}
          <AnimatePresence>
            {sessionState !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-center gap-2 mb-6 ${sessionState === "running" ? "text-white/80" : "text-orange-500"}`}
              >
                <Flame className="w-5 h-5" />
                <span className="text-3xl font-outfit font-black">{caloriesBurned}</span>
                <span className="text-sm font-bold opacity-70">kcal burned</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Control Buttons */}
          <div className="flex gap-3 justify-center">
            {sessionState === "idle" && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="flex-1 h-14 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
              >
                <Play className="w-6 h-6 fill-white" /> Start Workout
              </motion.button>
            )}
            {sessionState === "running" && (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePause}
                  className="flex-1 h-14 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/30 transition-all border border-white/20"
                >
                  <Pause className="w-5 h-5 fill-white" /> Pause
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStop}
                  className="flex-1 h-14 bg-red-500/90 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500 transition-all"
                >
                  <Square className="w-5 h-5 fill-white" /> Stop & Save
                </motion.button>
              </>
            )}
            {sessionState === "paused" && (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStart}
                  className="flex-1 h-14 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                >
                  <Play className="w-5 h-5 fill-white" /> Resume
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStop}
                  className="flex-1 h-14 bg-red-500/90 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500 transition-all"
                >
                  <Square className="w-5 h-5 fill-white" /> Stop & Save
                </motion.button>
              </>
            )}
          </div>

          {/* Reset link */}
          {sessionState !== "idle" && (
            <button
              onClick={handleReset}
              className={`mt-4 text-xs font-bold flex items-center gap-1 mx-auto ${sessionState === "running" ? "text-white/50 hover:text-white/80" : "text-on-surface-variant/50 hover:text-on-surface-variant"} transition-colors`}
            >
              <RotateCcw className="w-3 h-3" /> Reset Timer
            </button>
          )}
        </motion.div>

        {/* Formula explanation */}
        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <Flame className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm text-on-surface-variant">
            <strong className="text-on-surface">Calorie Formula:</strong> MET ({met}) × Weight ({bodyWeight} kg) × Time (hours) — updates live every second
          </p>
        </div>

        {/* Exercise checklist */}
        <div>
          <h2 className="font-outfit font-bold text-2xl text-on-surface mb-4">Workout Plan</h2>
          <div className="space-y-3">
            {selectedWorkout.exercises?.map((exercise: any, index: number) => (
              <motion.div
                key={index}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleExercise(index)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  completedExercises.has(index)
                    ? "bg-primary/5 border-primary/20"
                    : "bg-surface-container-low border-outline-variant/10 hover:border-primary/20"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    completedExercises.has(index) ? "bg-primary border-primary" : "border-outline-variant/40"
                  }`}>
                    {completedExercises.has(index) && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-base transition-colors ${completedExercises.has(index) ? "text-primary line-through decoration-primary/40" : "text-on-surface"}`}>
                      {exercise.name}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-on-surface-variant/70 font-bold">
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3 h-3" /> {exercise.sets} sets
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="w-3 h-3" /> {exercise.reps}
                      </span>
                      {exercise.rest !== "0 sec" && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Rest: {exercise.rest}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {completedExercises.size === selectedWorkout.exercises?.length && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-500/10 rounded-2xl border border-green-500/20 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-sm font-bold text-green-600">All exercises checked! Press Stop & Save when done.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
