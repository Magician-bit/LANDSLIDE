import { fetchSeismic } from '../../server/lib/seismic';

export const handler = async () => {
  const result = await fetchSeismic();
  if (result) {
    return { statusCode: 200, body: JSON.stringify(result) };
  }
  return { statusCode: 503, body: JSON.stringify({ error: 'SEISMIC_UNAVAILABLE' }) };
};
