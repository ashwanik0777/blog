const apiKey = process.env.GEMINI_API_KEY;
async function run() {
  const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"\;
  const prompt = "You are a professional technical blog writer.\nReturn ONLY valid JSON (no markdown fences, no extra text).\n{\n  \"content\": \"markdown string\",\n  \"summary\": \"2-3 sentence summary\"\n}";
  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  console.log("Raw output:\n", text);
  
  function extractJson(text, fallback) {
    if (!text) return fallback;
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return fallback;
    }
    const jsonSlice = text.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonSlice);
    } catch {
      return fallback;
    }
  }
  const result = extractJson(text, { fallback: true });
  console.log("Extracted:\n", result);
}
run();
