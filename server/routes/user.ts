import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

router.put('/:id', (req, res) => {
  const { name, age, height, weight, gender, activity_level, goal } = req.body;
  db.prepare(`
    UPDATE users SET 
      name = ?, 
      age = ?, 
      height = ?, 
      weight = ?, 
      gender = ?, 
      activity_level = ?, 
      goal = ? 
    WHERE id = ?
  `).run(name, age, height, weight, gender, activity_level, goal, req.params.id);
  
  res.json({ success: true });
});

export default router;
