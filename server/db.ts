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

  CREATE TABLE IF NOT EXISTS vision_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    date TEXT,
    location TEXT,
    image TEXT,
    tags TEXT, -- JSON string
    sentiment TEXT,
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
`);

// Add nickname column if it doesn't exist
try {
  db.prepare('ALTER TABLE users ADD COLUMN nickname TEXT').run();
} catch (e) {
  // Column already exists
}

try {
  db.prepare('ALTER TABLE users ADD COLUMN phone TEXT').run();
} catch (e) {
  // Column already exists
}

// Seed initial data if empty
const workoutCount = db.prepare('SELECT COUNT(*) as count FROM workouts').get() as { count: number };
if (workoutCount.count === 0) {
  const insertWorkout = db.prepare('INSERT INTO workouts (title, duration, intensity, calories, category, image, color) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertWorkout.run('Morning Yoga in Gardens', '20 min', 'Low', '150 kcal', 'Flexibility', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHp4dcTZQaLpz7EVl7SmPCIh1Z5XlcWG30OxaYndrgeH1kO6koTtcwRTGu8pVAHqVh8X-vEBvG7imePrXeDRoxxk7QOHGd_y-bpetWqOvVCZjs12B-n-NswjfiO1LvhTUwgBRepkbryLDA2Z0YFUXpcznezBFUKKkJj3FB1kLPmp3J1IqfX1B5yxGu6-wz7XthnQ3yhzC6brgWzQuOZ8oY4PuEszK4hbgOnRPzeVjq7iu4osNihYb5zUlh9F63grqvQVRDAdnXdLw', 'bg-green-500');
  insertWorkout.run('KL Urban Run', '45 min', 'Medium', '450 kcal', 'Cardio', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDozO8ntMpK9pwd1M1M6G5GlADfsJ4ySzjgW5y2Sdq9kGw9iiVE9KMCioRVOm-lI6PksHN1yH9U2A9qASu3sCWOrcDSXnFtQIxszc2bQKt-nTuNMz0s_8eNRNrjmCbMJXm3nO22G6wXI19qcoE3-dYT0znoFrpOh7iFQpAFlZqYyB38Fi9HxjTVN01F14Ni9rYmXFE1B1gkicQjgagIMXlZJ8FeLV-_pZXosSS6nC50RQoWD5eG4YltAW5T942AV6Ijpty7cTcVSy4', 'bg-primary');
  insertWorkout.run('Full Body HIIT', '30 min', 'High', '320 kcal', 'HIIT', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDozO8ntMpK9pwd1M1M6G5GlADfsJ4ySzjgW5y2Sdq9kGw9iiVE9KMCioRVOm-lI6PksHN1yH9U2A9qASu3sCWOrcDSXnFtQIxszc2bQKt-nTuNMz0s_8eNRNrjmCbMJXm3nO22G6wXI19qcoE3-dYT0znoFrpOh7iFQpAFlZqYyB38Fi9HxjTVN01F14Ni9rYmXFE1B1gkicQjgagIMXlZJ8FeLV-_pZXosSS6nC50RQoWD5eG4YltAW5T942AV6Ijpty7cTcVSy4', 'bg-secondary');
  insertWorkout.run('Plyometric Explosives', '35 min', 'High', '520 kcal', 'Strength', 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=400', 'bg-orange-500');
  insertWorkout.run('Power Olympic Lifts', '50 min', 'High', '580 kcal', 'Strength', 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&q=80&w=400', 'bg-red-500');
  insertWorkout.run('Boxing Power Hour', '45 min', 'High', '650 kcal', 'Cardio', 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=400', 'bg-purple-500');
  insertWorkout.run('Explosive Sprint Training', '25 min', 'High', '480 kcal', 'Cardio', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=400', 'bg-yellow-500');
  insertWorkout.run('Kettlebell Power', '40 min', 'High', '540 kcal', 'Strength', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=400', 'bg-blue-500');
  }

// Force re-seed of consultations (one time for new images)
db.exec('DELETE FROM consultations');
const insertConsultation = db.prepare('INSERT INTO consultations (name, specialty, location, image, status) VALUES (?, ?, ?, ?, ?)');
// Dr. Sarah Lim - Professional Portrait
insertConsultation.run('Dr. Sarah Lim', 'Cardiology • Prince Court', 'Kuala Lumpur', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400&h=400&crop=faces', 'online');
// Dr. Azman Nasir
insertConsultation.run('Dr. Azman Nasir', 'Nutritionist • Gleneagles KL', 'Kuala Lumpur', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400&crop=faces', 'offline');
// Dr. Hannah Yeoh - Professional Portrait (Random medical)
insertConsultation.run('Dr. Hannah Yeoh', 'Pediatrician • Pantai Hospital', 'Kuala Lumpur', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400&h=400', 'online');


export default db;
