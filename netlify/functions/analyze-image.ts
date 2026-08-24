import { analyzeLandslide } from '../../server/lib/ai';

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }
  
  try {
    const body = JSON.parse(event.body || '{}');
    const image = body.image || body.imageBase64;
    if (!image) {
      return { 
        statusCode: 400, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'NO_IMAGE_PROVIDED', message: 'No image data provided' }) 
      };
    }

    const result = await analyzeLandslide(
      image, 
      body.mimeType || 'image/jpeg', 
      body.locationContext || '', 
      body.zoneName || '', 
      body.state || ''
    );
    return { 
      statusCode: result.success ? 200 : 500, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result) 
    };
  } catch (e: any) {
    return { 
      statusCode: 500, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'SERVER_ERROR', message: e.message }) 
    };
  }
};

