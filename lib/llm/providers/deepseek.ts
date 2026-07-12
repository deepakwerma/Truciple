import "dotenv/config";
import OpenAI from 'openai';
import { systemPrompt } from '../../systemPrompt';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
  timeout: 15000,
});

export async function callDeepseek(prompt: string): Promise<string> {
  const completion = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    max_tokens: 1000,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error('Deepseek returned empty response');
  return text;
}