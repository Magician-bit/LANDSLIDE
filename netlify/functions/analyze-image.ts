import { analyzeLandslide } from '../../server/lib/ai';

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false, 
        error: 'METHOD_NOT_ALLOWED', 
        message: 'Method Not Allowed. Use POST.' 
      }) 
    };
  }
  
  try {
    let body: any = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          success: false, 
          error: 'INVALID_JSON', 
          message: 'Malformed JSON payload.' 
        })
      };
    }

    const rawImage = body.image || body.imageBase64;
    if (!rawImage || typeof rawImage !== 'string' || !rawImage.trim()) {
      return { 
        statusCode: 400, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          success: false, 
          error: 'NO_IMAGE_PROVIDED', 
          message: 'An image (base64 string) is required in the "image" or "imageBase64" field.' 
        }) 
      };
    }

    let mimeType = body.mimeType || 'image/jpeg';
    const match = rawImage.match(/^data:([^;]+);base64,/);
    if (match) {
      mimeType = match[1];
    }

    const result = await analyzeLandslide(
      rawImage, 
      mimeType, 
      body.locationContext || '', 
      body.zoneName || '', 
      body.state || ''
    );

    let statusCode = 200;
    if (!result.success) {
      if (result.error === 'GEMINI_API_KEY_NOT_CONFIGURED') {
        statusCode = 503;
      } else if (result.error === 'EMPTY_IMAGE_DATA') {
        statusCode = 400;
      } else {
        statusCode = 500;
      }
    }

    return { 
      statusCode, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result) 
    };
  } catch (e: any) {
    return { 
      statusCode: 500, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false, 
        error: 'SERVER_ERROR', 
        message: e?.message || 'Internal server error occurred.' 
      }) 
    };
  }
};


