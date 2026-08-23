import { GoogleGenAI, Type } from '@google/genai';

let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
  }
  return genAIClient;
}

export async function analyzeLandslide(imageBase64: string, mimeType: string, locationContext: string, zoneName: string, state: string) {
  const ai = getGenAI();
  if (!ai) {
    return { success: false, aiLive: false, error: 'GEMINI_API_KEY_NOT_CONFIGURED', message: 'Gemini API key is not configured.' };
  }

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const prompt = `You are a Senior Geotechnical Engineer and Disaster Response Specialist for the Pan-India Landslide Intelligence Platform.
Analyze this field photo taken at ${zoneName ? `${zoneName}, ${state}` : 'a landslide hazard zone in India'}.
Context: ${locationContext || 'Mountainous terrain field observation'}.

Examine the image carefully for:
1. Is there actually a landslide or hazard visible? (Return NO_VISIBLE_HAZARD if it's just a road, forest, normal mountain, building, sky, etc.)
2. If there is a hazard, what is the type (e.g., Debris Flow, Rockfall, Rotational Slide, Planar Slide, Mudflow, Tension Cracks, Toe Subsidence)?
3. Failure characteristics.
4. Estimated severity (NONE, LOW, MODERATE, HIGH, CRITICAL).
5. Immediate risk to downstream settlements, roads, or rivers.
6. Actionable recommendations.

Respond strictly in JSON matching the following schema. If the image doesn't show evidence of a hazard, hazardIdentified should be "NO_VISIBLE_HAZARD", severity should be "NONE" or "LOW", and you should explain why in negativeEvidence.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: cleanBase64, mimeType: mimeType || 'image/jpeg' } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hazardIdentified: { type: Type.STRING, description: 'Specific geological hazard type identified or NO_VISIBLE_HAZARD' },
            severity: { type: Type.STRING, description: 'NONE | LOW | MODERATE | HIGH | CRITICAL' },
            confidenceScore: { type: Type.NUMBER, description: 'Confidence between 0 and 100' },
            geotechnicalFeatures: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Observed physical geological features' },
            negativeEvidence: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Evidence explaining why this might NOT be a hazard' },
            estimatedVolumeM3: { type: Type.NUMBER, description: 'Estimated debris volume in cubic meters, or null if not determinable' },
            immediateRisks: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Immediate risks to population or infrastructure' },
            recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Recommended actions' },
            summary: { type: Type.STRING, description: 'Concise 2-3 sentence geotechnical diagnosis' }
          },
          required: ['hazardIdentified', 'severity', 'confidenceScore', 'geotechnicalFeatures', 'negativeEvidence', 'immediateRisks', 'recommendedActions', 'summary']
        }
      }
    });

    const parsedJson = JSON.parse(response.text || '{}');
    return {
      success: true,
      aiLive: true,
      assessment: parsedJson,
      provenance: {
        model: 'gemini-2.5-flash',
        provider: 'Google Gemini Multimodal Vision API',
        timestamp: new Date().toISOString()
      }
    };
  } catch (err: any) {
    console.error('Gemini vision analysis error:', err);
    return { success: false, error: 'AI_ANALYSIS_FAILED', message: err.message };
  }
}
