import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  
  const calories = db.prepare('SELECT day, calories FROM (SELECT strftime(\'%w\', timestamp) as day_num, CASE strftime(\'%w\', timestamp) WHEN \'0\' THEN \'Sun\' WHEN \'1\' THEN \'Mon\' WHEN \'2\' THEN \'Tue\' WHEN \'3\' THEN \'Wed\' WHEN \'4\' THEN \'Thu\' WHEN \'5\' THEN \'Fri\' WHEN \'6\' THEN \'Sat\' END as day, value as calories FROM metrics WHERE user_id = ? AND type = \'calories\' ORDER BY timestamp DESC LIMIT 7) ORDER BY day_num ASC').all(userId);
  
  const latestHeartRate = db.prepare('SELECT value FROM metrics WHERE user_id = ? AND type = \'heart_rate\' ORDER BY timestamp DESC LIMIT 1').get(userId) as any;
  const latestSteps = db.prepare('SELECT value FROM metrics WHERE user_id = ? AND type = \'steps\' ORDER BY timestamp DESC LIMIT 1').get(userId) as any;
  
  const macros = db.prepare('SELECT * FROM macros WHERE user_id = ? AND date = CURRENT_DATE').get(userId);
  
  const sleepData = db.prepare('SELECT strftime(\'%H %p\', timestamp) as time, value as quality FROM metrics WHERE user_id = ? AND type = \'sleep\' ORDER BY timestamp DESC LIMIT 6').all(userId);

  res.json({
    calories: calories.length > 0 ? calories : [
      { day: 'Mon', calories: 2100 },
      { day: 'Tue', calories: 1800 },
      { day: 'Wed', calories: 2300 },
      { day: 'Thu', calories: 1950 },
      { day: 'Fri', calories: 2400 },
      { day: 'Sat', calories: 2150 },
      { day: 'Sun', calories: 2000 },
    ],
    heartRate: latestHeartRate ? latestHeartRate.value : 72,
    steps: latestSteps ? latestSteps.value : 8432,
    macros: macros || { protein: 120, carbs: 210, fats: 45 },
    sleepData: sleepData.length > 0 ? sleepData : [
      { day: 'Mon', time: '10pm', quality: 85, duration: '8h 36m' },
      { day: 'Tue', time: '12am', quality: 40, duration: '6h 12m' },
      { day: 'Wed', day_full: 'Wednesday', quality: 90, duration: '7h 45m' },
      { day: 'Thu', day_full: 'Thursday', quality: 85, duration: '8h 15m' },
      { day: 'Fri', day_full: 'Friday', quality: 60, duration: '5h 30m' },
      { day: 'Sat', day_full: 'Saturday', quality: 75, duration: '9h 10m' },
      { day: 'Sun', day_full: 'Sunday', quality: 80, duration: '7h 42m' },
    ]
  });
});

router.post('/log', (req, res) => {
  const { userId, type, value } = req.body;
  db.prepare('INSERT INTO metrics (user_id, type, value) VALUES (?, ?, ?)').run(userId, type, value);
  res.json({ success: true });
});

router.post('/macros', (req, res) => {
  const { userId, protein, carbs, fats } = req.body;
  const existing = db.prepare('SELECT id FROM macros WHERE user_id = ? AND date = CURRENT_DATE').get(userId) as any;
  
  if (existing) {
    db.prepare('UPDATE macros SET protein = ?, carbs = ?, fats = ? WHERE id = ?').run(protein, carbs, fats, existing.id);
  } else {
    db.prepare('INSERT INTO macros (user_id, protein, carbs, fats) VALUES (?, ?, ?, ?)').run(userId, protein, carbs, fats);
  }
  res.json({ success: true });
});

export default router;
