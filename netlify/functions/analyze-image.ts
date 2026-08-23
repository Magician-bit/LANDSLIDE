import { analyzeLandslide } from '../../server/lib/ai';

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  
  try {
    const body = JSON.parse(event.body || '{}');
    const result = await analyzeLandslide(
      body.imageBase64, 
      body.mimeType || 'image/jpeg', 
      body.locationContext, 
      body.zoneName, 
      body.state
    );
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
