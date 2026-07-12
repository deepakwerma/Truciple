import OpenAI from "openai";
import { systemPrompt } from "../../systemPrompt";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, 
  baseURL: "https://api.groq.com/openai/v1",
  timeout: 15000,
});

export async function callOpenAI(prompt: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    max_tokens: 1000,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("OpenAI (via Groq) returned empty response");
  return text;
}