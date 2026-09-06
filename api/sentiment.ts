import type { VercelRequest, VercelResponse } from "@vercel/node";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method != "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    const result = await hf.textClassification({
      model: "tabularisai/multilingual-sentiment-analysis",
      inputs: text.slice(0, 512),
    });

    const top = result[0];
    return res.status(200).json({
      label: top.label,
      confidence: top.score * 100,
    });
  }
  catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}