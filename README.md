# Nine Thinking - AI Wellness Platform

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Step-by-Step Configuration and Setup Guide

Nine Thinking is a comprehensive wellness application featuring an AI Calorie Scanner, tracking metrics, mental wellness tools, and consultant bookings. Follow this guide to set up the project locally.

---

### Prerequisites
Before starting, ensure you have the following installed on your machine:
1. **Node.js** (v18 or higher)
2. **Python** (v3.10 or higher)

---

### 1. Configure the Frontend & Backend Servers

1. Install the Node.js packages:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory (you can copy `.env.example` as a template):
   ```bash
   copy .env.example .env
   ```
   Configure your environment variables inside `.env` (like `GEMINI_API_KEY` if using Gemini Vision fallback).

---

### 2. Configure the AI Food Calorie Scanner (Python)

1. Navigate to the `ai` directory:
   ```bash
   cd ai
   ```

2. Create a Python virtual environment:
   ```bash
   python -m venv .venv
   ```

3. Activate the virtual environment:
   * **Windows (Command Prompt):**
     ```cmd
     .venv\Scripts\activate.bat
     ```
   * **Windows (PowerShell):**
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux:**
     ```bash
     source .venv/bin/activate
     ```

4. Install the required Python packages:
   ```bash
   pip install fastapi uvicorn tensorflow pillow numpy ultralytics
   ```

---

### 3. Train the Food Classifier Model

Before running the AI server, you must train the model (`food_model.h5`) using the provided image dataset in `ai/dataset`:

1. While inside the `ai` folder and with your virtual environment activated, run:
   ```bash
   python train.py
   ```
2. This will run transfer learning and fine-tuning on top of **MobileNetV2**. Once complete, it saves the trained model as `food_model.h5`.

---

### 4. Running the Complete Application

To run the full stack, you need to start **3 separate services**:

#### Service A: FastAPI AI Server (Port 8000)
1. Open a terminal, navigate to the `ai` directory, and activate your Python virtual environment.
2. Start the FastAPI server:
   ```bash
   python -m uvicorn main:app --port 8000
   ```

#### Service B: Node.js Express Server (Port 3001)
1. Open a second terminal in the project root directory.
2. Start the Express server:
   ```bash
   npm run server
   ```

#### Service C: Vite React Frontend (Port 3000)
1. Open a third terminal in the project root directory.
2. Start the dev server:
   ```bash
   npm run dev
   ```

Open `http://localhost:3000` in your browser to access the app! You can now upload meal pictures under **AI Calorie Scanner** to dynamically identify meals and calculate nutritional contents.
