import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

// ── Gemini client ──────────────────────────────────────────────────────────
const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// ── System prompt builder – gives each doctor a distinct persona ───────────
function buildSystemPrompt(doctor: any, user: any): string {
  const userCtx = user
    ? `Patient profile: Name=${user.name || 'Patient'}, Age=${user.age || 'unknown'}, Weight=${user.weight || 'unknown'}kg, Height=${user.height || 'unknown'}cm, Goal=${user.goal || 'general wellness'}, Activity level=${user.activity_level || 'moderate'}.`
    : 'No patient profile available.';

  return `You are ${doctor.name}, a specialist in ${doctor.specialty} at ${doctor.location}.
You are conducting a live medical consultation via a secure health app called Nine Thinking.

${userCtx}

Guidelines:
- Respond warmly and professionally as ${doctor.name}.
- Keep responses concise (2–4 sentences) unless detail is specifically needed.
- Reference the patient's profile where relevant (age, weight, goal).
- Ask clarifying follow-up questions to better understand symptoms or concerns.
- Always end serious advice with "Please consult in-person for a full diagnosis."
- Never prescribe specific medications or claim to replace a real doctor.
- Use plain language, not heavy medical jargon.`;
}

// ── POST /api/chat/message ─────────────────────────────────────────────────
router.post('/message', async (req, res) => {
  const { doctor, user, messages } = req.body;

  if (!doctor) {
    return res.status(400).json({ success: false, message: 'Doctor info required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ success: false, message: 'GEMINI_API_KEY not configured' });
  }

  try {
    // Build conversation history for Gemini
    const contents = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const response = await genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: buildSystemPrompt(doctor, user),
        temperature: 0.75,
        maxOutputTokens: 400,
      },
    });

    const reply = response.text?.trim() || "I'm sorry, I couldn't process that. Could you rephrase?";

    res.json({ success: true, reply });
  } catch (error: any) {
    console.error('Chat AI error:', error?.message || error);
    res.status(500).json({
      success: false,
      message: 'AI response failed. Please try again.',
    });
  }
});

export default router;
