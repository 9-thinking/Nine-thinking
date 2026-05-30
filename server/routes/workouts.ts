import express from 'express';
import db from '../db.js';

const router = express.Router();

// Parse JSON bodies safely
router.use(express.json());

// Get all workouts
router.get('/', (req, res) => {
  const workouts = db.prepare('SELECT * FROM workouts').all();
  res.json(workouts);
});

// Get consultations
router.get('/consultations', (req, res) => {
  const consultations = db.prepare('SELECT * FROM consultations').all();
  res.json(consultations);
});

// Calculate workout details and personalized calorie burn
router.get('/:id/details', (req, res) => {
  const { id } = req.params;

  // Use the current logged-in user when calculating calories
  const userId = Number(req.query.userId) || 1;

  try {
    const user = db
      .prepare('SELECT weight FROM users WHERE id = ?')
      .get(userId) as any;

    const userWeight = Number(user?.weight) || 70;

    const workout = db
      .prepare('SELECT * FROM workouts WHERE id = ?')
      .get(id) as any;

    if (!workout) {
      return res.status(404).json({
        error: 'Workout not found'
      });
    }

    const exercises = db
      .prepare('SELECT * FROM exercises WHERE workout_id = ?')
      .all(id) as any[];

    let totalKcal = 0;

    // MET formula:
    // Calories burned = MET value × body weight in kg × duration in hours
    exercises.forEach((ex) => {
      const durationHours = Number(ex.duration_seconds) / 3600;
      const sets = Number(ex.sets) || 1;
      const metValue = Number(ex.met_value) || 1;

      const kcal = metValue * userWeight * durationHours * sets;

      totalKcal += kcal;
    });

    const roundedTotalKcal = Math.round(totalKcal);

    console.log(
      `[DEBUG] Personalized calories for User ${userId}, Workout ${id}: ${roundedTotalKcal} kcal using ${userWeight}kg`
    );

    res.json({
      ...workout,
      exercises,
      userId,
      userWeight,
      totalKcal: roundedTotalKcal
    });

  } catch (error) {
    console.error(
      '[ERROR] Failed to calculate workout details:',
      error
    );

    res.status(500).json({
      error: 'Failed to calculate workout details'
    });
  }
});

// Log Workout to SQLite
router.post('/log', (req, res) => {
  // Force numeric values before saving to SQLite
  const userId = Number(req.body.userId) || 1;
  const workoutId = Number(req.body.workoutId) || 0;
  const caloriesBurned = Number(req.body.caloriesBurned) || 0;

  console.log(
    `[DEBUG] Received log request: User ${userId}, Workout ${workoutId}, ${caloriesBurned} kcal`
  );

  try {
    // The timestamp column is automatically filled by SQLite
    const stmt = db.prepare(`
      INSERT INTO metrics (user_id, type, value)
      VALUES (?, ?, ?)
    `);

    const info = stmt.run(
      userId,
      'calories',
      caloriesBurned
    );

    console.log(
      `[DEBUG] Inserted successfully. ID:`,
      info.lastInsertRowid
    );

    res.json({
      success: true,
      message: 'Saved successfully!'
    });

  } catch (error) {
    console.error(
      '[ERROR] Failed to save workout log:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to log workout'
    });
  }
});

// Get Today's Calorie Burn
router.get('/daily-stats/:userId', (req, res) => {
  const userId = Number(req.params.userId) || 1;

  try {
    // Only calculate calories logged today
    // This value is used by Workout Library and Progress View
    const stats = db.prepare(`
      SELECT SUM(value) as total
      FROM metrics
      WHERE user_id = ?
      AND type = 'calories'
      AND DATE(timestamp, 'localtime') = DATE('now', 'localtime')
    `).get(userId) as { total: number };

    const total = Math.round(stats?.total || 0);

    console.log(
      `[DEBUG] User ${userId} calories burned today: ${total} kcal`
    );

    res.json({
      totalCalories: total
    });

  } catch (error) {
    console.error(
      '[ERROR] Failed to retrieve daily calorie stats:',
      error
    );

    res.status(500).json({
      totalCalories: 0
    });
  }
});

// Get Weekly Calorie Burn for Progress Chart
router.get('/weekly-calories/:userId', (req, res) => {
  const userId = Number(req.params.userId) || 1;

  try {
    // Group calorie logs by local date for the last 7 days
    const rows = db.prepare(`
      SELECT
        DATE(timestamp, 'localtime') as date,
        SUM(value) as total
      FROM metrics
      WHERE user_id = ?
      AND type = 'calories'
      AND DATE(timestamp, 'localtime') BETWEEN DATE('now', 'localtime', '-6 days') AND DATE('now', 'localtime')
      GROUP BY DATE(timestamp, 'localtime')
      ORDER BY DATE(timestamp, 'localtime') ASC
    `).all(userId) as Array<{
      date: string;
      total: number;
    }>;

    console.log(
      `[DEBUG] Raw weekly calorie rows for user ${userId}:`,
      rows
    );

    const result = [];

    // Build a fixed 7-day array so the chart always has 7 bars
    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setDate(date.getDate() - i);

      // Build local YYYY-MM-DD instead of using UTC toISOString()
      const dateKey =
        date.getFullYear() +
        '-' +
        String(date.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(date.getDate()).padStart(2, '0');

      const matchedRow = rows.find(
        (row) => row.date === dateKey
      );

      result.push({
        day: date.toLocaleDateString('en-US', {
          weekday: 'short'
        }),
        active: matchedRow ? Math.round(matchedRow.total) : 0
      });
    }

    console.log(
      `[DEBUG] Weekly calorie chart for user ${userId}:`,
      result
    );

    res.json(result);

  } catch (error) {
    console.error(
      '[ERROR] Failed to retrieve weekly calorie chart:',
      error
    );

    res.status(500).json([]);
  }
});

export default router;