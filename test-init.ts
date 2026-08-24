import { GoogleGenAI } from '@google/genai';
try {
  const ai = new GoogleGenAI({ apiKey: 'fake', httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
  console.log("Success");
} catch(e) {
  console.error("Error:", e.message);
}
