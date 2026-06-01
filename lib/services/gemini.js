import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/lib/config/env.js';

let genAI = null;

function getClient() {
  if (!env.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not set. Add it to .env.local');
  }
  genAI ??= new GoogleGenerativeAI(env.geminiApiKey);
  return genAI;
}

export async function generateAnswer(prompt) {
  const model = getClient().getGenerativeModel({ model: env.geminiModel });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
