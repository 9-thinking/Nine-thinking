import express from 'express';
import db from '../db.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  
  if (user) {
    if (user.password === password) {
      res.json({ success: true, user });
    } else {
      res.json({ success: false, message: 'Invalid password' });
    }
  } else {
    res.json({ success: false, message: 'Account not found' });
  }
});

router.post('/register', (req, res) => {
  const { email, password, name, nickname, phone } = req.body;
  
  try {
    const info = db.prepare('INSERT INTO users (email, password, name, nickname, phone) VALUES (?, ?, ?, ?, ?)').run(email, password, name, nickname, phone);
    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success: true, user: newUser });
  } catch (error) {
    res.json({ success: false, message: 'Email already exists' });
  }
});

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (user) {
    res.json({ success: true, message: 'Password reset link sent to your email' });
  } else {
    res.json({ success: false, message: 'Account not found' });
  }
});

router.post('/onboarding', (req, res) => {
  const { userId, age, height, weight, gender, activity_level, goal } = req.body;
  
  db.prepare(`
    UPDATE users SET 
      age = ?, 
      height = ?, 
      weight = ?, 
      gender = ?, 
      activity_level = ?, 
      goal = ? 
    WHERE id = ?
  `).run(age, height, weight, gender, activity_level, goal, userId);
  
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  res.json({ success: true, user });
});

router.post('/reset-password', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (user) {
    db.prepare('UPDATE users SET password = ? WHERE email = ?').run(password, email);
    res.json({ success: true, message: 'Password updated successfully' });
  } else {
    res.json({ success: false, message: 'Account not found' });
  }
});

export default router;
