import { GoogleGenAI } from '@google/genai';
import { BusinessIdea } from '../types';
import { strategistPrompt, engineerPrompt, marketerPrompt } from './prompts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL = 'gemini-2.5-flash';

async function runPrompt(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });
  const text = response.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

export async function runStrategist(idea: BusinessIdea): Promise<string> {
  return runPrompt(strategistPrompt(idea));
}

export async function runEngineer(idea: BusinessIdea, strategy: string): Promise<string> {
  const raw = await runPrompt(engineerPrompt(idea, strategy));
  return stripCodeFences(raw);
}

export async function runMarketer(idea: BusinessIdea, strategy: string): Promise<string> {
  return runPrompt(marketerPrompt(idea, strategy));
}

function stripCodeFences(s: string): string {
  const trimmed = s.trim();
  const fenceMatch = trimmed.match(/^```(?:html)?\n?([\s\S]*?)\n?```$/);
  if (fenceMatch) return fenceMatch[1].trim();
  return trimmed;
}
