import express from 'express';
import cors from 'cors';
import db from './db.js'; // Use .js extension for ES modules if needed, or ts-node/tsx will handle it

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import metricsRoutes from './routes/metrics.js';
import visionLogsRoutes from './routes/visionLogs.js';
import workoutRoutes from './routes/workouts.js';
import consultationRoutes from './routes/consultations.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/vision-logs', visionLogsRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/consultations', consultationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
