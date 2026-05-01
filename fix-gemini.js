const fs = require('fs');

const geminiCode = `const GEMINI_ENDPOINTS = [
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
];

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

export function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }
  return apiKey;
}

export async function geminiGenerateText(prompt: string) {
  const apiKey = getGeminiApiKey();
  let lastError = "Gemini API error";

  for (const endpoint of GEMINI_ENDPOINTS) {
    const response = await fetch(\`\${endpoint}?key=\${apiKey}\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      console.error(\`Endpoint failed: \${endpoint}\`, bodyText || response.statusText);
      lastError = \`Gemini API error (\${response.status}): \${bodyText || response.statusText}\`;
      continue;
    }

    const data = (await response.json()) as GeminiResponse;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  throw new Error(lastError);
}

export function extractJson<T>(text: string, fallback: T): T {
  if (!text) return fallback;
  
  // Clean markdown fences if they exist
  text = text.replace(/^\s*\`\`\`(json)?\s*/g, '').replace(/\`\`\`\s*$/g, '');
  
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return fallback;
  }

  const jsonSlice = text.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(jsonSlice) as T;
  } catch {
    return fallback;
  }
}
`;

fs.writeFileSync('src/lib/gemini.ts', geminiCode);
