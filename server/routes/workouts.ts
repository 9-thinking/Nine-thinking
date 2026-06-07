import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const workouts = db.prepare('SELECT * FROM workouts').all();
  res.json(workouts);
});

router.get('/consultations', (req, res) => {
  const consultations = db.prepare('SELECT * FROM consultations').all();
  res.json(consultations);
});

export default router;
