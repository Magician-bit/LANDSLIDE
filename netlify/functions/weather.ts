import { fetchWeather } from '../../server/lib/weather';

export const handler = async (event: any) => {
  const lat = parseFloat(event.queryStringParameters?.lat || '');
  const lon = parseFloat(event.queryStringParameters?.lon || '');
  
  if (isNaN(lat) || isNaN(lon)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'lat and lon are required' }) };
  }

  const result = await fetchWeather(lat, lon);
  if (result) {
    return { statusCode: 200, body: JSON.stringify(result) };
  }
  
  return { statusCode: 503, body: JSON.stringify({ error: 'WEATHER_UNAVAILABLE' }) };
};
