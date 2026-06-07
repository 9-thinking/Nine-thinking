import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/:userId', (req, res) => {
  const logs = db.prepare('SELECT * FROM vision_logs WHERE user_id = ? ORDER BY id DESC').all(req.params.userId);
  res.json(logs.map((log: any) => ({
    ...log,
    tags: JSON.parse(log.tags)
  })));
});

router.post('/', (req, res) => {
  const { userId, title, date, location, image, tags, sentiment } = req.body;
  db.prepare('INSERT INTO vision_logs (user_id, title, date, location, image, tags, sentiment) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(userId, title, date, location, image, JSON.stringify(tags), sentiment);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM vision_logs WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
