import Groq from "groq-sdk";
import { systemPrompt } from "../../systemPrompt";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function callGroq(prompt: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    model: "llama-3.3-70b-versatile",
    max_completion_tokens: 1000,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("Groq (Llama) returned empty response");
  return text;
}