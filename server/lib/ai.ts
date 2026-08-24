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
    
    // Hash the base64 for debugging
    let hash = 0;
    for (let i = 0; i < cleanBase64.length; i++) {
      hash = Math.imul(31, hash) + cleanBase64.charCodeAt(i) | 0;
    }
    console.log(`[GEMINI REQUEST] Image Hash: ${hash}, MIME: ${mimeType}, Base64 Length: ${cleanBase64.length}`);

    const prompt = `You are a Senior Geotechnical Engineer and Disaster Response Specialist.
You are analyzing the uploaded photograph itself.
Do not assume that the image contains a landslide.
Do not use information from previous images.
Do not use a demo result.
Do not infer the answer from the filename.
Inspect the actual visual content of this image.
Determine whether there is visible evidence consistent with:
- landslide
- rockfall
- debris flow
- mud/debris accumulation
- slope failure
- road obstruction
- erosion
- exposed unstable soil
- normal terrain
- normal roadway
- vegetation-covered stable terrain

If there is no visible evidence of a landslide, say so.
If the image is ambiguous, say UNCERTAIN.
Only report characteristics that are visually supported by the uploaded image.
DO NOT fabricate geotechnical measurements like volume, velocity, slope angle, depth, etc., unless those values can genuinely be determined from the image (which is rare). Otherwise return "NOT DETERMINABLE FROM IMAGE".

Respond strictly in JSON matching the following schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
          { inlineData: { data: cleanBase64, mimeType: mimeType || 'image/jpeg' } },
          { text: prompt }
        ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assessment: { type: Type.STRING, description: 'NO_CLEAR_LANDSLIDE, POSSIBLE_LANDSLIDE, LIKELY_LANDSLIDE, or UNCERTAIN' },
            severity: { type: Type.STRING, description: 'NONE, LOW, MODERATE, HIGH, CRITICAL, or UNCERTAIN' },
            confidence: { type: Type.NUMBER, description: 'Visual assessment confidence between 0 and 100' },
            hazardType: { type: Type.STRING, description: 'Specific geological hazard type identified or NO_VISIBLE_HAZARD' },
            visibleEvidence: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Observed physical geological features actually visible in the image' },
            negativeEvidence: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Evidence explaining why this might NOT be a hazard' },
            estimatedVolume: { type: Type.STRING, description: 'Set to "NOT DETERMINABLE FROM IMAGE" unless actually measurable' },
            estimatedVelocity: { type: Type.STRING, description: 'Set to "NOT DETERMINABLE FROM IMAGE" unless actually measurable' },
            immediateRisks: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Immediate risks to population or infrastructure' },
            recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Recommended actions' },
            summary: { type: Type.STRING, description: 'Concise 2-3 sentence geotechnical diagnosis based ONLY on this image' }
          },
          required: ['assessment', 'severity', 'confidence', 'hazardType', 'visibleEvidence', 'negativeEvidence', 'estimatedVolume', 'estimatedVelocity', 'immediateRisks', 'recommendedActions', 'summary']
        }
      }
    });

    const parsedJson = JSON.parse(response.text || '{}');
    console.log(`[GEMINI RESPONSE] Image Hash: ${hash}, Assessment: ${parsedJson.assessment}`);
    
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
