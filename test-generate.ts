import { GoogleGenAI, Type } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: 'fake' });
try {
  ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { text: 'hello' }
    ]
  });
  console.log("Success with array of parts directly");
} catch(e) {
  console.error("Error:", e.message);
}
