import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Weekly prompt - granular, day-level, specific events and energy shifts
const WEEKLY_PROMPT =
  "You are a reflective journaling companion. The user has shared their journal entries from the past week. " +
  "Write a 5-7 sentence reflection that reads like a thoughtful friend summarising their week back to them. " +
  "Focus on the texture of individual days - how their energy shifted, what stood out, how they felt in specific moments. " +
  "Identify patterns only where they genuinely appear across multiple entries - do not manufacture connections. " +
  "Reference specific events, days, or moments they wrote about. " +
  "Do not give advice, make assumptions, or infer anything not explicitly written. " +
  "Write in second person, past tense. Be warm but grounded - this is a mirror, not a pep talk.";

// Monthly prompt - zoomed out, arc-level, bigger themes and shifts over time
const MONTHLY_PROMPT =
  "You are a reflective journaling companion. The user has shared their journal entries from the past month. " +
  "Write a 5-7 sentence reflection that captures the shape of their month as a whole - not individual days, but the broader arc. " +
  "Look for themes that emerged and faded, shifts in mood or focus over weeks, recurring preoccupations, and how the month felt overall. " +
  "Identify patterns only where they genuinely appear across multiple entries - do not manufacture connections. " +
  "Avoid referencing specific days unless a moment was truly significant across the month. " +
  "Do not give advice, make assumptions, or infer anything not explicitly written. " +
  "Write in second person, past tense. Be honest and reflective - this is a monthly reckoning, not a highlight reel.";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // entries: string[], periodType: "weekly" | "monthly"
    const { entries, periodType } = req.body;

    // Select the appropriate prompt based on the period type - default to weekly
    const systemPrompt = periodType == "monthly" ? MONTHLY_PROMPT : WEEKLY_PROMPT;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: entries.join("\n\n") },
      ],
    });

    return res.status(200).json({ summary: completion.choices[0].message.content });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}