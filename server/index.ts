import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import calorieRoutes from './routes/calories.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import metricsRoutes from './routes/metrics.js';
import visionLogsRoutes from './routes/calories.js';
import workoutRoutes from './routes/workouts.js';
import consultationRoutes from './routes/consultations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve uploaded food images as static files at /uploads/<filename>
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/vision-logs', visionLogsRoutes);
app.use('/api/calories', calorieRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/consultations', consultationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
