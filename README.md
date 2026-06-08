# Nine Thinking — AI Wellness Platform

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

> **A full-stack health & fitness dashboard** combining AI-powered food calorie scanning, personalized exercise calorie burn calculation, and professional wellness tracking — all in one React application.

---

## Features

| Feature | Description |
|---|---|
| 🤖 **AI Calorie Scanner** | Upload a meal photo and the FastAPI AI server classifies it using a trained MobileNetV2 model, returning estimated calories, protein, carbs, and fats |
| 🏋️ **Personalized Workout Tracker** | Browse 5 workout categories (Yoga, Cardio, HIIT, Strength, Mindset). Calorie burn is calculated in real-time using each exercise's MET value × your body weight (kg) |
| 📊 **Progress & Trends** | Weekly calorie burn chart, streaks, sleep quality, and recovery score pulled live from SQLite |
| 🩺 **Doctor Consultations** | Browse healthcare providers and launch in-app chat sessions |
| 🔐 **Auth & Onboarding** | Register, login, and complete a health onboarding flow that captures age, height, weight, goal, and activity level |
| 💬 **AI Chat** | Built-in chat powered by Google Gemini |

---

## Branch Contributions

This `complete-system` branch is a merge of:

| Branch | Contributor | What it adds |
|---|---|---|
| `feat/calorie-scanner-fixes` | KongJiaCheng | Trained `food_model.h5` (MobileNetV2, 10 Malaysian food classes), FastAPI AI server, fixed `/api/calories` endpoint, `CalorieScannerView.tsx`, image upload serving |
| `calorie-calculate-part` | Yew Wen Jun | MET-based calorie burn calculation via `exercises` table, workout logging to SQLite, weekly calorie chart in ProgressView, detailed workout backend routes |
| `syhjing/fixedeverything` | Patrick Tan | `WorkoutDetailView.tsx`, bug fixes across Dashboard, WorkoutLibrary, DashboardView charts, VisionLog, and comprehensive UI polish |

---

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, TailwindCSS v4, Recharts, Framer Motion  
**Backend:** Node.js, Express, better-sqlite3  
**AI Server:** Python, FastAPI, TensorFlow / Keras (MobileNetV2), Pillow  
**Database:** SQLite (auto-created on first run)

---

## Prerequisites

Before starting, ensure you have the following installed:

1. **Node.js** v18 or higher — [https://nodejs.org](https://nodejs.org)
2. **Python** v3.10 or higher — [https://python.org](https://python.org)
3. A **Gemini API Key** (for the AI chat feature) — [https://aistudio.google.com](https://aistudio.google.com)

---

## Step-by-Step Setup Guide

### Step 1 — Clone the Repository

```bash
git clone https://github.com/9-thinking/Nine-thinking.git
cd Nine-thinking
git checkout complete-system
```

---

### Step 2 — Configure Environment Variables

Copy the example env file and fill in your values:

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Open `.env` and set:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

### Step 3 — Install Node.js Dependencies

```bash
npm install
```

This installs all frontend and backend packages (React, Express, SQLite, Multer, etc.).

---

### Step 4 — Set Up the Python AI Environment

Navigate to the `ai` folder:

```bash
cd ai
```

Create and activate a Python virtual environment:

```bash
# Create virtual environment
python -m venv .venv

# Activate — Windows (Command Prompt)
.venv\Scripts\activate.bat

# Activate — Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Activate — macOS / Linux
source .venv/bin/activate
```

Install the required Python packages:

```bash
pip install fastapi uvicorn tensorflow pillow numpy
```

---

### Step 5 — Train the Food Classifier Model

The AI scanner uses a custom-trained MobileNetV2 model. You must train it once before running the AI server.

> Make sure you are inside the `ai` folder with your virtual environment **activated**.

```bash
python train.py
```

This will:
- Load the 10-class Malaysian food dataset from `ai/dataset/`
- Apply transfer learning on top of MobileNetV2
- Fine-tune the model with data augmentation
- Save the trained model as `ai/food_model.h5`

> Training takes approximately **5–15 minutes** depending on your machine. A GPU is not required.

**Supported food classes:**
`burger`, `chicken_rice`, `fried_rice`, `laksa`, `mee_goreng`, `nasi_lemak`, `pizza`, `roti_canai`, `salad`, `satay`

---

### Step 6 — Run the Complete Application

You need **3 separate terminal windows** running simultaneously.

#### Terminal 1 — AI FastAPI Server (Port 8000)

```bash
cd ai
# Activate your virtual environment first
.venv\Scripts\Activate.ps1     # Windows PowerShell
# or
source .venv/bin/activate      # macOS / Linux

python -m uvicorn main:app --port 8000
```

You should see: `Uvicorn running on http://0.0.0.0:8000`

#### Terminal 2 — Node.js Express Backend (Port 3001)

```bash
# From the project root directory
npm run server
```

You should see: `Server running on http://localhost:3001`

> The SQLite database (`database.sqlite`) is created automatically on first run with all tables and seed data.

#### Terminal 3 — Vite React Frontend (Port 3000)

```bash
# From the project root directory
npm run dev
```

You should see: `Local: http://localhost:3000`

---

### Step 7 — Open the App

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

- **Register** a new account or log in
- Complete the **onboarding** (enter your height, weight, age, and fitness goal)
- Navigate to **AI Calorie Scanner** to upload a meal photo
- Navigate to **Fitness** to browse workouts and log personalized calorie burns
- View your progress in **Trends**

---

## Project Structure

```
Nine-thinking/
├── ai/
│   ├── dataset/          # 10 food class image folders for training
│   ├── food_model.h5     # Trained MobileNetV2 model (generated after training)
│   ├── train.py          # Model training script
│   ├── model.py          # Prediction logic
│   ├── main.py           # FastAPI server entry point
│   └── nutrition_db.py   # Nutritional data per food class
├── server/
│   ├── db.ts             # SQLite schema initialization & seed data
│   ├── index.ts          # Express app entry point
│   └── routes/
│       ├── auth.ts       # Login / register / onboarding
│       ├── calories.ts   # AI food scan endpoint
│       ├── workouts.ts   # Workout listing, exercise details, calorie logging
│       ├── metrics.ts    # Health metrics
│       └── user.ts       # User profile
├── src/
│   ├── views/
│   │   ├── CalorieScannerView.tsx   # AI food scanner UI
│   │   ├── WorkoutLibraryView.tsx   # Workout browsing
│   │   ├── WorkoutDetailView.tsx    # Workout detail & completion
│   │   ├── ProgressView.tsx         # Weekly charts & achievements
│   │   ├── DashboardView.tsx        # Main health dashboard
│   │   └── ...
│   ├── App.tsx           # Main router
│   └── index.css         # Global styles & design tokens
├── uploads/              # Uploaded meal images (auto-created)
├── .env.example          # Example environment variables
└── package.json
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `food_model.h5 not found` | Run `python train.py` inside the `ai` folder to generate the model file |
| `Food scanning failed — AI server not running` | Make sure Terminal 1 (uvicorn) is running on port 8000 |
| `EADDRINUSE: address already in use :::3001` | Kill the process using port 3001: `npx kill-port 3001` |
| Port 3000 already in use | Vite auto-selects the next available port (e.g., 3001). Check terminal output for the actual URL |
| `Cannot find module 'better-sqlite3'` | Run `npm install` from the project root |
| Python packages missing | Activate your `.venv` and run `pip install fastapi uvicorn tensorflow pillow numpy` |
| DB not updating | Delete `database.sqlite` from the project root — it will be recreated automatically on next server start |
