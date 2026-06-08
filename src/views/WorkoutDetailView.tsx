import {
  ArrowLeft,
  Clock,
  Flame,
  Dumbbell,
  Timer,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { ViewState } from "../App";

interface WorkoutDetailViewProps {
  onNavigate: (view: ViewState) => void;
}

export default function WorkoutDetailView({
  onNavigate,
}: WorkoutDetailViewProps) {
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  // Get workout from localStorage
  const selectedWorkout = JSON.parse(
    localStorage.getItem("selected-workout") || "{}",
  );

  if (!selectedWorkout.title) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No workout selected</p>
        <button
          onClick={() => onNavigate("workouts")}
          className="ml-4 text-primary"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Extract calories number from string (e.g., "150 kcal" -> 150)
  const caloriesNumber = parseInt(selectedWorkout.calories) || 0;

  const handleFinishWorkout = () => {
    const caloriesBurned = caloriesNumber;
    setCaloriesBurned(caloriesBurned);
    setWorkoutCompleted(true);

    // Save to localStorage
    const today = new Date().toISOString().split("T")[0];
    const savedWorkouts = localStorage.getItem("completed-workouts");
    let completedWorkouts = savedWorkouts ? JSON.parse(savedWorkouts) : [];

    completedWorkouts.push({
      date: today,
      title: selectedWorkout.title,
      calories: caloriesBurned,
    });

    localStorage.setItem(
      "completed-workouts",
      JSON.stringify(completedWorkouts),
    );
  };

  const handleClose = () => {
    onNavigate("workouts");
  };

  if (workoutCompleted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-outfit font-black mb-2">
            Workout Complete! 🎉
          </h1>
          <p className="text-gray-600 mb-4">
            Great job finishing {selectedWorkout.title}
          </p>
          <div className="bg-orange-50 rounded-2xl p-6 mb-6">
            <p className="text-sm text-orange-600 font-bold mb-1">
              Calories Burned
            </p>
            <p className="text-5xl font-outfit font-black text-orange-500">
              {caloriesBurned} kcal
            </p>
          </div>
          <button
            onClick={handleClose}
            className="bg-primary text-white py-4 px-8 rounded-2xl font-bold"
          >
            Back to Workouts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Hero Image */}
      <div className="relative h-72 w-full">
        <img
          src={selectedWorkout.image}
          className="w-full h-full object-cover"
          alt="workout"
        />
        <button
          onClick={() => onNavigate("workouts")}
          className="absolute top-12 left-4 bg-black/50 p-3 rounded-full backdrop-blur-sm"
        >
          <ArrowLeft className="text-white w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 -mt-8 relative z-10">
        {/* Badge */}
        <div
          className={`w-16 h-16 rounded-2xl ${selectedWorkout.color} flex items-center justify-center shadow-xl border-4 border-white`}
        >
          <Dumbbell className="text-white w-8 h-8" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-outfit font-black mt-4">
          {selectedWorkout.title}
        </h1>

        {/* Stats */}
        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-bold">{selectedWorkout.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold">{selectedWorkout.calories}</span>
          </div>
          <div className="bg-primary/10 px-4 py-1 rounded-full">
            <span className="text-primary text-sm font-bold">
              {selectedWorkout.intensity}
            </span>
          </div>
        </div>

        {/* Exercises Section */}
        <div className="mt-8">
          <h2 className="font-outfit font-bold text-xl mb-4">Workout Plan</h2>
          <div className="space-y-3">
            {selectedWorkout.exercises?.map((exercise: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{exercise.name}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-4 h-4" /> {exercise.sets} sets
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="w-4 h-4" /> {exercise.reps}
                      </span>
                      {exercise.rest !== "0 sec" && (
                        <span>Rest: {exercise.rest}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start / Finish Workout Button */}
        <button
          onClick={handleFinishWorkout}
          className="w-full mt-10 bg-primary text-white py-5 rounded-2xl font-outfit font-bold text-lg shadow-lg shadow-primary/30"
        >
          Finish Workout
        </button>
      </div>
    </div>
  );
}
