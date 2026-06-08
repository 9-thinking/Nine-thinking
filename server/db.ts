import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    nickname TEXT,
    age INTEGER,
    height INTEGER,
    weight INTEGER,
    gender TEXT,
    activity_level TEXT,
    goal TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT, -- 'calories', 'steps', 'heart_rate', 'sleep'
    value REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS macros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    protein INTEGER,
    carbs INTEGER,
    fats INTEGER,
    date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    duration TEXT,
    intensity TEXT,
    calories TEXT,
    category TEXT,
    image TEXT,
    color TEXT
  );

  CREATE TABLE IF NOT EXISTS consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    specialty TEXT,
    location TEXT,
    image TEXT,
    status TEXT
  );

  CREATE TABLE IF NOT EXISTS calorie_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    food_name TEXT,
    calories REAL,
    protein REAL,
    carbs REAL,
    fats REAL,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER,
    name TEXT,
    duration_seconds INTEGER,
    rest_seconds INTEGER,
    sets INTEGER,
    met_value REAL, 
    image_url TEXT,
    FOREIGN KEY (workout_id) REFERENCES workouts(id)
  );
`);

// Add nickname & phone columns if they don't exist
try { db.prepare('ALTER TABLE users ADD COLUMN nickname TEXT').run(); } catch (e) {}
try { db.prepare('ALTER TABLE users ADD COLUMN phone TEXT').run(); } catch (e) {}

// ==========================================
// 创建测试用户 (包含体重 65kg，用于精准计算)
// ==========================================
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (email, password, name, weight, height, age, gender) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertUser.run('test@example.com', '123456', 'Patrick Client', 65, 175, 25, 'male');
}

// ==========================================
// 写入主运动列表 (Workouts) 对应 5 个分类
// ==========================================
const workoutCount = db.prepare('SELECT COUNT(*) as count FROM workouts').get() as { count: number };
if (workoutCount.count === 0) {
  const insertWorkout = db.prepare('INSERT INTO workouts (title, duration, intensity, calories, category, image, color) VALUES (?, ?, ?, ?, ?, ?, ?)');
  
  // ID 1: Yoga
  insertWorkout.run('Morning Yoga in Gardens', '20 min', 'Low', '150 kcal', 'Yoga', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600', 'bg-green-500');
  // ID 2: Cardio
  insertWorkout.run('KL Urban Run', '45 min', 'Medium', '450 kcal', 'Cardio', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=600', 'bg-blue-500');
  // ID 3: HIIT
  insertWorkout.run('Full Body HIIT', '30 min', 'High', '320 kcal', 'HIIT', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600', 'bg-red-500');
  // ID 4: Strength
  insertWorkout.run('Dumbbell Power Build', '45 min', 'High', '400 kcal', 'Strength', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=600', 'bg-orange-500');
  // ID 5: Mindset
  insertWorkout.run('Zen Mindset Focus', '15 min', 'Low', '50 kcal', 'Mindset', 'https://images.unsplash.com/photo-1528319725582-ddc096101511?auto=format&fit=crop&q=80&w=600', 'bg-purple-500');
}

// ==========================================
// 写入详细动作清单 (Exercises) 根据蓝图
// ==========================================
const exercisesCount = db.prepare('SELECT COUNT(*) as count FROM exercises').get() as { count: number };
if (exercisesCount.count === 0) {
  const insertExercise = db.prepare(`
    INSERT INTO exercises (workout_id, name, duration_seconds, rest_seconds, sets, met_value) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Workout ID 1: Yoga
  insertExercise.run(1, "Child's Pose", 60, 0, 1, 2.5);
  insertExercise.run(1, 'Downward Dog', 45, 15, 2, 3.0);
  insertExercise.run(1, 'Warrior II', 60, 15, 2, 3.0);
  insertExercise.run(1, 'Tree Pose', 45, 15, 2, 2.5);
  insertExercise.run(1, 'Savasana', 120, 0, 1, 1.0);

  // Workout ID 2: Cardio
  insertExercise.run(2, 'Brisk Walking', 300, 0, 1, 4.3);
  insertExercise.run(2, 'Steady State Jogging', 1200, 0, 1, 7.0);
  insertExercise.run(2, 'Sprint Intervals', 60, 60, 5, 10.0);
  insertExercise.run(2, 'Cool Down Walk', 300, 0, 1, 3.5);

  // Workout ID 3: HIIT
  insertExercise.run(3, 'Jumping Jacks', 45, 15, 3, 8.0);
  insertExercise.run(3, 'Burpees', 45, 15, 3, 10.0);
  insertExercise.run(3, 'Mountain Climbers', 45, 15, 3, 8.0);
  insertExercise.run(3, 'Squat Jumps', 45, 15, 3, 8.5);

  // Workout ID 4: Strength
  insertExercise.run(4, 'Dumbbell Goblet Squat', 60, 60, 4, 6.0);
  insertExercise.run(4, 'Dumbbell Bench Press', 60, 60, 4, 5.0);
  insertExercise.run(4, 'Bent-Over Rows', 60, 60, 4, 5.0);
  insertExercise.run(4, 'Overhead Press', 60, 60, 4, 5.0);

  // Workout ID 5: Mindset
  insertExercise.run(5, 'Box Breathing', 180, 0, 1, 1.0);
  insertExercise.run(5, 'Body Scan Meditation', 300, 0, 1, 1.0);
  insertExercise.run(5, 'Gratitude Reflection', 180, 0, 1, 1.2);
}

// Force re-seed of consultations (Doctor data)
db.exec('DELETE FROM consultations');
const insertConsultation = db.prepare('INSERT INTO consultations (name, specialty, location, image, status) VALUES (?, ?, ?, ?, ?)');
insertConsultation.run('Dr. Sarah Lim', 'Cardiology • Prince Court', 'Kuala Lumpur', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400&h=400&crop=faces', 'online');
insertConsultation.run('Dr. Azman Nasir', 'Nutritionist • Gleneagles KL', 'Kuala Lumpur', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400&crop=faces', 'offline');
insertConsultation.run('Dr. Hannah Yeoh', 'Pediatrician • Pantai Hospital', 'Kuala Lumpur', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400&h=400', 'online');

export default db;