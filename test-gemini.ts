import { geminiGenerateText, extractJson } from "./src/lib/gemini";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  const prompt = `You are a professional technical blog writer.
Return ONLY valid JSON (no markdown fences, no extra text).
{
  "content": "markdown string",
  "summary": "2-3 sentence summary"
}`;
  const text = await geminiGenerateText(prompt);
  console.log("Raw output:\n", text);
  
  const result = extractJson(text, { fallback: true });
  console.log("Extracted:\n", result);
}
run();
