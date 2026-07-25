import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { audioBase64 } = req.body;
    const audioBuffer = Buffer.from(audioBase64, "base64");
    const audioBytes = new Uint8Array(audioBuffer);

    const file = new File([audioBytes], "entry.m4a", { type: "audio/m4a" });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "en",
    });

    return res.status(200).json({ text: transcription.text });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}