import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Weekly prompt - granular, day-level, specific events and energy shifts
const WEEKLY_PROMPT =
  "You are a journaling assistant summarising a user's week from their journal entries. " +
  "Write 3-5 sentences describing what happened and what patterns emerged. " +
  "Use an impersonal narrative voice - no 'I' or 'you'. Describe events as plain statements of fact, like a neutral observer summarising the week. " +
  "Keep the tone conversational and direct, not formal. No metaphors, no filler phrases, no poetic language. " +
  "Focus on specific events, moments and energy shifts that actually appear in the entries. " +
  "Identify patterns only where they genuinely appear across multiple entries - do not manufacture connections. " +
  "Do not give advice, make assumptions, or infer anything not explicitly written. " +
  "Write in past tense.";

// Monthly prompt - zoomed out, arc-level, bigger themes and shifts over time  
const MONTHLY_PROMPT =
  "You are a journaling assistant summarising a user's month from their journal entries. " +
  "Write 4-6 sentences describing the shape of the month as a whole - not individual days, but the broader arc. " +
  "Use an impersonal narrative voice - no 'I' or 'you'. Describe themes and patterns as plain statements of fact, like a neutral observer summarising the month. " +
  "Keep the tone conversational and direct, not formal. No metaphors, no filler phrases, no poetic language. " +
  "Look for themes that emerged, shifts in mood or focus across weeks, and recurring preoccupations. " +
  "Identify patterns only where they genuinely appear across multiple entries - do not manufacture connections. " +
  "Avoid referencing specific days unless a moment was truly significant across the month. " +
  "Do not give advice, make assumptions, or infer anything not explicitly written. " +
  "Write in past tense.";

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