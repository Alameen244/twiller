import 'dotenv/config';

const key = process.env.GEMINI_API_KEY;

// Tests primary and fallback translation
async function translateWithFallback(items, lang) {
  const models = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
  
  for (const model of models) {
    console.log(`Trying ${model}...`);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(25000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: `Translate the "text" of every item into ${lang}. Return a JSON array with one object { "id", "text" } per item, using the same ids.` }] },
          contents: [{ role: 'user', parts: [{ text: JSON.stringify(items) }] }],
          generationConfig: {
            temperature: 0,
            responseMimeType: 'application/json',
          },
        })
      });
      if (!res.ok) {
        console.warn(`${model} failed with ${res.status}`);
        continue;
      }
      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(raw);
      console.log(`Success with ${model}:`, parsed);
      return parsed;
    } catch (e) {
      console.warn(`${model} error: ${e.message}`);
    }
  }
  throw new Error('All models failed');
}

translateWithFallback([{ id: 'tweet1', text: 'Good morning everyone!' }], 'Spanish');
