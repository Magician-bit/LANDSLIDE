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

export async function analyzeLandslide(
  imageBase64: string, 
  mimeType: string = 'image/jpeg', 
  locationContext?: string, 
  zoneName?: string, 
  state?: string
) {
  const isKeyConfigured = Boolean(process.env.GEMINI_API_KEY);
  console.log(`[Gemini Vision] API key configured: ${isKeyConfigured}`);

  const ai = getGenAI();
  if (!ai) {
    console.warn('[Gemini Vision] Request aborted: GEMINI_API_KEY environment variable is not configured.');
    return { 
      success: false, 
      aiLive: false, 
      error: 'GEMINI_API_KEY_NOT_CONFIGURED', 
      message: 'Gemini API key is not configured in server environment variables (GEMINI_API_KEY).' 
    };
  }

  try {
    // Strip data URL scheme if present and get raw clean base64
    let cleanMime = mimeType || 'image/jpeg';
    const dataUrlMatch = imageBase64.match(/^data:([^;]+);base64,(.*)$/s);
    let cleanBase64 = imageBase64;
    if (dataUrlMatch) {
      cleanMime = dataUrlMatch[1] || cleanMime;
      cleanBase64 = dataUrlMatch[2];
    } else {
      cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
    }
    cleanBase64 = cleanBase64.trim();

    if (!cleanBase64) {
      console.warn('[Gemini Vision] Request rejected: Empty image payload');
      return {
        success: false,
        error: 'EMPTY_IMAGE_DATA',
        message: 'No image data was provided.'
      };
    }
    
    console.log(`[Gemini Vision] request started | MIME: ${cleanMime} | Base64 Length: ${cleanBase64.length} chars | Location: ${locationContext || zoneName || 'N/A'}`);
    console.log('[Gemini Vision] Calling Gemini 2.5 Flash');

    const prompt = `You are a Senior Geotechnical Engineer and Disaster Response Specialist analyzing the actual photograph supplied by the user.

Determine whether there is visible evidence of a landslide, rockfall, debris flow, slope failure, erosion, road obstruction, or other geotechnical hazard.

Do not assume a landslide exists.

If the scene appears normal, stable, or unrelated to geotechnical hazards (such as an indoor room, normal street, intact roadway, or tranquil landscape), explicitly state that there is no clear visual evidence of a landslide.

Base every conclusion ONLY on what is visibly present in the supplied image.

Do not use the filename, previous images, demo cases, previous analysis, or external assumptions.

Describe the actual visual evidence that led to the assessment.

Provide realistic, non-fabricated assessments:
- If the image is blurry, corrupted, or unreadable, set assessment to "UNCERTAIN" and explain in visibleEvidence.
- Set estimatedVelocity and estimatedVolume strictly to "NOT DETERMINABLE FROM IMAGE" unless there are clear visual measurement markers.
- For normal/benign scenes, assessment must be "NO_CLEAR_LANDSLIDE_EVIDENCE", severity "LOW" or "NONE", and hazardType "NO_VISIBLE_HAZARD".

Respond strictly in JSON according to the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { inlineData: { data: cleanBase64, mimeType: cleanMime } },
        { text: prompt }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assessment: { 
              type: Type.STRING, 
              description: 'Must be one of: NO_CLEAR_LANDSLIDE_EVIDENCE, POSSIBLE_LANDSLIDE, LIKELY_LANDSLIDE, or UNCERTAIN' 
            },
            severity: { 
              type: Type.STRING, 
              description: 'Must be one of: NONE, LOW, MODERATE, HIGH, CRITICAL, or UNCERTAIN' 
            },
            hazardType: { 
              type: Type.STRING, 
              description: 'Specific hazard observed (e.g., Debris Flow, Rockfall, Mudslide, Road Obstruction, Tension Crack, or NO_VISIBLE_HAZARD)' 
            },
            confidence: { 
              type: Type.NUMBER, 
              description: 'Visual assessment confidence score between 0 and 100' 
            },
            visibleEvidence: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: 'Specific physical features visible in the photo (e.g. intact paved road, disturbed vegetation, rock debris on asphalt, etc.)' 
            },
            negativeEvidence: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: 'Visual indicators that rule out active hazards (e.g. intact lane markings, stable vegetation, lack of scarp)' 
            },
            recommendedActions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: 'Realistic operational recommendations based on what is visible' 
            },
            limitations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: 'Geotechnical limitations of 2D single photo analysis' 
            },
            estimatedVelocity: { 
              type: Type.STRING, 
              description: 'Must be "NOT DETERMINABLE FROM IMAGE"' 
            },
            estimatedVolume: { 
              type: Type.STRING, 
              description: 'Must be "NOT DETERMINABLE FROM IMAGE"' 
            }
          },
          required: [
            'assessment', 
            'severity', 
            'hazardType', 
            'confidence', 
            'visibleEvidence', 
            'negativeEvidence', 
            'recommendedActions', 
            'limitations', 
            'estimatedVelocity', 
            'estimatedVolume'
          ]
        }
      }
    });

    const parsedJson = JSON.parse(response.text || '{}');
    console.log(`[Gemini Vision] Gemini response received | Assessment: ${parsedJson.assessment} | Severity: ${parsedJson.severity} | Confidence: ${parsedJson.confidence}`);
    
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
    console.error('[Gemini Vision] Gemini request failed:', err?.message || err);
    return { 
      success: false, 
      error: 'AI_ANALYSIS_FAILED', 
      message: err?.message || 'Gemini Multimodal Vision request failed.' 
    };
  }
}

