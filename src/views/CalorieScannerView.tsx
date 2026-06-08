import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ViewState } from '../App';
import { api } from '../services/api';
import {
  Camera,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Sparkles
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

  const [result, setResult] = useState<any>(null);

  const [portion, setPortion] = useState(0);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await api.calories.getAll(user.id);
        setLogs(data);
      } catch (error) {
        console.error(error);
      }
    };

    if (user) {
      loadLogs();
    }
  }, [user]);

  const scanFood = async () => {
    if (!file) {
      alert('Please select an image first.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.calories.scan(
        user.id,
        file
      );

      if (!response.success) {
        alert(response.message || 'Food detection failed. Make sure the AI server is running on port 8000.');
        return;
      }

      // Server returns flat object: { food_name, calories, protein, carbs, fats, weight, confidence }
      setResult(response);

      if (response.weight) {
        setPortion(response.weight);
      }

      const updatedLogs = await api.calories.getAll(user.id);
      setLogs(updatedLogs);

      setFile(null);
    } catch (error: any) {
      console.error(error);
      alert('Failed to scan food. Make sure both the Node.js server (port 3001) and AI server (port 8000) are running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-32 font-inter">

      {/* Header */}
      <header>
        <h1 className="font-outfit font-black text-5xl text-primary tracking-tight">
          AI Calorie Scanner
        </h1>

        <p className="text-on-surface-variant mt-2">
          Upload food images and automatically estimate calories and nutrition.
        </p>
      </header>

      {/* Scanner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bento-card bg-primary text-white border-none"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4" />

          <span className="uppercase text-xs font-black tracking-widest">
            AI Powered
          </span>
        </div>

        <h2 className="font-outfit font-black text-3xl mb-6">
          Scan Your Meal
        </h2>

        <div className="space-y-4">

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (
                e.target.files &&
                e.target.files.length > 0
              ) {
                setFile(e.target.files[0]);
              }
            }}
            className="w-full h-14 rounded-2xl border border-white/20 bg-white/10 p-3"
          />

          <button
            onClick={scanFood}
            disabled={loading}
            className="h-14 px-8 bg-white text-primary rounded-full font-bold flex items-center gap-2"
          >
            <Camera className="w-5 h-5" />

            {loading
              ? 'Scanning...'
              : 'Scan Food'}
          </button>

        </div>
      </motion.div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{
            opacity: 0,
            y: 15
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="bento-card"
        >
          <h2 className="font-outfit font-black text-2xl mb-6">
            Detection Result
          </h2>

          <div className="mb-6">

            <p className="font-bold text-xl capitalize">
              {result.food_name?.replace(/_/g, ' ')}
            </p>

            {result.confidence && (
              <p className="text-sm text-on-surface-variant mt-1">
                Confidence: {result.confidence}%
              </p>
            )}

            <p className="text-on-surface-variant mt-2">
              Estimated Portion:
              {' '}
              {portion}
              g
            </p>

            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={portion}
              onChange={(e) =>
                setPortion(
                  Number(e.target.value)
                )
              }
              className="w-full mt-4"
            />

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="p-4 rounded-2xl bg-surface-container-low">
              <Flame className="mb-2" />
              <p className="font-bold">
                {result.calories}
                {' '}
                kcal
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low">
              <Beef className="mb-2" />
              <p className="font-bold">
                {result.protein}
                g
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low">
              <Wheat className="mb-2" />
              <p className="font-bold">
                {result.carbs}
                g
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low">
              <Droplets className="mb-2" />
              <p className="font-bold">
                {result.fats}
                g
              </p>
            </div>

          </div>
        </motion.div>
      )}

      {/* History */}
      <section>
        <h2 className="font-outfit font-black text-3xl mb-6">
          Calorie History
        </h2>

        <div className="grid grid-cols-12 gap-6">

          {logs.map((log) => (
            <motion.div
              key={log.id}
              whileHover={{ y: -5 }}
              className="col-span-12 md:col-span-6 lg:col-span-4 bento-card overflow-hidden"
            >
              <img
                src={log.image}
                alt={log.food_name}
                className="w-full h-48 object-cover rounded-2xl mb-4"
              />

              <h3 className="font-outfit font-bold text-xl mb-4">
                {log.food_name}
              </h3>

              <div className="space-y-2">

                <div className="flex justify-between">
                  <span>Calories</span>
                  <strong>
                    {log.calories}
                    {' '}
                    kcal
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>Protein</span>
                  <strong>
                    {log.protein}
                    g
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>Carbs</span>
                  <strong>
                    {log.carbs}
                    g
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>Fat</span>
                  <strong>
                    {log.fats}
                    g
                  </strong>
                </div>

              </div>
            </motion.div>
          ))}

        </div>
      </section>

    </div>
  );
}