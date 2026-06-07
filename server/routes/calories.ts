import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import db from '../db.js';

const router = express.Router();

const upload = multer({
  dest: 'uploads/'
});

/*
|--------------------------------------------------------------------------
| AI Food Scan
|--------------------------------------------------------------------------
*/

router.post(
  '/scan',
  upload.single('image'),
  async (req, res) => {
    try {

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image uploaded'
        });
      }

      const form = new FormData();

      form.append(
        'file',
        fs.createReadStream(req.file.path),
        {
          filename: req.file.originalname || 'upload.jpg',
          contentType: req.file.mimetype || 'image/jpeg'
        }
      );

      const aiResponse = await axios.post(
        'http://localhost:8000/detect',
        form,
        {
          headers: form.getHeaders()
        }
      );

      const food = aiResponse.data;

      if (!food.success) {
        return res.status(400).json({
          success: false,
          message: food.message || 'Food detection failed'
        });
      }

      // Store image path relative to uploads dir (served as /uploads/<filename>)
      const imageUrl = `/uploads/${req.file.filename}`;

      db.prepare(`
        INSERT INTO calorie_logs
        (
          user_id,
          food_name,
          calories,
          protein,
          carbs,
          fats,
          image
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.body.userId,
        food.food_name,
        food.calories,
        food.protein,
        food.carbs,
        food.fats,
        imageUrl
      );

      // Return flat structure matching what the frontend expects
      res.json({
        success: true,
        food_name: food.food_name,
        confidence: food.confidence,
        weight: food.weight,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fats,
        image: imageUrl
      });

    } catch (error) {

      console.error('Food Scan Error:', error);

      res.status(500).json({
        success: false,
        message: 'Food scanning failed. Make sure the AI server is running on port 8000.'
      });

    }
  }
);

/*
|--------------------------------------------------------------------------
| Get Scan History
|--------------------------------------------------------------------------
*/

router.get('/:userId', (req, res) => {

  try {

    const logs = db.prepare(`
      SELECT *
      FROM calorie_logs
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(req.params.userId);

    // Prefix image paths with the server base URL for frontend rendering
    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    const logsWithFullUrls = logs.map((log: any) => ({
      ...log,
      image: log.image
        ? (log.image.startsWith('http') ? log.image : `${baseUrl}${log.image}`)
        : null
    }));

    res.json(logsWithFullUrls);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false
    });

  }

});

export default router;