import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { entries } = req.body; // array of entry texts

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content:
            "You are a journaling assistant helping someone understand their own week better. " +
            "Write a 5-7 sentence reflective summary identifying patterns and recurring themes " +
            "across the week - energy levels, productivity, social interactions, emotional highs and lows. " +
            "Only identify patterns visible across multiple entries. " +
            "Do not give advice or infer anything not explicitly written. " +
            "Be specific - reference actual days and events. " +
            "Write in second person, addressing the person directly. " +
            "Write in the past tense, as this is a weekly summary.",
        },
        { role: "user", content: entries.join("\n\n") },
      ],
    });

    return res.status(200).json({ summary: completion.choices[0].message.content });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}