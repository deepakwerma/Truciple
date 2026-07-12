import { GoogleGenAI } from "@google/genai";
import { systemPrompt } from "../../systemPrompt";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function callGemini(prompt: string): Promise<string> {
  const result = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: 1000,
    },
  });

  const text = result.text;
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}
